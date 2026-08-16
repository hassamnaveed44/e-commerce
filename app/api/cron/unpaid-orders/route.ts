import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    // Optional: Validate Vercel Cron Secret in production
    const authHeader = req.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 24 hours ago timestamp
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. Find all stale unpaid orders older than 24 hours
    const staleOrders = await prisma.order.findMany({
      where: {
        orderStatus: OrderStatus.PENDING_PAYMENT,
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
      include: {
        items: true,
      },
    });

    if (staleOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No stale unpaid orders found.",
        cancelledCount: 0,
      });
    }

    let restoredItemsCount = 0;

    // 2. Cancel orders and restore variant stock in an atomic transaction
    await prisma.$transaction(async (tx) => {
      for (const order of staleOrders) {
        // Mark order as CANCELLED
        await tx.order.update({
          where: { id: order.id },
          data: { orderStatus: OrderStatus.CANCELLED },
        });

        // Restore stock quantities for each order item
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          });
          restoredItemsCount += item.quantity;
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully cancelled ${staleOrders.length} expired unpaid orders and restored ${restoredItemsCount} inventory items.`,
      cancelledCount: staleOrders.length,
      restoredItemsCount,
    });
  } catch (error) {
    console.error("Cron unpaid orders sweep error:", error);
    return NextResponse.json(
      { success: false, message: "Cron job failed" },
      { status: 500 }
    );
  }
}

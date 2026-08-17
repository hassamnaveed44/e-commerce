import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/services/order.service";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = req.nextUrl.searchParams.get("sessionId") || req.nextUrl.searchParams.get("session_id");

    let order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // If Stripe session is passed and order is in PENDING_PAYMENT state, verify with Stripe and confirm immediately
    if (sessionId && sessionId.startsWith("cs_") && (order.orderStatus === "PENDING_PAYMENT" || order.payment?.status === "PENDING")) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session && session.payment_status === "paid") {
          // 1. Update order status to PROCESSING
          await prisma.order.update({
            where: { id: order.id },
            data: { orderStatus: "PROCESSING" },
          });

          // 2. Update payment status to SUCCESSFUL
          if (order.payment) {
            await prisma.payment.update({
              where: { id: order.payment.id },
              data: {
                status: "SUCCESSFUL",
                transactionId: (session.payment_intent as string) || session.id,
              },
            });
          }

          // 3. Reload updated order
          const updatedOrder = await getOrderById(id);
          if (updatedOrder) {
            order = updatedOrder;
          }
        }
      } catch (stripeErr) {
        console.error("Error retrieving Stripe session in order confirmation:", stripeErr);
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

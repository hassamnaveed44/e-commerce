import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createOrder, getUserOrders } from "@/services/order.service";

// POST /api/orders - Place a new order
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    const body = await req.json();

    const order = await createOrder({
      userId: clerkId || undefined,
      ...body,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentMethod: body.paymentMethod,
    });
  } catch (error: unknown) {
    console.error("Order creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to place order";
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

// GET /api/orders - Get user's order history
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const orders = await getUserOrders(clerkId);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Fetch user orders error:", error);
    return NextResponse.json({ success: false, orders: [] }, { status: 500 });
  }
}

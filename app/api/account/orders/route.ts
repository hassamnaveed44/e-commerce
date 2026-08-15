import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserOrders } from "@/services/order.service";

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

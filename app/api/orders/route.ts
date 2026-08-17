import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createOrder, getUserOrders } from "@/services/order.service";
import { sendOrderNotificationEmail } from "@/services/email.service";

// POST /api/orders - Place a new order
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    const body = await req.json();

    const order = await createOrder({
      userId: clerkId || undefined,
      ...body,
    });

    // Trigger non-blocking order confirmation email
    if (body.email && !body.email.includes("@guest.shop.co")) {
      const emailData = {
        orderNumber: order.orderNumber,
        customerName: body.customerName || "Customer",
        customerEmail: body.email,
        customerPhone: body.phone || "",
        orderDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        orderStatus: "PROCESSING",
        paymentMethod: body.paymentMethod === "COD" ? "Cash on Delivery" : "Credit Card",
        paymentStatus: body.paymentMethod === "COD" ? "PENDING" : "SUCCESSFUL",
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        discount: Math.max(0, Number(order.subtotal) + Number(order.deliveryFee) - Number(order.totalAmount)),
        totalAmount: Number(order.totalAmount),
        shippingAddress: {
          street: body.street || "",
          city: body.city || "",
          state: body.state || "",
          postalCode: body.postalCode || "",
          country: body.country || "United States",
          phone: body.phone || "",
        },
        items: (body.items || []).map((i: any) => ({
          name: i.name || "Apparel Item",
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          unitPrice: Number(i.price || 0),
        })),
      };

      sendOrderNotificationEmail({
        order: emailData,
        type: "CONFIRMATION",
      }).catch((e) => console.error("Order creation email error:", e));
    }

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

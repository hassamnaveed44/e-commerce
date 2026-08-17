import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/services/order.service";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendOrderNotificationEmail } from "@/services/email.service";

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

            // 4. Trigger Confirmation Email asynchronously
            const email = order.user?.email;
            if (email && !email.includes("@guest.shop.co")) {
              sendOrderNotificationEmail({
                order: {
                  orderNumber: order.orderNumber,
                  customerName: order.user?.fullName || "Customer",
                  customerEmail: email,
                  customerPhone: order.shippingAddress?.phoneNumber || "",
                  orderDate: new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
                  orderStatus: "PROCESSING",
                  paymentMethod: "Credit Card (Stripe)",
                  paymentStatus: "SUCCESSFUL",
                  transactionId: (session.payment_intent as string) || session.id,
                  subtotal: Number(order.subtotal),
                  deliveryFee: Number(order.deliveryFee),
                  discount: Math.max(0, Number(order.subtotal) + Number(order.deliveryFee) - Number(order.totalAmount)),
                  totalAmount: Number(order.totalAmount),
                  shippingAddress: {
                    street: order.shippingAddress?.streetAddress || "",
                    city: order.shippingAddress?.city || "",
                    state: order.shippingAddress?.state || "",
                    postalCode: order.shippingAddress?.postalCode || "",
                    country: order.shippingAddress?.country || "United States",
                    phone: order.shippingAddress?.phoneNumber || "",
                  },
                  items: (order.items || []).map((i: any) => ({
                    name: i.productName,
                    size: i.variant?.size,
                    color: i.variant?.colorName,
                    quantity: i.quantity,
                    unitPrice: Number(i.unitPrice),
                  })),
                },
                type: "CONFIRMATION",
              }).catch((e) => console.error("Confirmation email dispatch error:", e));
            }
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

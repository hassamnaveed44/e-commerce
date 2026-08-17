import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { sendOrderNotificationEmail } from "@/services/email.service";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("Stripe Webhook Error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        await prisma.$transaction([
          // Update Order Status to PROCESSING
          prisma.order.update({
            where: { id: orderId },
            data: {
              orderStatus: OrderStatus.PROCESSING,
            },
          }),
          // Update Payment Status to SUCCESSFUL and attach Stripe transaction ID
          prisma.payment.update({
            where: { orderId: orderId },
            data: {
              status: PaymentStatus.SUCCESSFUL,
              transactionId: typeof session.payment_intent === "string" ? session.payment_intent : session.id,
            },
          }),
        ]);

        console.log(`✅ Order ${orderId} successfully marked as PAID via Stripe.`);

        // Trigger confirmation email
        const fullOrder = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            user: true,
            shippingAddress: true,
            items: true,
          },
        });

        if (fullOrder && fullOrder.user?.email && !fullOrder.user.email.includes("@guest.shop.co")) {
          sendOrderNotificationEmail({
            order: {
              orderNumber: fullOrder.orderNumber,
              customerName: fullOrder.user.fullName || "Customer",
              customerEmail: fullOrder.user.email,
              customerPhone: fullOrder.shippingAddress?.phoneNumber || "",
              orderDate: new Date(fullOrder.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
              orderStatus: "PROCESSING",
              paymentMethod: "Credit Card (Stripe)",
              paymentStatus: "SUCCESSFUL",
              transactionId: typeof session.payment_intent === "string" ? session.payment_intent : session.id,
              subtotal: Number(fullOrder.subtotal),
              deliveryFee: Number(fullOrder.deliveryFee),
              discount: Math.max(0, Number(fullOrder.subtotal) + Number(fullOrder.deliveryFee) - Number(fullOrder.totalAmount)),
              totalAmount: Number(fullOrder.totalAmount),
              shippingAddress: {
                street: fullOrder.shippingAddress?.streetAddress || "",
                city: fullOrder.shippingAddress?.city || "",
                state: fullOrder.shippingAddress?.state || "",
                postalCode: fullOrder.shippingAddress?.postalCode || "",
                country: fullOrder.shippingAddress?.country || "United States",
                phone: fullOrder.shippingAddress?.phoneNumber || "",
              },
              items: (fullOrder.items || []).map((i) => ({
                name: i.productName,
                quantity: i.quantity,
                unitPrice: Number(i.unitPrice),
              })),
            },
            type: "CONFIRMATION",
          }).catch((e) => console.error("Webhook confirmation email dispatch error:", e));
        }
      } catch (dbErr) {
        console.error("Database update error on Stripe webhook:", dbErr);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}

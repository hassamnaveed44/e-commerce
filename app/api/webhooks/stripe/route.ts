import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { OrderStatus, PaymentStatus } from "@prisma/client";
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
      } catch (dbErr) {
        console.error("Database update error on Stripe webhook:", dbErr);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}

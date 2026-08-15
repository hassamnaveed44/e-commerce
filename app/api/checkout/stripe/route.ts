import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { createOrder } from "@/services/order.service";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    const body = await req.json();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 1. Create order in PostgreSQL in PENDING_PAYMENT state
    const order = await createOrder({
      userId: clerkId || undefined,
      ...body,
      paymentMethod: "CARD",
    });

    // 2. Format line items for Stripe Checkout
    const lineItems = body.items.map((item: { name?: string; price?: number; quantity: number }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name || "SHOP.CO Apparel Item",
        },
        unit_amount: Math.round((item.price || 50) * 100), // amount in cents
      },
      quantity: item.quantity,
    }));

    // 3. Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems.length > 0 ? lineItems : [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Order ${order.orderNumber}` },
            unit_amount: Math.round(Number(order.totalAmount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: body.email,
      success_url: `${appUrl}/order-confirmation?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error: unknown) {
    console.error("Stripe session creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to create Stripe session";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

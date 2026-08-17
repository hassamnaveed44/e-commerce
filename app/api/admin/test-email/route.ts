import { NextRequest, NextResponse } from "next/server";
import { getTransporter, sendOrderNotificationEmail } from "@/services/email.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetEmail = body.email || process.env.SMTP_USER;

    if (!targetEmail) {
      return NextResponse.json({
        success: false,
        error: "No recipient email provided, and SMTP_USER is not defined in environment.",
      }, { status: 400 });
    }

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const hasPass = Boolean(process.env.SMTP_PASS || process.env.SMTP_PASSWORD);

    const transporter = getTransporter();

    if (!transporter) {
      return NextResponse.json({
        success: false,
        error: "SMTP transporter could not be initialized. Missing SMTP_HOST, SMTP_USER, or SMTP_PASS.",
        envStatus: {
          SMTP_HOST: host || "(missing)",
          SMTP_USER: user || "(missing)",
          SMTP_PASS: hasPass ? "(configured)" : "(missing)",
        },
      }, { status: 500 });
    }

    // Verify SMTP connection
    try {
      await transporter.verify();
    } catch (verifyErr: any) {
      return NextResponse.json({
        success: false,
        error: `SMTP connection verification failed: ${verifyErr?.message || verifyErr}`,
        envStatus: {
          SMTP_HOST: host,
          SMTP_USER: user,
          SMTP_PASS: hasPass ? "(configured)" : "(missing)",
        },
      }, { status: 500 });
    }

    // Send a live test email
    const result = await sendOrderNotificationEmail({
      order: {
        orderNumber: "TEST-001",
        customerName: "Shop.Co Administrator",
        customerEmail: targetEmail,
        orderDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        orderStatus: "PROCESSING",
        paymentMethod: "Test Payment",
        subtotal: 100,
        deliveryFee: 0,
        totalAmount: 100,
        shippingAddress: {
          street: "123 Fashion Ave",
          city: "New York",
          postalCode: "10001",
        },
        items: [
          {
            name: "Test Email Product Verification",
            quantity: 1,
            unitPrice: 100,
          },
        ],
      },
      type: "CONFIRMATION",
    });

    return NextResponse.json({
      success: true,
      message: `Test email successfully dispatched to ${targetEmail}`,
      details: result,
    });
  } catch (err: any) {
    console.error("Test email API error:", err);
    return NextResponse.json({
      success: false,
      error: err?.message || String(err),
    }, { status: 500 });
  }
}

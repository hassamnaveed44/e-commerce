import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/services/order.service";
import { sendOrderNotificationEmail } from "@/services/email.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const email = order.user?.email || (order as any).customerEmail;
    if (!email) {
      return NextResponse.json({ success: false, message: "No email associated with this order" }, { status: 400 });
    }

    const emailData = {
      orderNumber: order.orderNumber,
      customerName: order.user?.fullName || "Customer",
      customerEmail: email,
      customerPhone: order.shippingAddress?.phoneNumber || "",
      orderDate: new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod === "CARD" ? "Credit Card (Stripe)" : "Cash on Delivery",
      paymentStatus: order.payment?.status || (order.orderStatus === "PROCESSING" ? "SUCCESSFUL" : "PENDING"),
      transactionId: order.payment?.transactionId || undefined,
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
    };

    const result = await sendOrderNotificationEmail({
      order: emailData,
      type: "CONFIRMATION",
    });

    if (result.success) {
      if ((result as any).preview) {
        return NextResponse.json({
          success: true,
          preview: true,
          message: "Email preview logged (Configure SMTP environment variables for inbox delivery)",
        });
      }
      return NextResponse.json({
        success: true,
        message: `Official invoice delivered to ${email}`,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: (result as any).error || (result as any).reason || "Could not send email",
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Resend email error:", error);
    return NextResponse.json({ success: false, message: "Failed to resend order email" }, { status: 500 });
  }
}

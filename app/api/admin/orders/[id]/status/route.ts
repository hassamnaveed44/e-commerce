import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { sendOrderNotificationEmail } from "@/services/email.service";

const VALID_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED_REFUSED",
];

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await context.params;
    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        payment: true,
        items: true,
        shippingAddress: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: status as OrderStatus,
      },
      include: {
        user: true,
        payment: true,
        items: true,
        shippingAddress: true,
      },
    });

    // If order was delivered or paid, update payment status if needed
    if (status === "DELIVERED" && existingOrder.payment && existingOrder.payment.status !== "SUCCESSFUL") {
      await prisma.payment.update({
        where: { id: existingOrder.payment.id },
        data: { status: "SUCCESSFUL" },
      });
    }

    // Trigger Non-Blocking Customer Status Update Email
    const customerEmail = updatedOrder.user?.email;
    if (customerEmail && !customerEmail.includes("@guest.shop.co")) {
      const emailPayload = {
        orderNumber: updatedOrder.orderNumber,
        customerName: updatedOrder.user?.fullName || "Customer",
        customerEmail,
        customerPhone: updatedOrder.shippingAddress?.phoneNumber || "",
        orderDate: new Date(updatedOrder.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        orderStatus: status,
        paymentMethod: updatedOrder.paymentMethod === "CARD" ? "Credit Card (Stripe)" : "Cash on Delivery",
        paymentStatus: updatedOrder.payment?.status || (status === "DELIVERED" ? "SUCCESSFUL" : "PENDING"),
        transactionId: updatedOrder.payment?.transactionId || undefined,
        subtotal: Number(updatedOrder.subtotal),
        deliveryFee: Number(updatedOrder.deliveryFee),
        discount: Math.max(0, Number(updatedOrder.subtotal) + Number(updatedOrder.deliveryFee) - Number(updatedOrder.totalAmount)),
        totalAmount: Number(updatedOrder.totalAmount),
        shippingAddress: {
          street: updatedOrder.shippingAddress?.streetAddress || "",
          city: updatedOrder.shippingAddress?.city || "",
          state: updatedOrder.shippingAddress?.state || "",
          postalCode: updatedOrder.shippingAddress?.postalCode || "",
          country: updatedOrder.shippingAddress?.country || "United States",
          phone: updatedOrder.shippingAddress?.phoneNumber || "",
        },
        items: (updatedOrder.items || []).map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
        })),
      };

      sendOrderNotificationEmail({
        order: emailPayload,
        type: "STATUS_UPDATE",
        newStatus: status,
        previousStatus: existingOrder.orderStatus,
      }).catch((err) => console.error("Async status email dispatch error:", err));
    }

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.orderStatus,
      },
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

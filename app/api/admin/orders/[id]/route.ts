import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { sendOrderNotificationEmail } from "@/services/email.service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        user: true,
        shippingAddress: true,
        payment: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const customerName = order.user?.fullName || order.user?.email.split("@")[0] || "Customer";
    const customerEmail = order.user?.email || "customer@example.com";

    const formattedItems = order.items.map((item) => {
      const primaryImage =
        item.variant?.product?.images?.[0]?.url || "/images/product-1.png";

      return {
        id: item.id,
        productVariantId: item.productVariantId,
        productId: item.variant?.productId || null,
        productName: item.productName,
        productSlug: item.variant?.product?.slug || null,
        productImage: primaryImage,
        size: item.variant?.size || "Standard",
        colorName: item.variant?.colorName || "Default",
        colorHex: item.variant?.colorHex || "#000000",
        sku: item.variant?.sku || "N/A",
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        totalPrice: Number(item.unitPrice) * item.quantity,
      };
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        totalAmount: Number(order.totalAmount),
        customer: {
          id: order.user?.id || null,
          name: customerName,
          email: customerEmail,
          phone: order.shippingAddress?.phoneNumber || null,
        },
        shippingAddress: order.shippingAddress,
        payment: order.payment
          ? {
              id: order.payment.id,
              status: order.payment.status,
              amountPaid: Number(order.payment.amountPaid),
              transactionId: order.payment.transactionId,
              paymentMethod: order.payment.paymentMethod,
            }
          : null,
        itemsCount: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
        items: formattedItems,
      },
    });
  } catch (error) {
    console.error("Get single order error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { status, paymentStatus } = body;

    if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${Object.values(OrderStatus).join(", ")}` },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: {
        payment: true,
        items: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const previousStatus = existingOrder.orderStatus;
    const newStatus = status as OrderStatus;

    // Update inside atomic transaction (with automatic restocking on cancel)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Order Status
      const updated = await tx.order.update({
        where: { id: existingOrder.id },
        data: {
          orderStatus: newStatus,
        },
      });

      // 2. If status was changed to CANCELLED and was not previously cancelled, restock variants
      if (
        (newStatus === "CANCELLED" || newStatus === "RETURNED_REFUSED") &&
        previousStatus !== "CANCELLED" &&
        previousStatus !== "RETURNED_REFUSED"
      ) {
        for (const item of existingOrder.items) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: {
              stockQuantity: { increment: item.quantity },
            },
          });
        }
      }

      // 3. If delivered, ensure payment is marked SUCCESSFUL if COD
      if (newStatus === "DELIVERED" && existingOrder.payment && existingOrder.payment.status !== "SUCCESSFUL") {
        await tx.payment.update({
          where: { id: existingOrder.payment.id },
          data: { status: "SUCCESSFUL" },
        });
      }

      // 4. If explicit paymentStatus was provided, update payment
      if (paymentStatus && existingOrder.payment) {
        await tx.payment.update({
          where: { id: existingOrder.payment.id },
          data: { status: paymentStatus },
        });
      }

      return updated;
    });

    // Revalidate paths
    try {
      revalidatePath("/admin/orders");
      revalidatePath("/admin");
      revalidatePath("/admin/inventory");
      revalidatePath("/orders");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    // Trigger Non-Blocking Customer Status Update Email
    try {
      const fullOrder = await prisma.order.findUnique({
        where: { id: result.id },
        include: {
          user: true,
          shippingAddress: true,
          payment: true,
          items: true,
        },
      });

      const customerEmail = fullOrder?.user?.email;
      if (customerEmail && !customerEmail.includes("@guest.shop.co")) {
        const emailPayload = {
          orderNumber: fullOrder.orderNumber,
          customerName: fullOrder.user?.fullName || "Customer",
          customerEmail,
          customerPhone: fullOrder.shippingAddress?.phoneNumber || "",
          orderDate: new Date(fullOrder.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          orderStatus: newStatus,
          paymentMethod: fullOrder.paymentMethod === "CARD" ? "Credit Card (Stripe)" : "Cash on Delivery",
          paymentStatus: fullOrder.payment?.status || (newStatus === "DELIVERED" ? "SUCCESSFUL" : "PENDING"),
          transactionId: fullOrder.payment?.transactionId || undefined,
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
        };

        sendOrderNotificationEmail({
          order: emailPayload,
          type: "STATUS_UPDATE",
          newStatus,
          previousStatus,
        }).catch((err) => console.error("Admin order update async email dispatch error:", err));
      }
    } catch (emailErr) {
      console.error("Failed to prepare admin order email notification:", emailErr);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: result.id,
        orderNumber: result.orderNumber,
        status: result.orderStatus,
      },
      message: `Order status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update order status" }, { status: 500 });
  }
}

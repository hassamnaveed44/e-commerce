import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { OrderStatus, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase();
    const status = searchParams.get("status") || "ALL";
    const sort = searchParams.get("sort") || "newest";

    // 1. Fetch overview summary stats across ALL orders
    const [allOrders, statusCounts] = await Promise.all([
      prisma.order.findMany({
        select: {
          id: true,
          totalAmount: true,
          orderStatus: true,
        },
      }),
      prisma.order.groupBy({
        by: ["orderStatus"],
        _count: { _all: true },
      }),
    ]);

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders
      .filter((o) => o.orderStatus !== "CANCELLED" && o.orderStatus !== "RETURNED_REFUSED")
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const countsMap: Record<string, number> = {};
    statusCounts.forEach((sc) => {
      countsMap[sc.orderStatus] = sc._count._all;
    });

    // 2. Build Where Filter
    const where: Prisma.OrderWhereInput = {};

    if (status !== "ALL" && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.orderStatus = status as OrderStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { shippingAddress: { city: { contains: search, mode: "insensitive" } } },
        { shippingAddress: { streetAddress: { contains: search, mode: "insensitive" } } },
        { items: { some: { productName: { contains: search, mode: "insensitive" } } } },
      ];
    }

    // 3. Build Sort Order
    let orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    else if (sort === "amount-high") orderBy = { totalAmount: "desc" };
    else if (sort === "amount-low") orderBy = { totalAmount: "asc" };

    // 4. Fetch orders with relations
    const orders = await prisma.order.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        shippingAddress: true,
        payment: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 },
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const formattedOrders = orders.map((o) => {
      const customerName = o.user?.fullName || o.user?.email.split("@")[0] || "Customer";
      const customerEmail = o.user?.email || "customer@example.com";
      const customerPhone = o.shippingAddress?.phoneNumber || null;

      const formattedItems = o.items.map((item) => {
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

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        orderStatus: o.orderStatus,
        paymentMethod: o.paymentMethod,
        subtotal: Number(o.subtotal),
        deliveryFee: Number(o.deliveryFee),
        totalAmount: Number(o.totalAmount),
        customer: {
          id: o.user?.id || null,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        shippingAddress: o.shippingAddress
          ? {
              fullName: customerName,
              streetAddress: o.shippingAddress.streetAddress,
              city: o.shippingAddress.city,
              state: o.shippingAddress.state,
              postalCode: o.shippingAddress.postalCode,
              country: o.shippingAddress.country,
              phone: o.shippingAddress.phoneNumber,
            }
          : null,
        payment: o.payment
          ? {
              id: o.payment.id,
              status: o.payment.status,
              amountPaid: Number(o.payment.amountPaid),
              transactionId: o.payment.transactionId,
              paymentMethod: o.payment.paymentMethod,
            }
          : null,
        itemsCount: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
        items: formattedItems,
      };
    });

    return NextResponse.json({
      success: true,
      overview: {
        totalOrders,
        totalRevenue,
        pendingPaymentCount: countsMap["PENDING_PAYMENT"] || 0,
        processingCount: countsMap["PROCESSING"] || 0,
        shippedCount: countsMap["SHIPPED"] || 0,
        deliveredCount: countsMap["DELIVERED"] || 0,
        cancelledCount: (countsMap["CANCELLED"] || 0) + (countsMap["RETURNED_REFUSED"] || 0),
      },
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Admin get orders error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

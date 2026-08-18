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
          categoryName: item.variant?.product?.category?.name || "Apparel",
          size: item.variant?.size || "Standard",
          colorName: item.variant?.colorName || "Default",
          colorHex: item.variant?.colorHex || "#000000",
          sku: item.variant?.sku || "N/A",
          unitPrice: Number(item.unitPrice),
          quantity: item.quantity,
          totalPrice: Number(item.unitPrice) * item.quantity,
        };
      });

      const firstItem = formattedItems[0] || {
        productName: "Fashion Apparel",
        productImage: "/images/product-1.png",
        categoryName: "Apparel",
      };

      // Type: Sale vs Return
      const isReturn = o.orderStatus === "RETURNED_REFUSED" || o.payment?.status === "REFUNDED";

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        numericId: `#${o.orderNumber.replace(/[^0-9]/g, "").slice(-5) || o.id.slice(-5)}`,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        orderStatus: o.orderStatus,
        paymentMethod: o.paymentMethod,
        subtotal: Number(o.subtotal),
        deliveryFee: Number(o.deliveryFee),
        totalAmount: Number(o.totalAmount),
        type: isReturn ? "Return" : "Sale",
        productName: firstItem.productName,
        productImage: firstItem.productImage,
        categoryName: firstItem.categoryName,
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

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, orderStatus } = body;

    if (!orderId || !orderStatus) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: orderStatus as OrderStatus },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Admin update order error:", error);
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { customerName, customerEmail, productName, totalAmount, paymentMethod, orderStatus } = body;

    if (!customerName || !customerEmail || !totalAmount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { email: customerEmail },
      include: { addresses: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: `manual_${Date.now()}`,
          email: customerEmail,
          fullName: customerName,
          addresses: {
            create: {
              streetAddress: "123 Fashion Blvd",
              city: "New York",
              state: "NY",
              postalCode: "10001",
              country: "United States",
              phoneNumber: "+1 555-0199",
              isDefault: true,
            },
          },
        },
        include: { addresses: true },
      });
    }

    let addressId = user?.addresses[0]?.id;
    if (!addressId && user) {
      const address = await prisma.address.create({
        data: {
          userId: user.id,
          streetAddress: "123 Fashion Blvd",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "United States",
          phoneNumber: "+1 555-0199",
          isDefault: true,
        },
      });
      addressId = address.id;
    }

    if (!user || !addressId) {
      return NextResponse.json({ success: false, error: "Failed to initialize user address" }, { status: 500 });
    }

    // Find any product variant
    const variant = await prisma.productVariant.findFirst({
      include: { product: true },
    });

    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        shippingAddressId: addressId,
        orderNumber,
        orderStatus: (orderStatus as OrderStatus) || "PENDING_PAYMENT",
        paymentMethod: paymentMethod === "CARD" ? "CARD" : "COD",
        subtotal: parseFloat(totalAmount),
        deliveryFee: 0,
        totalAmount: parseFloat(totalAmount),
        items: variant
          ? {
              create: [
                {
                  productVariantId: variant.id,
                  productName: productName || variant.product.name,
                  unitPrice: parseFloat(totalAmount),
                  quantity: 1,
                },
              ],
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Admin create order error:", error);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}

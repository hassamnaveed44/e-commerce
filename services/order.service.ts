import { prisma } from "@/lib/db";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export interface CreateOrderInput {
  userId?: string;
  customerName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country?: string;
  paymentMethod: "COD" | "CARD";
  shippingMethod: "standard" | "express";
  promoCode?: string;
  items: {
    variantId: string;
    quantity: number;
  }[];
}

export async function createOrder(data: CreateOrderInput) {
  const {
    userId: clerkId,
    customerName,
    email,
    phone,
    street,
    city,
    state = "N/A",
    postalCode,
    country = "United States",
    paymentMethod,
    shippingMethod,
    promoCode,
    items,
  } = data;

  if (!items || items.length === 0) {
    throw new Error("Cannot place an order with an empty cart");
  }

  // Execute entire order creation within an optimized Prisma Transaction with 25s timeout
  return await prisma.$transaction(
    async (tx) => {
      // 1. Find or create User record
      let dbUser = null;
      if (clerkId) {
        dbUser = await tx.user.findUnique({ where: { clerkId } });
      }

      if (!dbUser) {
        const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const guestClerkId = clerkId || `guest_${uniqueSuffix}`;
        const guestEmail = email || `guest_${uniqueSuffix}@guest.shop.co`;

        dbUser = await tx.user.create({
          data: {
            clerkId: guestClerkId,
            email: guestEmail,
            fullName: customerName,
          },
        });
      }

      // 2. COD Block Check
      if (paymentMethod === "COD" && dbUser.isCodBlocked) {
        throw new Error(
          "Cash on Delivery is unavailable for this account due to previous unreceived deliveries. Please use Card payment."
        );
      }

      // 3. Batch fetch all product variants in 1 fast query instead of looping
      const variantIds = items.map((i) => i.variantId);
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      });

      const variantMap = new Map(variants.map((v) => [v.id, v]));

      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const variant = variantMap.get(item.variantId);
        if (!variant) {
          throw new Error("One or more selected items no longer exist.");
        }

        if (variant.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${variant.product.name}" (${variant.size} - ${variant.colorName}). Only ${variant.stockQuantity} remaining.`
          );
        }

        const itemPrice = Number(variant.product.price);
        subtotal += itemPrice * item.quantity;

        orderItemsData.push({
          productVariantId: variant.id,
          productName: `${variant.product.name} (${variant.colorName} / ${variant.size})`,
          unitPrice: itemPrice,
          quantity: item.quantity,
        });
      }

      // 4. Create Shipping Address & decrement stock in parallel
      const [address] = await Promise.all([
        tx.address.create({
          data: {
            userId: dbUser.id,
            streetAddress: street,
            city,
            state,
            postalCode,
            country,
            phoneNumber: phone,
          },
        }),
        ...items.map((item) =>
          tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          })
        ),
      ]);

      // 5. Calculate discounts & delivery fees
      let discountAmount = 0;
      if (promoCode) {
        const cleaned = promoCode.trim().toUpperCase();
        if (cleaned === "SHOP20" || cleaned === "DISCOUNT20") {
          discountAmount = (subtotal * 20) / 100;
        } else if (cleaned === "SHOP10") {
          discountAmount = (subtotal * 10) / 100;
        }
      }

      const deliveryFee = shippingMethod === "express" ? 25 : subtotal >= 100 ? 0 : 15;
      const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

      // 6. Generate Unique Order Number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      const mappedPaymentMethod = paymentMethod === "CARD" ? PaymentMethod.CARD : PaymentMethod.COD;
      const mappedOrderStatus =
        paymentMethod === "COD" ? OrderStatus.PROCESSING : OrderStatus.PENDING_PAYMENT;

      // 7. Create Order Record
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: dbUser.id,
          shippingAddressId: address.id,
          orderStatus: mappedOrderStatus,
          paymentMethod: mappedPaymentMethod,
          subtotal,
          deliveryFee,
          totalAmount,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
          shippingAddress: true,
        },
      });

      // 8. Create Payment Record & clear cart in parallel
      await Promise.all([
        tx.payment.create({
          data: {
            orderId: order.id,
            paymentMethod: paymentMethod,
            status: PaymentStatus.PENDING,
            amountPaid: totalAmount,
          },
        }),
        tx.cartItem.deleteMany({
          where: { userId: dbUser.id },
        }),
      ]);

      return order;
    },
    {
      maxWait: 10000, // 10s max connection acquisition
      timeout: 25000, // 25s transaction execution timeout
    }
  );
}

export async function getOrderById(orderId: string) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: orderId }, { orderNumber: orderId }],
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
      shippingAddress: true,
      payment: true,
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!order) return null;

  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    payment: order.payment
      ? {
          ...order.payment,
          amountPaid: Number(order.payment.amountPaid),
        }
      : null,
    items: order.items.map((i) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      image: i.variant?.product?.images[0]?.url || "/images/product-1.png",
    })),
  };
}

export async function getUserOrders(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) return [];

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
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
      shippingAddress: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => {
    const subtotal = Number(order.subtotal);
    const deliveryFee = Number(order.deliveryFee);
    const totalAmount = Number(order.totalAmount);
    const discount = Math.max(0, subtotal + deliveryFee - totalAmount);

    return {
      id: order.orderNumber,
      orderId: order.id,
      date: new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: new Date(order.createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      customerName: user.fullName || user.email.split("@")[0],
      customerEmail: user.email,
      customerPhone: order.shippingAddress.phoneNumber || "",
      subtotal,
      deliveryFee,
      discount,
      total: totalAmount,
      status: order.orderStatus,
      paymentMethod: order.paymentMethod === "CARD" ? "Credit Card (Stripe)" : "Cash on Delivery",
      paymentStatus: order.payment?.status || (order.orderStatus === "PROCESSING" ? "SUCCESSFUL" : "PENDING"),
      transactionId: order.payment?.transactionId || undefined,
      shippingAddress: {
        street: order.shippingAddress.streetAddress,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
        phone: order.shippingAddress.phoneNumber,
        formatted: `${order.shippingAddress.streetAddress}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`,
      },
      items: order.items.map((i) => ({
        id: i.id,
        name: i.productName,
        size: i.variant?.size || "Standard",
        color: i.variant?.colorName || "Standard",
        qty: i.quantity,
        price: Number(i.unitPrice),
        image: i.variant?.product?.images[0]?.url || "/images/product-1.png",
      })),
    };
  });
}

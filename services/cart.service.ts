import { prisma } from "@/lib/db";

export interface CartItemDto {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  colorName: string;
  colorHex: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number;
  quantity: number;
  stockQuantity: number;
}

export async function getCartItems(identifier: {
  userId?: string;
  sessionToken?: string;
}): Promise<CartItemDto[]> {
  const { userId, sessionToken } = identifier;
  if (!userId && !sessionToken) return [];

  const items = await prisma.cartItem.findMany({
    where: userId ? { userId } : { sessionToken },
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
    orderBy: { createdAt: "desc" },
  });

  return items.map((item) => {
    const product = item.variant.product;
    const primaryImg = product.images[0]?.url || "/images/product-1.png";

    return {
      id: item.id,
      variantId: item.productVariantId,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: primaryImg,
      size: item.variant.size,
      colorName: item.variant.colorName,
      colorHex: item.variant.colorHex,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      discountPercent: product.discountPercent,
      quantity: item.quantity,
      stockQuantity: item.variant.stockQuantity,
    };
  });
}

export async function addItemToCart(data: {
  userId?: string;
  sessionToken?: string;
  variantId: string;
  quantity: number;
}) {
  const { userId, sessionToken, variantId, quantity } = data;
  if (!userId && !sessionToken) throw new Error("Identifier required");

  // Check variant stock
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });
  if (!variant) throw new Error("Variant not found");

  // Find existing cart item for this variant
  const existing = await prisma.cartItem.findFirst({
    where: {
      productVariantId: variantId,
      ...(userId ? { userId } : { sessionToken }),
    },
  });

  if (existing) {
    const newQty = Math.min(existing.quantity + quantity, variant.stockQuantity);
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  }

  const initialQty = Math.min(quantity, variant.stockQuantity);
  return prisma.cartItem.create({
    data: {
      userId,
      sessionToken,
      productVariantId: variantId,
      quantity: initialQty,
    },
  });
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    return prisma.cartItem.delete({ where: { id: cartItemId } });
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { variant: true },
  });

  if (!item) throw new Error("Cart item not found");
  const cappedQty = Math.min(quantity, item.variant.stockQuantity);

  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: cappedQty },
  });
}

export async function deleteCartItem(cartItemId: string) {
  return prisma.cartItem.delete({ where: { id: cartItemId } });
}

export async function syncGuestCart(userId: string, guestItems: { variantId: string; quantity: number }[]) {
  for (const item of guestItems) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
    });
    if (!variant) continue;

    const existing = await prisma.cartItem.findFirst({
      where: {
        userId,
        productVariantId: item.variantId,
      },
    });

    if (existing) {
      const newQty = Math.min(existing.quantity + item.quantity, variant.stockQuantity);
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId,
          productVariantId: item.variantId,
          quantity: Math.min(item.quantity, variant.stockQuantity),
        },
      });
    }
  }
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

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

    // Search by either ID or Slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        images: { orderBy: { isPrimary: "desc" } },
        variants: { orderBy: { size: "asc" } },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: { user: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        discountPercent: product.discountPercent,
        dressStyle: product.dressStyle || "Casual",
        categoryId: product.categoryId,
        categoryName: product.category.name,
        categorySlug: product.category.slug,
        isActive: product.isActive,
        averageRating: product.averageRating,
        ratingCount: product.reviews.length,
        stock: totalStock,
        images: product.images.map((img) => ({
          id: img.id,
          url: img.url,
          isPrimary: img.isPrimary,
        })),
        variants: product.variants.map((v) => ({
          id: v.id,
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          stockQuantity: v.stockQuantity,
          sku: v.sku,
        })),
        reviews: product.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          authorName: r.user?.fullName || r.user?.email?.split("@")[0] || "Verified Buyer",
          createdAt: r.createdAt.toISOString(),
          isVerifiedPurchase: r.isVerifiedPurchase,
        })),
        createdAt: product.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get single product error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch product" }, { status: 500 });
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

    const existingProduct = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { variants: true, images: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      discountPercent,
      categoryId,
      dressStyle,
      isActive,
      variants,
      images,
    } = body;

    // Update product & nested relations in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update product scalar fields
      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (price !== undefined) updateData.price = Number(price);
      if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? Number(originalPrice) : null;
      if (discountPercent !== undefined) updateData.discountPercent = discountPercent ? Number(discountPercent) : 0;
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (dressStyle !== undefined) updateData.dressStyle = dressStyle.trim();
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      const prod = await tx.product.update({
        where: { id: existingProduct.id },
        data: updateData,
      });

      // 2. If variants array is passed, update or create variants
      if (Array.isArray(variants)) {
        for (const v of variants) {
          if (v.id && existingProduct.variants.some((ev) => ev.id === v.id)) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                stockQuantity: v.stockQuantity !== undefined ? Number(v.stockQuantity) : undefined,
                size: v.size !== undefined ? v.size : undefined,
                colorName: v.colorName !== undefined ? v.colorName : undefined,
                colorHex: v.colorHex !== undefined ? v.colorHex : undefined,
                sku: v.sku !== undefined ? v.sku : undefined,
              },
            });
          } else if (!v.id && (v.size || v.colorName)) {
            await tx.productVariant.create({
              data: {
                productId: existingProduct.id,
                size: v.size || "Standard",
                colorName: v.colorName || "Default",
                colorHex: v.colorHex || "#000000",
                stockQuantity: Number(v.stockQuantity ?? 10),
                sku: v.sku || `${existingProduct.slug.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
              },
            });
          }
        }
      }

      // 3. If images array is passed
      if (Array.isArray(images) && images.length > 0) {
        // Delete previous and replace with updated set
        await tx.productImage.deleteMany({
          where: { productId: existingProduct.id },
        });

        await tx.productImage.createMany({
          data: images.map((img: { url: string; isPrimary?: boolean }, index: number) => ({
            productId: existingProduct.id,
            url: img.url,
            isPrimary: img.isPrimary !== undefined ? img.isPrimary : index === 0,
          })),
        });
      }

      return prod;
    });

    // Revalidate paths
    try {
      revalidatePath("/admin/products");
      revalidatePath(`/admin/products/${existingProduct.id}`);
      revalidatePath("/admin");
      revalidatePath("/");
      revalidatePath(`/shop/${existingProduct.slug}`);
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      product: updated,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingProduct = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existingProduct) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Cascade delete product and child rows
    await prisma.product.delete({
      where: { id: existingProduct.id },
    });

    try {
      revalidatePath("/admin/products");
      revalidatePath("/admin");
      revalidatePath("/");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 });
  }
}

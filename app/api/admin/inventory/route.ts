import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const status = searchParams.get("status") || "ALL";
    const categoryId = searchParams.get("categoryId") || "ALL";

    // Fetch all categories for filter
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });

    // Fetch products with variants and primary images
    const products = await prisma.product.findMany({
      where: {
        ...(categoryId !== "ALL" ? { categoryId } : {}),
      },
      include: {
        category: true,
        images: { where: { isPrimary: true }, take: 1 },
        variants: {
          orderBy: [{ size: "asc" }, { colorName: "asc" }],
        },
      },
      orderBy: { name: "asc" },
    });

    let totalUnits = 0;
    let lowStockVariantsCount = 0;
    let criticalVariantsCount = 0;
    let outOfStockVariantsCount = 0;

    const formattedInventory: any[] = [];

    for (const product of products) {
      const primaryImage = product.images[0]?.url || "/images/product-1.png";
      const productTotalStock = product.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
      totalUnits += productTotalStock;

      const variantItems = product.variants.map((v) => {
        let stockLevel: "OK" | "LOW" | "CRITICAL" | "OUT_OF_STOCK" = "OK";
        if (v.stockQuantity === 0) {
          stockLevel = "OUT_OF_STOCK";
          outOfStockVariantsCount++;
        } else if (v.stockQuantity <= 5) {
          stockLevel = "CRITICAL";
          criticalVariantsCount++;
          lowStockVariantsCount++;
        } else if (v.stockQuantity <= 10) {
          stockLevel = "LOW";
          lowStockVariantsCount++;
        }

        return {
          id: v.id,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImage: primaryImage,
          categoryName: product.category.name,
          categoryId: product.categoryId,
          dressStyle: product.dressStyle,
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          sku: v.sku,
          stockQuantity: v.stockQuantity,
          stockLevel,
          isActive: product.isActive,
          price: Number(product.price),
        };
      });

      formattedInventory.push(...variantItems);
    }

    // Filter formatted items
    let filtered = formattedInventory;

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(search) ||
          item.sku.toLowerCase().includes(search) ||
          item.size.toLowerCase().includes(search) ||
          item.colorName.toLowerCase().includes(search) ||
          item.categoryName.toLowerCase().includes(search)
      );
    }

    if (status === "LOW_STOCK") {
      filtered = filtered.filter((item) => item.stockLevel === "LOW" || item.stockLevel === "CRITICAL");
    } else if (status === "CRITICAL") {
      filtered = filtered.filter((item) => item.stockLevel === "CRITICAL" || item.stockLevel === "OUT_OF_STOCK");
    } else if (status === "OUT_OF_STOCK") {
      filtered = filtered.filter((item) => item.stockLevel === "OUT_OF_STOCK");
    } else if (status === "OK") {
      filtered = filtered.filter((item) => item.stockLevel === "OK");
    }

    return NextResponse.json({
      success: true,
      overview: {
        totalUnits,
        totalVariants: formattedInventory.length,
        lowStockCount: lowStockVariantsCount,
        criticalStockCount: criticalVariantsCount,
        outOfStockCount: outOfStockVariantsCount,
      },
      categories,
      items: filtered,
    });
  } catch (error) {
    console.error("Get inventory error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { variantId, stockQuantity, delta } = body;

    if (!variantId) {
      return NextResponse.json({ success: false, error: "Variant ID is required" }, { status: 400 });
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant) {
      return NextResponse.json({ success: false, error: "Variant not found" }, { status: 404 });
    }

    let newStock = variant.stockQuantity;
    if (typeof stockQuantity === "number") {
      newStock = Math.max(0, Math.floor(stockQuantity));
    } else if (typeof delta === "number") {
      newStock = Math.max(0, variant.stockQuantity + Math.floor(delta));
    }

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stockQuantity: newStock },
      include: { product: true },
    });

    // Revalidate paths
    try {
      revalidatePath("/admin/inventory");
      revalidatePath("/admin/products");
      revalidatePath("/admin");
      revalidatePath(`/shop/${variant.product.slug}`);
      revalidatePath("/");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      variant: {
        id: updated.id,
        stockQuantity: updated.stockQuantity,
        sku: updated.sku,
      },
    });
  } catch (error) {
    console.error("Update inventory error:", error);
    return NextResponse.json({ success: false, error: "Failed to update stock" }, { status: 500 });
  }
}

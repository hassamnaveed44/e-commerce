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
    const search = searchParams.get("search")?.trim() || "";
    const categoryId = searchParams.get("category")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    // Build filter condition
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          variants: {
            some: {
              sku: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    if (categoryId && categoryId !== "ALL") {
      where.categoryId = categoryId;
    }

    if (status === "ACTIVE") {
      where.isActive = true;
    } else if (status === "INACTIVE") {
      where.isActive = false;
    }

    const [products, categories, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          images: { orderBy: { isPrimary: "desc" } },
          variants: true,
          _count: { select: { reviews: true } },
        },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.product.count({ where }),
    ]);

    // Format products for admin table
    const formattedProducts = products.map((p) => {
      const totalStock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
      const primaryImage = p.images.find((img) => img.isPrimary)?.url || p.images[0]?.url || "/images/product-1.png";
      const primarySku = p.variants[0]?.sku || "N/A";

      let stockStatus = "Active";
      if (!p.isActive) {
        stockStatus = "Closed For Sale";
      } else if (totalStock === 0) {
        stockStatus = "Out Of Stock";
      } else if (totalStock <= 10) {
        stockStatus = "Low Stock";
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: `$${Number(p.price).toFixed(2)}`,
        priceNum: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        discountPercent: p.discountPercent || null,
        dressStyle: p.dressStyle || "Casual",
        category: p.category.name,
        categoryId: p.categoryId,
        categorySlug: p.category.slug,
        image: primaryImage,
        images: p.images.map((img) => ({ id: img.id, url: img.url, isPrimary: img.isPrimary })),
        stock: totalStock,
        sku: primarySku,
        rating: p.averageRating,
        reviewsCount: p._count.reviews,
        isActive: p.isActive,
        status: stockStatus,
        variants: p.variants.map((v) => ({
          id: v.id,
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          stockQuantity: v.stockQuantity,
          sku: v.sku,
        })),
        createdAt: p.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      totalCount,
    });
  } catch (error) {
    console.error("Admin get products error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      slug: customSlug,
      description,
      price,
      originalPrice,
      discountPercent,
      categoryId,
      dressStyle = "Casual",
      isActive = true,
      images = [],
      variants = [],
    } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    // Generate unique slug if not supplied
    const baseSlug = (customSlug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existingWithSlug = await prisma.product.findUnique({
      where: { slug: baseSlug },
    });
    const finalSlug = existingWithSlug ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    // Create product inside atomic transaction
    const newProduct = await prisma.$transaction(async (tx) => {
      // 1. Create base Product
      const product = await tx.product.create({
        data: {
          name: name.trim(),
          slug: finalSlug,
          description: description?.trim() || "",
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : null,
          discountPercent: discountPercent ? Number(discountPercent) : 0,
          categoryId,
          dressStyle: dressStyle.trim(),
          isActive: Boolean(isActive),
          averageRating: 5.0,
        },
      });

      // 2. Create Product Images
      if (Array.isArray(images) && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img: { url: string; isPrimary?: boolean }, index: number) => ({
            productId: product.id,
            url: img.url,
            isPrimary: img.isPrimary !== undefined ? img.isPrimary : index === 0,
          })),
        });
      } else {
        // Default fallback image
        await tx.productImage.create({
          data: {
            productId: product.id,
            url: "/images/product-1.png",
            isPrimary: true,
          },
        });
      }

      // 3. Create Product Variants with guaranteed unique SKUs
      const usedSkus = new Set<string>();

      if (Array.isArray(variants) && variants.length > 0) {
        for (const [idx, v] of variants.entries()) {
          const sizeCode = (v.size || "STD").slice(0, 3).toUpperCase();
          const baseSku = (v.sku?.trim() || `${product.slug.slice(0, 4).toUpperCase()}-${sizeCode}`).toUpperCase();
          
          let candidateSku = baseSku;
          let counter = 1;

          // Check if candidate SKU already exists in DB or in current batch
          while (
            usedSkus.has(candidateSku) ||
            (await tx.productVariant.findUnique({ where: { sku: candidateSku } }))
          ) {
            candidateSku = `${baseSku}-${Math.floor(1000 + Math.random() * 9000)}`;
            counter++;
            if (counter > 10) break;
          }

          usedSkus.add(candidateSku);

          await tx.productVariant.create({
            data: {
              productId: product.id,
              size: v.size || "Standard",
              colorName: v.colorName || "Default",
              colorHex: v.colorHex || "#000000",
              stockQuantity: Number(v.stockQuantity ?? 10),
              sku: candidateSku,
            },
          });
        }
      } else {
        // Default variant
        const defaultBaseSku = `${product.slug.slice(0, 4).toUpperCase()}-STD`;
        const existing = await tx.productVariant.findUnique({ where: { sku: defaultBaseSku } });
        const defaultFinalSku = existing ? `${defaultBaseSku}-${Math.floor(1000 + Math.random() * 9000)}` : defaultBaseSku;

        await tx.productVariant.create({
          data: {
            productId: product.id,
            size: "Standard",
            colorName: "Default",
            colorHex: "#000000",
            stockQuantity: 20,
            sku: defaultFinalSku,
          },
        });
      }

      return product;
    });

    // Revalidate storefront cache paths
    try {
      revalidatePath("/admin/products");
      revalidatePath("/admin");
      revalidatePath("/");
      revalidatePath(`/shop/${finalSlug}`);
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Admin create product error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}

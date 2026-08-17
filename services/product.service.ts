import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface GetProductsParams {
  categorySlug?: string;
  dressStyle?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price-asc" | "price-desc" | "price-low" | "price-high" | "rating-desc" | "popular" | "newest" | "oldest";
  color?: string;
  size?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getProducts(params: GetProductsParams = {}) {
  const {
    categorySlug,
    dressStyle,
    minPrice,
    maxPrice,
    sort = "newest",
    color,
    size,
    search,
    page = 1,
    limit = 8,
  } = params;

  const skip = (page - 1) * limit;

  // Build where filter
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  // Filter by Parent Category / Dress Style / Audience (Casual, Formal, Party, Gym, Men, Women, Kids)
  const isGenderAudience = (val?: string) =>
    val && ["men", "women", "kids", "unisex", "boys", "girls"].includes(val.toLowerCase());

  if (dressStyle && dressStyle.toLowerCase() !== "all") {
    const normalized = dressStyle.toLowerCase().trim();
    if (isGenderAudience(normalized)) {
      where.OR = [
        { dressStyle: { contains: normalized, mode: "insensitive" } },
        { name: { contains: normalized, mode: "insensitive" } },
        { description: { contains: normalized, mode: "insensitive" } },
        { category: { slug: { contains: normalized, mode: "insensitive" } } },
        { category: { name: { contains: normalized, mode: "insensitive" } } },
      ];
    } else {
      where.dressStyle = {
        equals: dressStyle,
        mode: "insensitive",
      };
    }
  }

  // Filter by Subcategory / Garment Type or Department
  if (categorySlug && categorySlug.toLowerCase() !== "all") {
    const normalizedSlug = categorySlug.toLowerCase().trim();
    if (isGenderAudience(normalizedSlug) && !where.OR) {
      where.OR = [
        { dressStyle: { contains: normalizedSlug, mode: "insensitive" } },
        { name: { contains: normalizedSlug, mode: "insensitive" } },
        { description: { contains: normalizedSlug, mode: "insensitive" } },
        { category: { slug: { contains: normalizedSlug, mode: "insensitive" } } },
        { category: { name: { contains: normalizedSlug, mode: "insensitive" } } },
      ];
    } else if (!isGenderAudience(normalizedSlug)) {
      const singular = normalizedSlug.endsWith("s") ? normalizedSlug.slice(0, -1) : normalizedSlug;
      const plural = normalizedSlug.endsWith("s") ? normalizedSlug : `${normalizedSlug}s`;
      const possibleTerms = Array.from(new Set([normalizedSlug, singular, plural]));

      where.category = {
        OR: [
          { slug: { in: possibleTerms } },
          { name: { in: possibleTerms, mode: "insensitive" } },
        ],
      };
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (color) {
    where.variants = {
      ...(where.variants || {}),
      some: {
        OR: [
          { colorHex: { equals: color, mode: "insensitive" } },
          { colorName: { equals: color, mode: "insensitive" } },
        ],
      },
    };
  }

  if (size) {
    where.variants = {
      ...(where.variants || {}),
      some: {
        size: { equals: size, mode: "insensitive" },
      },
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Build order by
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price-asc" || sort === "price-low") orderBy = { price: "asc" };
  if (sort === "price-desc" || sort === "price-high") orderBy = { price: "desc" };
  if (sort === "rating-desc" || sort === "popular") orderBy = { averageRating: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };

  let products: any[] = [];
  let totalCount = 0;

  try {
    const result = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          images: true,
          variants: true,
        },
      }),
      prisma.product.count({ where }),
    ]);
    products = result[0];
    totalCount = result[1];
  } catch (error) {
    console.warn("Retrying with fallback filter for dressStyle:", error);
    
    // Fallback: If dev server running with stale client without dressStyle in schema
    const fallbackWhere = { ...where };
    const targetDressStyle = typeof fallbackWhere.dressStyle === "object"
      ? (fallbackWhere.dressStyle as any)?.equals
      : fallbackWhere.dressStyle;
    
    delete (fallbackWhere as any).dressStyle;

    const DRESS_STYLE_MAPPING: Record<string, string[]> = {
      casual: ["t-shirts", "hoodies", "jeans", "shorts", "shirts", "hoodie"],
      formal: ["shirts", "jeans", "shirt"],
      party: ["shirts", "t-shirts", "jeans", "shirt"],
      gym: ["t-shirts", "hoodies", "shorts", "hoodie"],
    };

    if (!fallbackWhere.category && targetDressStyle && DRESS_STYLE_MAPPING[String(targetDressStyle).toLowerCase()]) {
      fallbackWhere.category = {
        slug: { in: DRESS_STYLE_MAPPING[String(targetDressStyle).toLowerCase()] },
      };
    }

    const fallbackResult = await Promise.all([
      prisma.product.findMany({
        where: fallbackWhere,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          images: true,
          variants: true,
        },
      }),
      prisma.product.count({ where: fallbackWhere }),
    ]);
    products = fallbackResult[0];
    totalCount = fallbackResult[1];
  }

  let minCatalogPrice = 0;
  let maxCatalogPrice = 250;
  try {
    const agg = await prisma.product.aggregate({
      where: { isActive: true },
      _min: { price: true },
      _max: { price: true },
    });
    if (agg._min.price !== null && agg._min.price !== undefined) {
      minCatalogPrice = Math.floor(Number(agg._min.price));
    }
    if (agg._max.price !== null && agg._max.price !== undefined) {
      maxCatalogPrice = Math.ceil(Number(agg._max.price));
    }
  } catch (e) {
    console.warn("Price aggregation fallback:", e);
  }

  return {
    products,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    minCatalogPrice,
    maxCatalogPrice,
  };
}

export async function getProductBySlugOrId(identifier: string) {
  return await prisma.product.findFirst({
    where: {
      OR: [{ slug: identifier }, { id: identifier }],
      isActive: true,
    },
    include: {
      category: true,
      images: true,
      variants: {
        orderBy: [{ colorName: "asc" }, { size: "asc" }],
      },
      reviews: {
        include: {
          user: {
            select: { fullName: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getRecommendedProducts(
  currentProductId: string,
  categorySlug?: string,
  limit = 4
) {
  let relatedProducts: Awaited<ReturnType<typeof getProducts>>["products"] = [];

  if (categorySlug) {
    const categoryResponse = await getProducts({
      categorySlug,
      limit: limit + 2,
    });
    relatedProducts = categoryResponse.products.filter(
      (p) => p.id !== currentProductId && p.slug !== currentProductId
    );
  }

  // Backfill if fewer than limit products found in the same category
  if (relatedProducts.length < limit) {
    const existingIds = new Set([
      currentProductId,
      ...relatedProducts.map((p) => p.id),
      ...relatedProducts.map((p) => p.slug),
    ]);

    const fallbackResponse = await getProducts({
      sort: "rating-desc",
      limit: limit * 3,
    });

    const additional = fallbackResponse.products.filter(
      (p) => !existingIds.has(p.id) && !existingIds.has(p.slug)
    );

    relatedProducts = [...relatedProducts, ...additional];
  }

  return relatedProducts.slice(0, limit);
}


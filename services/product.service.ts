import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface GetProductsParams {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price-asc" | "price-desc" | "rating-desc" | "newest";
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
    minPrice,
    maxPrice,
    sort = "newest",
    search,
    page = 1,
    limit = 8,
  } = params;

  const skip = (page - 1) * limit;

  // Build where filter
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Build order by
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "rating-desc") orderBy = { averageRating: "desc" };

  const [products, totalCount] = await Promise.all([
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

  return {
    products,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
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

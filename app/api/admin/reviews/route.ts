import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase();
    const ratingParam = searchParams.get("rating");
    const verifiedParam = searchParams.get("verified");
    const sort = searchParams.get("sort") || "newest";
    const productId = searchParams.get("productId");

    // 1. Fetch all reviews to compute storewide rating metrics
    const allReviews = await prisma.review.findMany({
      select: {
        id: true,
        rating: true,
        isVerifiedPurchase: true,
      },
    });

    const totalReviews = allReviews.length;
    const totalRatingSum = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? Number((totalRatingSum / totalReviews).toFixed(1)) : 0;
    const verifiedCount = allReviews.filter((r) => r.isVerifiedPurchase).length;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      }
    });

    // 2. Build Filter
    const where: Prisma.ReviewWhereInput = {};

    if (ratingParam && !isNaN(Number(ratingParam))) {
      where.rating = Number(ratingParam);
    }

    if (verifiedParam === "true") {
      where.isVerifiedPurchase = true;
    }

    if (productId && productId !== "ALL") {
      where.productId = productId;
    }

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: "insensitive" } },
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // 3. Build Sort Order
    let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    else if (sort === "rating-high") orderBy = { rating: "desc" };
    else if (sort === "rating-low") orderBy = { rating: "asc" };

    // 4. Fetch matching reviews
    const reviews = await prisma.review.findMany({
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
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            averageRating: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    const formattedReviews = reviews.map((r) => {
      const reviewerName = r.user?.fullName || r.user?.email.split("@")[0] || "Customer";
      const primaryImage = r.product?.images?.[0]?.url || "/images/product-1.png";

      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isVerifiedPurchase: r.isVerifiedPurchase,
        createdAt: r.createdAt.toISOString(),
        customer: {
          id: r.user?.id || null,
          name: reviewerName,
          email: r.user?.email || "customer@example.com",
        },
        product: {
          id: r.product?.id || null,
          name: r.product?.name || "Product",
          slug: r.product?.slug || "",
          image: primaryImage,
          productAverageRating: r.product?.averageRating || 0,
        },
      };
    });

    return NextResponse.json({
      success: true,
      overview: {
        totalReviews,
        averageRating,
        verifiedCount,
        distribution,
      },
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("Admin get reviews error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
  }
}

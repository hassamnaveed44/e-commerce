import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

// POST /api/reviews - Add a review with Verified Purchase check
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    const body = await req.json();
    const { productId, rating, comment } = body;
    const authorName = body.name || body.customerName || "Customer";

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: "Please select a star rating and enter a review message." },
        { status: 400 }
      );
    }

    // 1. Find or create user
    let user = null;
    if (clerkId) {
      user = await prisma.user.findUnique({ where: { clerkId } });
    }

    if (!user) {
      const guestEmail = `reviewer_${Date.now()}@guest.shop.co`;
      user = await prisma.user.create({
        data: {
          clerkId: clerkId || `guest_rev_${Date.now()}`,
          email: guestEmail,
          fullName: authorName,
        },
      });
    }

    // 2. Check if user is a Verified Buyer (has a completed/processing order containing this product)
    const verifiedOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        orderStatus: {
          not: OrderStatus.CANCELLED,
        },
        items: {
          some: {
            variant: {
              productId: productId,
            },
          },
        },
      },
    });

    const isVerifiedPurchase = Boolean(verifiedOrder);

    // 3. Create the Review in PostgreSQL
    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating: Number(rating),
        comment,
        isVerifiedPurchase,
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    // 4. Recalculate and update product's averageRating
    const aggregate = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    if (aggregate._avg.rating !== null) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          averageRating: Number(aggregate._avg.rating.toFixed(1)),
        },
      });
    }

    const formattedReview = {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      isVerifiedPurchase: review.isVerifiedPurchase,
      user: {
        fullName: review.user?.fullName || authorName,
      },
    };

    return NextResponse.json({
      success: true,
      data: formattedReview,
      review: formattedReview,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit review. Please try again." },
      { status: 500 }
    );
  }
}

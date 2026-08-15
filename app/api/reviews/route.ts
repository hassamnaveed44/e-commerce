import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

// POST /api/reviews - Add a review with Verified Purchase check
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    const body = await req.json();
    const { productId, rating, comment, customerName } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: "Missing required review fields" },
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
          fullName: customerName || "Anonymous Customer",
        },
      });
    }

    // 2. Check if user is a Verified Buyer (has a non-cancelled order containing this product)
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

    // 3. Create the Review
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

    // 4. Recalculate and update product's averageRating in PostgreSQL
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

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        userName: review.user.fullName || customerName || "Customer",
        rating: review.rating,
        comment: review.comment,
        isVerifiedPurchase: review.isVerifiedPurchase,
        date: review.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 500 }
    );
  }
}

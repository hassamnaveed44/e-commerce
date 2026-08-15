import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, rating, comment, name } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if authenticated user via Clerk
    const { userId: clerkId } = await auth();
    let dbUser = null;

    if (clerkId) {
      dbUser = await prisma.user.findUnique({
        where: { clerkId },
      });
    }

    // If guest or user not synced yet, create a record with unique clerkId
    if (!dbUser) {
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const guestClerkId = clerkId || `guest_${uniqueSuffix}`;
      const guestEmail = `${(name || "guest").toLowerCase().replace(/[^a-z0-9]/g, "")}_${uniqueSuffix}@guest.shop.co`;

      dbUser = await prisma.user.create({
        data: {
          clerkId: guestClerkId,
          email: guestEmail,
          fullName: name || "Verified Buyer",
        },
      });
    }

    // Create the review in database
    const review = await prisma.review.create({
      data: {
        productId,
        userId: dbUser.id,
        rating: Number(rating),
        comment,
        isVerifiedPurchase: true,
      },
      include: {
        user: {
          select: { fullName: true },
        },
      },
    });

    // Recalculate average rating on Product
    const aggregates = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    if (aggregates._avg.rating !== null) {
      await prisma.product.update({
        where: { id: productId },
        data: { averageRating: Number(aggregates._avg.rating.toFixed(1)) },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        user: { fullName: review.user.fullName || name || "Verified Buyer" },
      },
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create review" },
      { status: 500 }
    );
  }
}

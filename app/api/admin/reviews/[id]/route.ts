import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

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

    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!existingReview) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    const productId = existingReview.productId;
    const productSlug = existingReview.product?.slug;

    // Delete review and recalculate average rating inside transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete review
      await tx.review.delete({
        where: { id },
      });

      // 2. Recalculate average rating for product
      const remainingReviews = await tx.review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const newAverage =
        remainingReviews.length > 0
          ? Number(
              (
                remainingReviews.reduce((sum, r) => sum + r.rating, 0) /
                remainingReviews.length
              ).toFixed(1)
            )
          : 0;

      await tx.product.update({
        where: { id: productId },
        data: { averageRating: newAverage },
      });
    });

    // Revalidate paths
    try {
      revalidatePath("/admin/reviews");
      revalidatePath("/admin");
      if (productSlug) revalidatePath(`/shop/${productSlug}`);
      revalidatePath("/");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Review successfully removed and product rating updated",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete review" }, { status: 500 });
  }
}

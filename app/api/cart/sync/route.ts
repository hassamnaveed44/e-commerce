import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { syncGuestCart, getCartItems } from "@/services/cart.service";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const { items: localItems } = await req.json();
    if (Array.isArray(localItems) && localItems.length > 0) {
      await syncGuestCart(user.id, localItems);
    }

    const updatedCart = await getCartItems({ userId: user.id });
    return NextResponse.json({ success: true, items: updatedCart });
  } catch (error) {
    console.error("Cart sync error:", error);
    return NextResponse.json({ success: false, message: "Failed to sync cart" }, { status: 500 });
  }
}

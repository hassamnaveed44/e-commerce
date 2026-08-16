import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import {
  getCartItems,
  addItemToCart,
  updateCartQuantity,
  deleteCartItem,
} from "@/services/cart.service";

async function getDbUserId(): Promise<string | undefined> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return undefined;
  const user = await prisma.user.findUnique({ where: { clerkId } });
  return user?.id;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getDbUserId();
    const sessionToken = req.cookies.get("shopco_session")?.value;

    const items = await getCartItems({ userId, sessionToken });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ success: false, message: "Error fetching cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getDbUserId();
    let sessionToken = req.cookies.get("shopco_session")?.value;
    const isNewSession = !sessionToken;

    if (!sessionToken && !userId) {
      sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    const { variantId, quantity } = await req.json();
    if (!variantId) {
      return NextResponse.json({ success: false, message: "variantId required" }, { status: 400 });
    }

    await addItemToCart({
      userId,
      sessionToken: userId ? undefined : sessionToken,
      variantId,
      quantity: Number(quantity) || 1,
    });

    const items = await getCartItems({ userId, sessionToken: userId ? undefined : sessionToken });
    const res = NextResponse.json({ success: true, items });

    if (isNewSession && !userId && sessionToken) {
      res.cookies.set("shopco_session", sessionToken, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return res;
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ success: false, message: "Error adding to cart" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { cartItemId, quantity } = await req.json();
    if (!cartItemId) {
      return NextResponse.json({ success: false, message: "cartItemId required" }, { status: 400 });
    }

    await updateCartQuantity(cartItemId, Number(quantity));
    const userId = await getDbUserId();
    const sessionToken = req.cookies.get("shopco_session")?.value;
    const items = await getCartItems({ userId, sessionToken });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Cart PATCH error:", error);
    return NextResponse.json({ success: false, message: "Error updating cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("id");
    if (!cartItemId) {
      return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    }

    await deleteCartItem(cartItemId);
    const userId = await getDbUserId();
    const sessionToken = req.cookies.get("shopco_session")?.value;
    const items = await getCartItems({ userId, sessionToken });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ success: false, message: "Error removing cart item" }, { status: 500 });
  }
}

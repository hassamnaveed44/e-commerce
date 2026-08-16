import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ authenticated: false });
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ authenticated: true, synced: false, reason: "No email found" });
    }

    const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email.split("@")[0];
    const isSuperAdmin = email.toLowerCase() === "hassamnaveed44@gmail.com";

    // Upsert user into database immediately
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email,
        fullName: fullName || undefined,
        ...(isSuperAdmin ? { role: "ADMIN" } : {}),
      },
      create: {
        clerkId: userId,
        email,
        fullName,
        role: isSuperAdmin ? "ADMIN" : "CUSTOMER",
      },
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}

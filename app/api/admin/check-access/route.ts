import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        isAdmin: false,
        role: "GUEST",
        pendingRequest: false,
        user: null,
      });
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || "";
    const fullName = clerkUser ? `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() : "";

    // Sync / Upsert user in DB (Lookup by clerkId OR email)
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId: userId },
          ...(email ? [{ email }] : []),
        ],
      },
      include: {
        adminAccessRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!dbUser && email) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          fullName: fullName || email.split("@")[0],
          role: email === "hassamnaveed44@gmail.com" ? "ADMIN" : "CUSTOMER",
        },
        include: {
          adminAccessRequests: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });
    } else if (dbUser && dbUser.clerkId !== userId) {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { clerkId: userId, ...(fullName ? { fullName } : {}) },
        include: {
          adminAccessRequests: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });
    }

    const isAdmin = dbUser?.role === "ADMIN" || email === "hassamnaveed44@gmail.com";
    const latestRequest = dbUser?.adminAccessRequests?.[0];
    const hasPendingRequest = latestRequest?.status === "PENDING";

    return NextResponse.json({
      authenticated: true,
      isAdmin,
      role: dbUser?.role || "CUSTOMER",
      hasPendingRequest,
      latestRequestStatus: latestRequest?.status || null,
      user: {
        id: dbUser?.id || userId,
        clerkId: userId,
        email: dbUser?.email || email,
        fullName: dbUser?.fullName || fullName || "User",
      },
    });
  } catch (error) {
    console.error("Check access error:", error);
    return NextResponse.json({
      authenticated: false,
      isAdmin: false,
      role: "GUEST",
      pendingRequest: false,
      error: "Failed to verify access",
    });
  }
}

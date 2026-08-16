import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export interface AdminAuthResult {
  authorized: boolean;
  userId?: string;
  user?: {
    id: string;
    clerkId: string;
    email: string;
    fullName: string | null;
    role: "ADMIN" | "CUSTOMER";
  };
  errorResponse?: NextResponse;
}

/**
 * Validates whether the current request is authenticated as an ADMIN.
 * Checks Clerk session metadata, Clerk user API, and database User.role.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Please authenticate as an admin." },
        { status: 401 }
      ),
    };
  }

  // 1. Check Clerk sessionClaims metadata
  let sessionRole =
    (sessionClaims?.metadata as { role?: string })?.role ||
    (sessionClaims?.publicMetadata as { role?: string })?.role ||
    (sessionClaims?.public_metadata as { role?: string })?.role;

  // 2. Check Clerk API if session claims didn't have role
  if (!sessionRole) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      sessionRole = (user.publicMetadata as { role?: string })?.role;
    } catch {
      // Fall through to DB check
    }
  }

  // 3. Check Database record for User
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, clerkId: true, email: true, fullName: true, role: true },
  });

  const isAdmin = sessionRole === "ADMIN" || dbUser?.role === "ADMIN";

  if (!isAdmin) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: "Forbidden: Admin privileges required." },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    userId,
    user: dbUser || undefined,
  };
}

import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import {
  findPendingRequestForUser,
  createAccessRequest,
  getAllAccessRequests,
  updateAccessRequestStatus,
} from "@/services/access-request.service";

// 1. Submit Request for Admin Access (Any authenticated user)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Please log in to submit a request" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || "Requesting staff access to manage store";
    let email = body?.email || "";
    let fullName = body?.fullName || "";

    if (!email) {
      try {
        const clerkUser = await currentUser();
        email = clerkUser?.emailAddresses?.[0]?.emailAddress || "";
        fullName = clerkUser ? `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() : "";
      } catch (err) {
        console.warn("Clerk currentUser fetch note:", err);
      }
    }

    // Ensure User exists in DB (Lookup by clerkId OR email)
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId: userId },
          ...(email ? [{ email }] : []),
        ],
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
      });
    } else if (dbUser) {
      if (dbUser.clerkId !== userId || (fullName && !dbUser.fullName)) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            clerkId: userId,
            ...(fullName ? { fullName } : {}),
          },
        });
      }
    }

    if (!dbUser) {
      return NextResponse.json({ error: "User profile could not be created or found" }, { status: 404 });
    }

    if (dbUser.role === "ADMIN") {
      return NextResponse.json({ success: true, message: "You already have admin privileges" });
    }

    // Check if request already pending using resilient service
    const existingRequest = await findPendingRequestForUser(dbUser.id);

    if (existingRequest) {
      return NextResponse.json({
        success: true,
        message: "Your request is already pending approval by the Admin",
        request: existingRequest,
      });
    }

    const newRequest = await createAccessRequest({
      userId: dbUser.id,
      email: dbUser.email,
      name: dbUser.fullName || fullName || dbUser.email.split("@")[0],
      reason,
    });

    return NextResponse.json({
      success: true,
      message: "Access request submitted! The Admin can now approve your account.",
      request: newRequest,
    });
  } catch (error: any) {
    console.error("Submit access request error details:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit access request" },
      { status: 500 }
    );
  }
}

// 2. Get All Access Requests and Authorized Staff (Admin Only)
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [requests, allUsers] = await Promise.all([
      getAllAccessRequests(),
      prisma.user.findMany({
        select: { id: true, email: true, fullName: true, role: true, createdAt: true },
        orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      }),
    ]);

    const pendingRequests = requests.filter((r) => r.status === "PENDING");
    const authorizedAdmins = allUsers.filter((u) => u.role === "ADMIN");

    return NextResponse.json({
      success: true,
      pendingCount: pendingRequests.length,
      requests,
      allUsers,
      authorizedAdmins,
    });
  } catch (error: any) {
    console.error("Get access requests error:", error);
    return NextResponse.json({ error: "Failed to fetch access requests" }, { status: 500 });
  }
}

// 3. Approve, Reject, or Revoke Admin Privileges (Admin Only)
export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, targetUserId, action } = body; // action: "APPROVE" | "REJECT" | "REVOKE" | "MAKE_ADMIN"

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    if (action === "APPROVE" && (requestId || targetUserId)) {
      if (requestId) {
        await updateAccessRequestStatus(requestId, "APPROVED");
      }

      const userIdToPromote = targetUserId;
      if (userIdToPromote) {
        await prisma.user.update({
          where: { id: userIdToPromote },
          data: { role: "ADMIN" },
        });
      }

      return NextResponse.json({
        success: true,
        message: "User approved as Admin! They now have full access to the dashboard.",
      });
    }

    if (action === "REJECT" && requestId) {
      await updateAccessRequestStatus(requestId, "REJECTED");

      return NextResponse.json({
        success: true,
        message: "Access request rejected.",
      });
    }

    if ((action === "REVOKE" || action === "DEMOTE") && targetUserId) {
      const user = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (user.email === "hassamnaveed44@gmail.com") {
        return NextResponse.json({ error: "Primary super admin cannot be demoted" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: targetUserId },
        data: { role: "CUSTOMER" },
      });

      return NextResponse.json({
        success: true,
        message: `Revoked admin privileges from ${user.email}.`,
      });
    }

    if (action === "MAKE_ADMIN" && targetUserId) {
      const user = await prisma.user.update({
        where: { id: targetUserId },
        data: { role: "ADMIN" },
      });

      return NextResponse.json({
        success: true,
        message: `Promoted ${user.email} to Admin!`,
      });
    }

    return NextResponse.json({ error: "Invalid action or parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("Process access request error:", error);
    return NextResponse.json({ error: "Failed to process access request" }, { status: 500 });
  }
}

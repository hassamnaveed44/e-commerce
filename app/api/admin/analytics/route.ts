import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getAdminOverviewStats } from "@/services/analytics.service";

export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analytics = await getAdminOverviewStats();
    return NextResponse.json({
      success: true,
      analytics,
      admin: {
        email: authResult.user?.email,
        fullName: authResult.user?.fullName,
      },
    });
  } catch (error) {
    console.error("Admin analytics API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

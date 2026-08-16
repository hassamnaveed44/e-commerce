import { getAdminOverviewStats } from "../services/analytics.service";

async function testAnalyticsService() {
  console.log("=== Testing Analytics Service ===");
  const stats = await getAdminOverviewStats();
  console.log("Overview:", JSON.stringify(stats.overview, null, 2));
  console.log("Monthly Chart:", JSON.stringify(stats.monthlyRevenueChart, null, 2));
  console.log("Recent Orders count:", stats.recentOrders.length);
  if (stats.recentOrders.length > 0) {
    console.log("Sample Recent Order:", stats.recentOrders[0]);
  }
  console.log("Review Breakdown:", JSON.stringify(stats.reviewBreakdown, null, 2));
  console.log("Top Selling Products count:", stats.topSellingProducts.length);
}

testAnalyticsService().catch(console.error);

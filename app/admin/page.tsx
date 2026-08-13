import { Calendar, Download } from "lucide-react";
import { Button } from "./_components/ui/button";
import EcommerceKpis from "./_components/ecommerce/EcommerceKpis";
import RevenueChart from "./_components/ecommerce/RevenueChart";
import RecentOrdersTable from "./_components/ecommerce/RecentOrdersTable";
import TopProductsList from "./_components/ecommerce/TopProductsList";

export default function EcommerceDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner & Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-integral uppercase text-black tracking-tight">
            E-Commerce Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-black/60 mt-1">
            Real-time sales analytics, inventory status, and order management.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-black shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-black/50" />
            <span>Oct 1, 2026 - Oct 31, 2026</span>
          </div>

          <Button size="sm" className="flex items-center gap-1.5 text-xs shadow-sm">
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <EcommerceKpis />

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <RevenueChart />
        <TopProductsList />
      </div>

      {/* Recent Orders Full Table */}
      <RecentOrdersTable />
    </div>
  );
}

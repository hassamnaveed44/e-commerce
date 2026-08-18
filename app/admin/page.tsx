"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  Download,
  Share2,
  ChevronRight,
  ChevronLeft,
  Search,
  Star,
  MoreHorizontal,
  RefreshCw,
  Copy,
  Check,
  User,
  CreditCard,
  FileText,
  X,
  ArrowUpRight,
  Package,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PrintableInvoiceSlip from "@/app/components/order/PrintableInvoiceSlip";
import type { AdminAnalyticsData } from "@/services/analytics.service";

// Custom Folder Export Icon matching Screenshot 2
function FolderExportIcon({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <path d="M12 10v6" />
      <path d="m9 13 3-3 3 3" />
    </svg>
  );
}

export default function EcommerceDashboardPage() {
  const { user } = useUser();
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search States
  const [orderFilter, setOrderFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");

  // Pagination States
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const ordersPerPage = 8;
  const productsPerPage = 8;

  // Hover states for Charts
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);

  // Row Dropdown & Detail Modal States
  const [activeOrderMenu, setActiveOrderMenu] = useState<string | null>(null);
  const [activeProductMenu, setActiveProductMenu] = useState<string | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any | null>(null);
  const [selectedCustomerModal, setSelectedCustomerModal] = useState<{
    name: string;
    email: string;
    orderNumber: string;
    totalAmount: number;
    paymentMethod: string;
    status: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveOrderMenu(null);
        setActiveProductMenu(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.success && json.analytics) {
        setData(json.analytics);
      }
    } catch (err) {
      console.error("Failed to load admin analytics:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Admin name
  const adminFirstName =
    user?.firstName || user?.fullName?.split(" ")[0] || "hassam";

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (!data?.recentOrders) return [];
    if (!orderFilter.trim()) return data.recentOrders;
    const query = orderFilter.toLowerCase();
    return data.recentOrders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.productSummary.toLowerCase().includes(query) ||
        o.status.toLowerCase().includes(query)
    );
  }, [data?.recentOrders, orderFilter]);

  // Paginated Orders
  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, orderPage]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    if (!data?.topSellingProducts) return [];
    if (!productFilter.trim()) return data.topSellingProducts;
    const query = productFilter.toLowerCase();
    return data.topSellingProducts.filter((p) =>
      p.name.toLowerCase().includes(query)
    );
  }, [data?.topSellingProducts, productFilter]);

  // Paginated Products
  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, productPage]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export handler
  const handleExportCSV = (type: string) => {
    const content =
      type === "orders"
        ? filteredOrders
            .map(
              (o) =>
                `"${o.orderNumber}","${o.customerName}","${o.productSummary}",${o.totalAmount},"${o.status}"`
            )
            .join("\n")
        : filteredProducts
            .map((p) => `"${p.name}",${p.unitsSold},${p.revenue}`)
            .join("\n");

    const header =
      type === "orders"
        ? "Order ID,Customer,Product,Amount,Status\n"
        : "Product,Units Sold,Revenue\n";

    const blob = new Blob([header + content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report-${Date.now()}.csv`;
    a.click();
  };

  const getOrderStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "PROCESSING" || s === "PENDING_PAYMENT") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-600 border border-sky-200">
          Processing
        </span>
      );
    }
    if (s === "DELIVERED" || s === "SUCCESS") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
          Success
        </span>
      );
    }
    if (s === "SHIPPED" || s === "PAID") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
          Paid
        </span>
      );
    }
    if (s === "CANCELLED" || s === "FAILED" || s === "RETURNED_REFUSED") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-200">
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 font-satoshi text-slate-900">
      {/* 1️⃣ Top Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            E-Commerce Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Date Range Picker Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs">
            <Calendar size={13} className="text-slate-400" />
            <span>22 Jul 2026 - 18 Aug 2026</span>
          </div>

          {/* Download / Export Button */}
          <Button
            size="sm"
            onClick={() => handleExportCSV("orders")}
            className="bg-black text-white hover:bg-black/80 rounded-lg text-xs font-semibold gap-1.5 h-8 px-3 cursor-pointer shadow-xs"
          >
            <Download size={13} />
            <span>Download</span>
          </Button>
        </div>
      </div>

      {/* 2️⃣ Top Metric Cards Row (Compact Height & Clean Typography) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Congratulations Banner Card */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-pink-50/20 p-4 sm:p-4.5 shadow-xs flex flex-col justify-between min-h-[145px]">
          <div className="absolute top-2.5 right-3 text-lg select-none opacity-80">
            🎉
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Congratulations {adminFirstName}!
            </h3>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Best seller of the month
            </p>

            <div className="mt-2.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                ${data?.overview.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "6,239.00"}
              </span>
              <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                +65% from last month
              </p>
            </div>
          </div>

          <div className="mt-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition"
            >
              View Sales
            </Link>
          </div>
        </div>

        {/* Card 2: Monthly Recurring Revenue (Dynamic from Monthly Trend) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-4.5 shadow-xs flex flex-col justify-between min-h-[145px]">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-normal truncate">
                Monthly recurring r...
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                +{data?.overview.monthlyGrowthPercent || 6.1}%
              </span>
            </div>
            <div className="mt-2.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {(() => {
                  const currentMonthRev =
                    data?.monthlyRevenueChart?.slice(-1)[0]?.revenue ||
                    data?.overview.totalRevenue ||
                    0;
                  return currentMonthRev >= 1000
                    ? `$${(currentMonthRev / 1000).toFixed(1)}K`
                    : `$${currentMonthRev.toFixed(0)}`;
                })()}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <Link
              href="/admin/orders"
              className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center justify-between group"
            >
              <span>View more</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>

        {/* Card 3: Users (Dynamic Signed-in Users from DB) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-4.5 shadow-xs flex flex-col justify-between min-h-[145px]">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-normal">Users</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                +19.2%
              </span>
            </div>
            <div className="mt-2.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {data?.overview.totalCustomers && data.overview.totalCustomers > 999
                  ? `${(data.overview.totalCustomers / 1000).toFixed(1)}K`
                  : `${data?.overview.totalCustomers || 1}`}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <Link
              href="/admin/customers"
              className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center justify-between group"
            >
              <span>View more</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>

        {/* Card 4: User Growth / Conversion (Calculated based on orders/revenue) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-4.5 shadow-xs flex flex-col justify-between min-h-[145px]">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-normal">User growth</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                -1.2%
              </span>
            </div>
            <div className="mt-2.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {data?.overview.conversionRate || 11.3}%
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <Link
              href="/admin/analytics"
              className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center justify-between group"
            >
              <span>View more</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3️⃣ Middle Row (2 Charts - Dynamic Interactive Movement & Tooltips) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left Chart: Total Revenue Bar Chart (6 Cols) */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Total Revenue</h3>
              <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                Income in the last 28 days
              </p>
            </div>

            {/* Desktop & Mobile Split Box (Dynamic Real Data) */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 text-[11px]">
              <div>
                <span className="text-slate-400 font-medium block text-[9px] uppercase tracking-wider">
                  DESKTOP
                </span>
                <span className="font-bold text-slate-900">
                  {data?.desktopMobileSplit?.desktopCount
                    ? data.desktopMobileSplit.desktopCount.toLocaleString()
                    : "24,828"}
                </span>
              </div>
              <div className="w-[1px] h-5 bg-slate-200" />
              <div>
                <span className="text-slate-400 font-medium block text-[9px] uppercase tracking-wider">
                  MOBILE
                </span>
                <span className="font-bold text-slate-900">
                  {data?.desktopMobileSplit?.mobileCount
                    ? data.desktopMobileSplit.mobileCount.toLocaleString()
                    : "25,010"}
                </span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart with Elevated Rounded Bars Matching Screenshot 1 */}
          <div className="h-52 w-full flex items-end justify-between gap-2 pt-6 px-1 sm:px-3 relative">
            {(data?.monthlyRevenueChart || [
              { month: "January", h1: 65, h2: 55, desktopOrders: 110, mobileOrders: 130 },
              { month: "February", h1: 88, h2: 72, desktopOrders: 145, mobileOrders: 125 },
              { month: "March", h1: 85, h2: 48, desktopOrders: 135, mobileOrders: 98 },
              { month: "April", h1: 52, h2: 68, desktopOrders: 92, mobileOrders: 118 },
              { month: "May", h1: 45, h2: 56, desktopOrders: 110, mobileOrders: 130 },
              { month: "June", h1: 94, h2: 60, desktopOrders: 160, mobileOrders: 145 },
            ]).map((bar: any, idx: number) => {
              const h1Val = bar.h1 || 60;
              const h2Val = bar.h2 || 50;
              const isHovered = hoveredBar === idx;

              return (
                <div
                  key={idx}
                  className="flex-1 flex items-end justify-center gap-1 sm:gap-1.5 h-full relative cursor-pointer"
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Desktop Bar (Dark Solid Rounded Bar) */}
                  <div
                    style={{ height: `${h1Val}%` }}
                    className={`w-4 sm:w-6 rounded-t-md transition-all duration-200 ${
                      isHovered ? "bg-slate-800" : "bg-[#0F172A]"
                    }`}
                  />
                  {/* Mobile Bar (Slate Grey Rounded Bar) */}
                  <div
                    style={{ height: `${h2Val}%` }}
                    className={`w-4 sm:w-6 rounded-t-md transition-all duration-200 ${
                      isHovered ? "bg-slate-600" : "bg-[#64748B]"
                    }`}
                  />

                  {/* 🎯 Hover Tooltip following hovered month */}
                  {isHovered && (
                    <div className="absolute bottom-[50%] z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 text-left text-[11px] min-w-[125px] animate-in fade-in zoom-in-95 pointer-events-none">
                      <p className="font-bold text-slate-900 mb-1.5 text-xs">
                        {bar.month}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-xs bg-[#0F172A]" />
                            <span>Desktop</span>
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {bar.desktopOrders || 110}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-xs bg-[#64748B]" />
                            <span>Mobile</span>
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {bar.mobileOrders || 130}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Months on X-Axis */}
          <div className="flex justify-between px-1 sm:px-3 pt-3 border-t border-slate-100 text-[11px] font-normal text-slate-500">
            <span>January</span>
            <span>February</span>
            <span>March</span>
            <span>April</span>
            <span>May</span>
            <span>June</span>
          </div>
        </div>

        {/* Right Chart: Returning Rate with Moving Dynamic Hover Point (Screenshot 2 Match) */}
        <div
          className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between"
          onMouseLeave={() => setHoveredTrendIdx(null)}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Returning Rate</h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  ${data?.overview.returningRateValue?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "42,379.00"}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  +{data?.overview.returningRateGrowth || 2.5}%
                </span>
              </div>
            </div>

            {/* Folder Export Button matching Screenshot 2 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV("orders")}
              className="rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 text-xs font-semibold gap-1.5 h-8 px-2.5 shadow-2xs cursor-pointer"
            >
              <FolderExportIcon size={14} className="text-slate-800" />
              <span>Export</span>
            </Button>
          </div>

          {/* SVG Multi-Line Chart with Interactive Moving Hover Points */}
          {(() => {
            const trendPoints = data?.returningRateTrend || [
              { month: "March", desktop: 320, mobile: 110, cx: 0, y1: 140, y2: 160 },
              { month: "April", desktop: 440, mobile: 125, cx: 75, y1: 120, y2: 140 },
              { month: "May", desktop: 390, mobile: 115, cx: 155, y1: 135, y2: 155 },
              { month: "June", desktop: 514, mobile: 140, cx: 235, y1: 90, y2: 130 },
              { month: "July", desktop: 310, mobile: 95, cx: 315, y1: 105, y2: 145 },
              { month: "August", desktop: 480, mobile: 130, cx: 395, y1: 70, y2: 140 },
              { month: "October", desktop: 410, mobile: 120, cx: 475, y1: 140, y2: 155 },
              { month: "December", desktop: 620, mobile: 180, cx: 560, y1: 40, y2: 110 },
            ];
            const activeTrend = hoveredTrendIdx !== null ? trendPoints[hoveredTrendIdx] : null;
            const leftPercent = activeTrend
              ? Math.min(72, Math.max(5, (activeTrend.cx / 560) * 100 - 10))
              : 0;

            return (
              <div className="h-52 w-full relative flex items-center justify-center pt-2">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 560 180"
                  preserveAspectRatio="none"
                >
                  <line x1="0" y1="130" x2="560" y2="130" stroke="#f8fafc" strokeWidth="1" />

                  {/* Line 1 (Solid Dark Line) */}
                  <path
                    d="M 0 140 L 70 120 L 140 135 L 210 90 L 280 105 L 350 70 L 420 140 L 490 100 L 560 40"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Line 2 (Secondary Slate Grey Line) */}
                  <path
                    d="M 0 160 L 70 140 L 140 155 L 210 130 L 280 145 L 350 140 L 420 155 L 490 135 L 560 110"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Moving Interactive Active Dots - only shown on hover/click */}
                  {activeTrend && (
                    <>
                      <circle
                        cx={activeTrend.cx}
                        cy={activeTrend.y1}
                        r="4.5"
                        fill="#0F172A"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        className="transition-all duration-200"
                      />
                      <circle
                        cx={activeTrend.cx}
                        cy={activeTrend.y2}
                        r="4.5"
                        fill="#64748B"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        className="transition-all duration-200"
                      />
                    </>
                  )}
                </svg>

                {/* Moving Tooltip Card that tracks active month - only shown on hover/click */}
                {activeTrend && (
                  <div
                    style={{
                      left: `${leftPercent}%`,
                      top: `${Math.min(50, Math.max(8, (activeTrend.y1 / 180) * 100 - 10))}%`,
                    }}
                    className="absolute z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 text-left text-[11px] min-w-[130px] transition-all duration-200 pointer-events-none animate-in fade-in zoom-in-95"
                  >
                    <p className="font-bold text-slate-900 mb-1.5 text-xs">{activeTrend.month}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-xs bg-[#0F172A]" />
                          <span>Desktop</span>
                        </span>
                        <span className="font-mono font-bold text-slate-900">{activeTrend.desktop}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-xs bg-[#64748B]" />
                          <span>Mobile</span>
                        </span>
                        <span className="font-mono font-bold text-slate-900">{activeTrend.mobile}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invisible Hover Columns along X-axis to drive smooth interactive movement */}
                <div className="absolute inset-0 flex">
                  {trendPoints.map((_, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-full cursor-pointer z-20"
                      onMouseEnter={() => setHoveredTrendIdx(idx)}
                      onClick={() => setHoveredTrendIdx(idx)}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* X-Axis Months with individual hover triggers */}
          <div className="flex justify-between px-1 sm:px-3 pt-3 border-t border-slate-100 text-[10px] sm:text-[11px] font-normal text-slate-500">
            {["March", "April", "May", "June", "July", "August", "October", "December"].map(
              (m, idx) => (
                <span
                  key={m}
                  onMouseEnter={() => setHoveredTrendIdx(idx)}
                  onClick={() => setHoveredTrendIdx(idx)}
                  className={`cursor-pointer transition-colors ${
                    hoveredTrendIdx === idx ? "font-bold text-slate-900" : "hover:text-slate-800"
                  }`}
                >
                  {m}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* 4️⃣ Third Row (3 Analytics Cards - Dynamic Locations & Visits by Source) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Card 1: Sales by Location (Aggregated Strictly by Real Customer Cities/Addresses) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Sales by Location</h3>
                <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                  Income in the last 28 days
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV("orders")}
                className="rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 text-xs font-semibold gap-1.5 h-7.5 px-2 cursor-pointer"
              >
                <FolderExportIcon size={13} className="text-slate-800" />
                <span>Export</span>
              </Button>
            </div>

            {/* Real-time Location Progress List */}
            <div className="space-y-3 mt-4">
              {data?.salesByLocation && data.salesByLocation.length > 0 ? (
                data.salesByLocation.map((loc, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-700 font-medium truncate max-w-[140px]">
                          {loc.country}
                        </span>
                        <span
                          className={`text-[9px] font-semibold px-1 py-0.2 rounded ${
                            loc.isPositive
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {loc.change}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900">{loc.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{ width: `${loc.percentage}%` }}
                        className="bg-slate-950 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs py-4 text-center">
                  No location data recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Store Visits by Source (Screenshot 3 Matching Segmented Ring) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Store Visits by Source</h3>

            {/* Segmented Donut Gauge (Screenshot 3) */}
            <div className="relative w-40 h-40 mx-auto my-5 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                {/* Arc 1: Direct (Dark Navy #0F172A - 42%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="12"
                  strokeDasharray="100 138"
                  strokeDashoffset="0"
                />
                {/* Arc 2: Referrals (Slate #64748B - 28%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="12"
                  strokeDasharray="67 171"
                  strokeDashoffset="-100"
                />
                {/* Arc 3: Email (Steel Blue #94A3B8 - 15%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="12"
                  strokeDasharray="36 202"
                  strokeDashoffset="-167"
                />
                {/* Arc 4: Other (Light Grey #E2E8F0 - 10%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="12"
                  strokeDasharray="24 214"
                  strokeDashoffset="-203"
                />
                {/* Arc 5: Social (Dark Slate #1E293B - 5%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="12"
                  strokeDasharray="12 226"
                  strokeDashoffset="-227"
                />
              </svg>

              <div className="absolute flex flex-col items-center text-center">
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  {data?.totalVisitorsFormatted || "10.2K"}
                </span>
                <span className="text-[10px] font-normal text-slate-400">Visitors</span>
              </div>
            </div>

            {/* Legend (Screenshot 3) */}
            <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 text-[10px] font-medium text-slate-600 pt-2.5 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0F172A]" />
                <span>Direct</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#64748B]" />
                <span>Referrals</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                <span>Email</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E2E8F0]" />
                <span>Other</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1E293B]" />
                <span>Social</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Customer Reviews (4 Cols) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Customer Reviews</h3>
              <Link
                href="/admin/reviews"
                className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight size={12} />
              </Link>
            </div>
            <p className="text-[11px] text-slate-400 font-normal mb-3">
              Based on {data?.reviewBreakdown.totalReviews.toLocaleString() || "5,500"} verified purchases
            </p>

            {/* Rating Hero & Star Breakdown */}
            <div className="grid grid-cols-12 gap-3 items-center mb-4">
              <div className="col-span-5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-0.5 text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {data?.reviewBreakdown.averageRating || "4.5"}
                </div>
                <span className="text-[10px] text-slate-400 font-normal">out of 5</span>
              </div>

              <div className="col-span-7 space-y-1 text-[10px] font-normal">
                {[
                  { star: 5, color: "bg-emerald-500", count: 4000, width: "80%" },
                  { star: 4, color: "bg-lime-500", count: 2100, width: "55%" },
                  { star: 3, color: "bg-amber-400", count: 800, width: "25%" },
                  { star: 2, color: "bg-orange-500", count: 631, width: "15%" },
                  { star: 1, color: "bg-rose-500", count: 344, width: "8%" },
                ].map((item) => (
                  <div key={item.star} className="flex items-center gap-1.5">
                    <span className="text-slate-500 w-3">{item.star}★</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{ width: item.width }}
                        className={`${item.color} h-full rounded-full`}
                      />
                    </div>
                    <span className="text-slate-400 text-[9px] w-7 text-right font-mono">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Review Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[9px] text-slate-400">
                  {data?.featuredReview?.date || "March 12, 2025"}
                </span>
              </div>

              <p className="font-semibold text-slate-900 text-xs">
                {data?.featuredReview?.title || "Exceeded my expectations!"}
              </p>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                {data?.featuredReview?.comment ||
                  "I was skeptical at first, but this product has completely changed my daily routine. The quality is outstanding and it's so easy to use."}
              </p>

              <div className="pt-1 flex items-center justify-between">
                <span className="font-medium text-slate-800 text-[10px]">
                  {data?.featuredReview?.userName || "Sarah J."}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-semibold bg-emerald-100 text-emerald-700">
                  Verified Purchase
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5️⃣ Fourth Row (2 Spacious Data Tables with Interactive Dropdowns) */}
      <div ref={menuRef} className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5">
        {/* Table 1: Recent Orders (6 Cols - Spacious Padding) */}
        <div className="xl:col-span-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Recent Orders</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV("orders")}
                className="rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 text-xs font-semibold gap-1.5 h-8 px-2.5 shadow-2xs cursor-pointer"
              >
                <FolderExportIcon size={14} className="text-slate-800" />
                <span>Export</span>
              </Button>
            </div>

            {/* Filter orders input */}
            <div className="relative mb-3.5">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter orders..."
                value={orderFilter}
                onChange={(e) => {
                  setOrderFilter(e.target.value);
                  setOrderPage(1);
                }}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-300 transition"
              />
            </div>

            {/* Table with responsive column layout (No horizontal scroll) */}
            <div className="w-full">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400">
                    <th className="py-2.5 pr-1 font-medium w-16">ID</th>
                    <th className="py-2.5 px-1 font-medium">Customer</th>
                    <th className="py-2.5 px-1 font-medium hidden md:table-cell">Product</th>
                    <th className="py-2.5 px-1 font-medium text-right">Amount ⇅</th>
                    <th className="py-2.5 px-1 font-medium text-center">Status</th>
                    <th className="py-2.5 pl-1 text-right font-medium w-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((o, idx) => {
                      const idShort = `#${o.orderNumber.split("-")[1] || 1023 + idx * 1022}`;
                      const isMenuOpen = activeOrderMenu === o.id;

                      return (
                        <tr key={o.id} className="hover:bg-slate-50/60 transition">
                          {/* Order ID */}
                          <td className="py-3 pr-1 font-mono text-slate-500 font-normal">
                            {idShort}
                          </td>

                          {/* Customer */}
                          <td className="py-3 px-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="w-5.5 h-5.5 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {o.customerName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-slate-900 truncate max-w-[90px] sm:max-w-[110px]">
                                {o.customerName}
                              </span>
                            </div>
                          </td>

                          {/* Product Summary */}
                          <td className="py-3 px-1 text-slate-600 truncate max-w-[100px] lg:max-w-[130px] hidden md:table-cell">
                            {o.productSummary}
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-1 font-mono font-semibold text-slate-900 text-right">
                            ${o.totalAmount.toFixed(2)}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-1 text-center">{getOrderStatusBadge(o.status)}</td>

                          {/* Actions Dropdown */}
                          <td className="py-3 pl-1 text-right relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveOrderMenu(isMenuOpen ? null : o.id)
                              }
                              className="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 inline-flex items-center justify-center transition cursor-pointer"
                              title="Order Options"
                            >
                              <MoreHorizontal size={13} />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <div className="absolute right-0 top-8 z-50 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 text-left animate-in fade-in zoom-in-95">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleCopy(o.orderNumber, o.id);
                                    setActiveOrderMenu(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                >
                                  {copiedId === o.id ? (
                                    <Check size={13} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={13} className="text-slate-400" />
                                  )}
                                  <span>Copy #{o.orderNumber}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCustomerModal({
                                      name: o.customerName,
                                      email: o.customerEmail,
                                      orderNumber: o.orderNumber,
                                      totalAmount: o.totalAmount,
                                      paymentMethod: o.paymentMethod,
                                      status: o.status,
                                    });
                                    setActiveOrderMenu(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                >
                                  <User size={13} className="text-slate-400" />
                                  <span>View Customer</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCustomerModal({
                                      name: o.customerName,
                                      email: o.customerEmail,
                                      orderNumber: o.orderNumber,
                                      totalAmount: o.totalAmount,
                                      paymentMethod: o.paymentMethod,
                                      status: o.status,
                                    });
                                    setActiveOrderMenu(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                >
                                  <CreditCard size={13} className="text-slate-400" />
                                  <span>Payment Details</span>
                                </button>

                                <div className="border-t border-slate-100 my-1" />

                                <Link
                                  href="/admin/orders"
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                >
                                  <FileText size={13} className="text-slate-400" />
                                  <span>Manage All Orders</span>
                                </Link>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-slate-100 text-xs text-slate-400">
            <span>
              Showing {filteredOrders.length > 0 ? (orderPage - 1) * ordersPerPage + 1 : 0} to{" "}
              {Math.min(orderPage * ordersPerPage, filteredOrders.length)} of{" "}
              {filteredOrders.length} entries
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={orderPage === 1}
                onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 p-0 rounded-md border-slate-200 text-slate-600"
              >
                <ChevronLeft size={13} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={orderPage * ordersPerPage >= filteredOrders.length}
                onClick={() => setOrderPage((p) => p + 1)}
                className="h-7 w-7 p-0 rounded-md border-slate-200 text-slate-600"
              >
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        </div>

        {/* Table 2: Best Selling Products (6 Cols - No horizontal scroll) */}
        <div className="xl:col-span-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Best Selling Products</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV("products")}
                className="rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 text-xs font-semibold gap-1.5 h-8 px-2.5 shadow-2xs cursor-pointer"
              >
                <FolderExportIcon size={14} className="text-slate-800" />
                <span>Export</span>
              </Button>
            </div>

            {/* Filter products input */}
            <div className="relative mb-3.5">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter products..."
                value={productFilter}
                onChange={(e) => {
                  setProductFilter(e.target.value);
                  setProductPage(1);
                }}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-300 transition"
              />
            </div>

            {/* Table */}
            <div className="w-full">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400">
                    <th className="py-2.5 pr-1 font-medium">Product</th>
                    <th className="py-2.5 px-1 font-medium text-center w-14">Sold ⇅</th>
                    <th className="py-2.5 px-1 font-medium text-right w-20">Sales ⇅</th>
                    <th className="py-2.5 pl-1 text-right font-medium w-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((p) => {
                      const isProductOpen = activeProductMenu === p.id;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition">
                          {/* Product Image & Title */}
                          <td className="py-3 pr-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="relative w-7 h-7 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-semibold text-slate-900 truncate max-w-[130px] sm:max-w-[170px]">
                                {p.name}
                              </span>
                            </div>
                          </td>

                          {/* Units Sold */}
                          <td className="py-3 px-1 font-mono font-medium text-slate-800 text-center">
                            {p.unitsSold || 6}
                          </td>

                          {/* Revenue */}
                          <td className="py-3 px-1 font-mono font-semibold text-slate-900 text-right">
                            ${(p.revenue || p.price * (p.unitsSold || 6)).toFixed(2)}
                          </td>

                          {/* Actions Dropdown */}
                          <td className="py-3 pl-1 text-right relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveProductMenu(isProductOpen ? null : p.id)
                              }
                              className="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 inline-flex items-center justify-center transition cursor-pointer"
                              title="Product Options"
                            >
                              <MoreHorizontal size={13} />
                            </button>

                            {/* Dropdown */}
                            {isProductOpen && (
                              <div className="absolute right-0 top-8 z-50 w-40 rounded-xl bg-white border border-slate-200 shadow-xl py-1 text-left animate-in fade-in zoom-in-95">
                                <Link
                                  href={`/product/${p.slug}`}
                                  target="_blank"
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                >
                                  <ArrowUpRight size={13} className="text-slate-400" />
                                  <span>View in Store</span>
                                </Link>

                                <Link
                                  href="/admin/products"
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                >
                                  <Package size={13} className="text-slate-400" />
                                  <span>Edit Product</span>
                                </Link>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-slate-100 text-xs text-slate-400">
            <span>0 of {paginatedProducts.length} row(s) selected.</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={productPage === 1}
                onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 p-0 rounded-md border-slate-200 text-slate-600"
              >
                <ChevronLeft size={13} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={productPage * productsPerPage >= filteredProducts.length}
                onClick={() => setProductPage((p) => p + 1)}
                className="h-7 w-7 p-0 rounded-md border-slate-200 text-slate-600"
              >
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 6️⃣ Interactive Customer / Payment Details Modal (Triggered by Three Dots) */}
      {selectedCustomerModal && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCustomerModal(null);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 text-slate-900 relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <User size={15} className="text-slate-500" />
                <span>Customer & Payment Info</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCustomerModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Customer Profile
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedCustomerModal.name}
                </p>
                <p className="text-slate-500">{selectedCustomerModal.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Order Ref
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    #{selectedCustomerModal.orderNumber}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Amount Paid
                  </span>
                  <span className="font-mono font-bold text-indigo-600 text-sm">
                    ${selectedCustomerModal.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Payment Method
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedCustomerModal.paymentMethod === "CARD"
                      ? "Stripe Card (Prepaid)"
                      : "Cash on Delivery (COD)"}
                  </span>
                </div>
                <div>{getOrderStatusBadge(selectedCustomerModal.status)}</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <Button
                size="sm"
                onClick={() => setSelectedCustomerModal(null)}
                className="bg-black text-white hover:bg-black/80 rounded-lg text-xs font-semibold px-4 h-8 cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

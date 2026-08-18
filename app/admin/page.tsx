"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Search,
  Star,
  MoreHorizontal,
  ArrowUpDown,
  CheckCircle2,
  Share2,
  RefreshCw,
  Eye,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AdminAnalyticsData } from "@/services/analytics.service";

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

  // Hover state for Bar Chart
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

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

  // Dynamic admin name for the celebration card
  const adminFirstName =
    user?.firstName || user?.fullName?.split(" ")[0] || "Toby";

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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-600 border border-sky-200">
          Processing
        </span>
      );
    }
    if (s === "DELIVERED" || s === "SUCCESS") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
          Success
        </span>
      );
    }
    if (s === "SHIPPED" || s === "PAID") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
          Paid
        </span>
      );
    }
    if (s === "CANCELLED" || s === "FAILED" || s === "RETURNED_REFUSED") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 font-satoshi text-slate-900">
      {/* 1️⃣ Top Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            E-Commerce Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Date Range Picker Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar size={14} className="text-slate-400" />
            <span>22 Jul 2026 - 18 Aug 2026</span>
          </div>

          {/* Download / Export Button */}
          <Button
            size="sm"
            onClick={() => handleExportCSV("orders")}
            className="bg-black text-white hover:bg-black/80 rounded-xl text-xs font-bold gap-1.5 h-8.5 px-3.5 cursor-pointer shadow-xs"
          >
            <Download size={13} />
            <span>Download</span>
          </Button>

          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(true)}
            className="rounded-xl h-8.5 w-8.5 p-0 border-slate-200 cursor-pointer"
            title="Refresh analytics"
          >
            <RefreshCw
              size={13}
              className={`text-slate-600 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* 2️⃣ Top Metric Cards Row (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Congratulations Banner Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-pink-50/30 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          {/* Confetti Background Decoration */}
          <div className="absolute top-2 right-2 text-xl select-none opacity-80 animate-pulse">
            🎉
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-200/20 rounded-full blur-xl pointer-events-none" />

          <div>
            <h3 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-1.5">
              <span>Congratulations {adminFirstName}!</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Best seller of the month
            </p>

            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                ${data?.overview.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "15,231.89"}
              </span>
              <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                <span>+65% from last month</span>
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Link
              href="/admin/orders"
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition cursor-pointer"
            >
              View Sales
            </Link>
          </div>
        </div>

        {/* Card 2: Monthly Recurring Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium truncate">
                Monthly recurring r...
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                +{data?.overview.monthlyGrowthPercent || 6.1}%
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                $34.1K
              </span>
            </div>
          </div>
          <div className="mt-6 pt-3 border-t border-slate-100">
            <Link
              href="/admin/orders"
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center justify-between group"
            >
              <span>View more</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>

        {/* Card 3: Users */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium">Users</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                +{data?.overview.usersGrowthPercent || 19.2}%
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                500.1K
              </span>
            </div>
          </div>
          <div className="mt-6 pt-3 border-t border-slate-100">
            <Link
              href="/admin/customers"
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center justify-between group"
            >
              <span>View more</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>

        {/* Card 4: User Growth */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium">User growth</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                -1.2%
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {data?.overview.conversionRate || 11.3}%
              </span>
            </div>
          </div>
          <div className="mt-6 pt-3 border-t border-slate-100">
            <Link
              href="/admin/reviews"
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center justify-between group"
            >
              <span>View more</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3️⃣ Middle Row (2 Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Chart: Total Revenue Bar Chart (7 Cols) */}
        <div className="lg:col-span-6 xl:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-950">Total Revenue</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Income in the last 28 days
              </p>
            </div>

            {/* Desktop & Mobile Split Box */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 text-[11px]">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">
                  DESKTOP
                </span>
                <span className="font-extrabold text-slate-900">
                  {data?.desktopMobileSplit.desktopCount.toLocaleString() || "24,828"}
                </span>
              </div>
              <div className="w-[1px] h-6 bg-slate-200" />
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">
                  MOBILE
                </span>
                <span className="font-extrabold text-slate-900">
                  {data?.desktopMobileSplit.mobileCount.toLocaleString() || "25,010"}
                </span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart with Rounded Bars */}
          <div className="h-56 w-full flex items-end justify-between gap-2 pt-6 px-2">
            {[
              { label: "W1", h1: 65, h2: 55 },
              { label: "W2", h1: 85, h2: 45 },
              { label: "W3", h1: 95, h2: 35 },
              { label: "W4", h1: 50, h2: 70 },
              { label: "W5", h1: 90, h2: 40 },
              { label: "W6", h1: 75, h2: 60 },
            ].map((bar, idx) => (
              <div
                key={idx}
                className="flex-1 flex items-end justify-center gap-1.5 h-full group relative cursor-pointer"
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Desktop Bar (Dark Black) */}
                <div
                  style={{ height: `${bar.h1}%` }}
                  className="w-3 sm:w-4 bg-slate-950 rounded-t-md transition-all duration-300 group-hover:bg-indigo-600"
                />
                {/* Mobile Bar (Slate Grey) */}
                <div
                  style={{ height: `${bar.h2}%` }}
                  className="w-3 sm:w-4 bg-slate-400/80 rounded-t-md transition-all duration-300 group-hover:bg-slate-600"
                />

                {/* Tooltip */}
                {hoveredBar === idx && (
                  <div className="absolute -top-9 bg-black text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10 animate-in fade-in">
                    ${((bar.h1 + bar.h2) * 180).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chart X-Axis Labels */}
          <div className="flex justify-between px-2 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-400 uppercase">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
            <span>Week 5</span>
            <span>Week 6</span>
          </div>
        </div>

        {/* Right Chart: Returning Rate Multi-Line Chart (6 Cols) */}
        <div className="lg:col-span-6 xl:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-950">Returning Rate</h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-950 tracking-tight">
                  ${data?.overview.returningRateValue.toLocaleString() || "$42,379"}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                  +{data?.overview.returningRateGrowth || 2.5}%
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV("orders")}
              className="rounded-xl text-xs font-semibold gap-1.5 h-7.5 px-2.5 border-slate-200 cursor-pointer"
            >
              <Share2 size={12} />
              <span>Export</span>
            </Button>
          </div>

          {/* SVG Smooth Multi-Wave Curves Chart */}
          <div className="h-56 w-full relative flex items-center justify-center pt-2">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 500 200"
              preserveAspectRatio="none"
            >
              {/* Subtle Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

              {/* Gradient Shading */}
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f172a" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Area 1 */}
              <path
                d="M 0 160 Q 60 180 120 120 T 240 100 T 360 60 T 500 40 L 500 200 L 0 200 Z"
                fill="url(#rateGrad)"
              />

              {/* Line 1 (Dark Crisp Wave) */}
              <path
                d="M 0 160 Q 60 180 120 120 T 240 100 T 360 60 T 500 40"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Line 2 (Secondary Slate Wave) */}
              <path
                d="M 0 190 Q 60 195 120 160 T 240 140 T 360 110 T 500 90"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          <div className="flex justify-between px-2 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-400 uppercase">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </div>
      </div>

      {/* 4️⃣ Third Row (3 Analytics Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Card 1: Sales by Location (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-950">Sales by Location</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Income in the last 28 days
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV("orders")}
                className="rounded-xl text-xs font-semibold gap-1.5 h-7.5 px-2 border-slate-200 cursor-pointer"
              >
                <Share2 size={11} />
                <span>Export</span>
              </Button>
            </div>

            {/* Location Progress List */}
            <div className="space-y-3.5 mt-5">
              {(data?.salesByLocation || [
                { country: "Canada", change: "+5.2%", percentage: 85, isPositive: true },
                { country: "Greenland", change: "+7.8%", percentage: 80, isPositive: true },
                { country: "Russia", change: "-2.1%", percentage: 63, isPositive: false },
                { country: "China", change: "+3.4%", percentage: 60, isPositive: true },
                { country: "Australia", change: "+1.2%", percentage: 45, isPositive: true },
                { country: "Greece", change: "+1%", percentage: 40, isPositive: true },
              ]).map((loc, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800">{loc.country}</span>
                      <span
                        className={`text-[10px] font-bold px-1 py-0.2 rounded ${
                          loc.isPositive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {loc.change}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">{loc.percentage}%</span>
                  </div>
                  {/* Dark Rounded Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      style={{ width: `${loc.percentage}%` }}
                      className="bg-slate-950 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Store Visits by Source (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-950">Store Visits by Source</h3>

            {/* Center Donut Gauge */}
            <div className="relative w-44 h-44 mx-auto my-6 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                {/* Arc 1: Direct */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="12"
                  strokeDasharray="100 138"
                  strokeDashoffset="0"
                />
                {/* Arc 2: Referrals */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="12"
                  strokeDasharray="65 173"
                  strokeDashoffset="-100"
                />
                {/* Arc 3: Email */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="12"
                  strokeDasharray="35 203"
                  strokeDashoffset="-165"
                />
              </svg>

              <div className="absolute flex flex-col items-center text-center">
                <span className="text-2xl font-black text-slate-950 tracking-tight">
                  10.2K
                </span>
                <span className="text-[11px] font-semibold text-slate-400">Visitors</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-950" />
                <span>Direct</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Referrals</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-800" />
                <span>Email</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span>Other</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span>Social</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Customer Reviews (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base font-extrabold text-slate-950">Customer Reviews</h3>
              <Link
                href="/admin/reviews"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight size={13} />
              </Link>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Based on {data?.reviewBreakdown.totalReviews.toLocaleString() || "5,500"} verified purchases
            </p>

            {/* Rating Hero & Star Breakdown */}
            <div className="grid grid-cols-12 gap-3 items-center mb-5">
              {/* Left Score */}
              <div className="col-span-5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-0.5 text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-3xl font-black text-slate-950">
                  {data?.reviewBreakdown.averageRating || "4.5"}
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">out of 5</span>
              </div>

              {/* Right Star Bars */}
              <div className="col-span-7 space-y-1 text-[11px] font-semibold">
                {[
                  { star: 5, color: "bg-emerald-500", count: 4000, width: "80%" },
                  { star: 4, color: "bg-lime-500", count: 2100, width: "55%" },
                  { star: 3, color: "bg-amber-400", count: 800, width: "25%" },
                  { star: 2, color: "bg-orange-500", count: 631, width: "15%" },
                  { star: 1, color: "bg-rose-500", count: 344, width: "8%" },
                ].map((item) => (
                  <div key={item.star} className="flex items-center gap-2">
                    <span className="text-slate-600 w-3">{item.star}★</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{ width: item.width }}
                        className={`${item.color} h-full rounded-full`}
                      />
                    </div>
                    <span className="text-slate-400 text-[10px] w-8 text-right font-mono">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Review Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400">
                  {data?.featuredReview?.date || "March 12, 2025"}
                </span>
              </div>

              <p className="font-bold text-slate-900 text-xs">
                {data?.featuredReview?.title || "Exceeded my expectations!"}
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {data?.featuredReview?.comment ||
                  "I was skeptical at first, but this product has completely changed my daily routine. The quality is outstanding and it's so easy to use."}
              </p>

              <div className="pt-1 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-[11px]">
                  {data?.featuredReview?.userName || "Sarah J."}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                  Verified Purchase
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5️⃣ Fourth Row (2 Data Tables - Recent Orders & Best Selling Products) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6">
        {/* Table 1: Recent Orders (6 Cols) */}
        <div className="xl:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-base font-extrabold text-slate-950">Recent Orders</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV("orders")}
                className="rounded-xl text-xs font-semibold gap-1.5 h-7.5 px-2.5 border-slate-200 cursor-pointer"
              >
                <Share2 size={11} />
                <span>Export</span>
              </Button>
            </div>

            {/* Filter orders input */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter orders..."
                value={orderFilter}
                onChange={(e) => {
                  setOrderFilter(e.target.value);
                  setOrderPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 transition"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400">
                    <th className="pb-2.5 font-bold">ID</th>
                    <th className="pb-2.5 font-bold">Customer</th>
                    <th className="pb-2.5 font-bold">Product</th>
                    <th className="pb-2.5 font-bold">Amount ⇅</th>
                    <th className="pb-2.5 font-bold">Status</th>
                    <th className="pb-2.5 text-right font-bold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((o, idx) => {
                      const idShort = `#${o.orderNumber.split("-")[1] || 1023 + idx * 1022}`;
                      return (
                        <tr key={o.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 font-mono text-slate-600 font-medium">
                            {idShort}
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
                                {o.customerName.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900 truncate max-w-[100px]">
                                {o.customerName}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 text-slate-600 truncate max-w-[110px]">
                            {o.productSummary}
                          </td>
                          <td className="py-2.5 font-mono font-bold text-slate-900">
                            ${o.totalAmount.toFixed(2)}
                          </td>
                          <td className="py-2.5">{getOrderStatusBadge(o.status)}</td>
                          <td className="py-2.5 text-right">
                            <Link
                              href="/admin/orders"
                              className="text-slate-400 hover:text-slate-700"
                            >
                              <MoreHorizontal size={14} />
                            </Link>
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
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing {filteredOrders.length > 0 ? (orderPage - 1) * ordersPerPage + 1 : 0} to{" "}
              {Math.min(orderPage * ordersPerPage, filteredOrders.length)} of{" "}
              {filteredOrders.length} entries
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={orderPage === 1}
                onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 p-0 rounded-lg border-slate-200"
              >
                <ChevronLeft size={13} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={orderPage * ordersPerPage >= filteredOrders.length}
                onClick={() => setOrderPage((p) => p + 1)}
                className="h-7 w-7 p-0 rounded-lg border-slate-200"
              >
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        </div>

        {/* Table 2: Best Selling Products (6 Cols) */}
        <div className="xl:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-base font-extrabold text-slate-950">Best Selling Products</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV("products")}
                className="rounded-xl text-xs font-semibold gap-1.5 h-7.5 px-2.5 border-slate-200 cursor-pointer"
              >
                <Share2 size={11} />
                <span>Export</span>
              </Button>
            </div>

            {/* Filter products input */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter products..."
                value={productFilter}
                onChange={(e) => {
                  setProductFilter(e.target.value);
                  setProductPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 transition"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400">
                    <th className="pb-2.5 font-bold">Product</th>
                    <th className="pb-2.5 font-bold">Sold ⇅</th>
                    <th className="pb-2.5 font-bold">Sales ⇅</th>
                    <th className="pb-2.5 text-right font-bold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-bold text-slate-900 truncate max-w-[160px]">
                              {p.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 font-mono font-bold text-slate-900">
                          {p.unitsSold || 10}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-slate-900">
                          ${(p.revenue || p.price * (p.unitsSold || 10)).toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right">
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="text-slate-400 hover:text-slate-700"
                          >
                            <MoreHorizontal size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))
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
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>0 of {paginatedProducts.length} row(s) selected.</span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={productPage === 1}
                onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 p-0 rounded-lg border-slate-200"
              >
                <ChevronLeft size={13} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={productPage * productsPerPage >= filteredProducts.length}
                onClick={() => setProductPage((p) => p + 1)}
                className="h-7 w-7 p-0 rounded-lg border-slate-200"
              >
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

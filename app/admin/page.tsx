"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Download,
  ArrowRight,
  FileSpreadsheet,
  Star,
  ChevronRight,
  ChevronLeft,
  Search,
  MoreHorizontal,
  Copy,
  User,
  CreditCard,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function EcommerceDashboardPage() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
      setOpenActionMenuId(null);
    }, 1500);
  };

  // 6-Month Dual Bar Chart Data (Desktop vs Mobile)
  const revenueComparisonData = [
    { month: "January", desktop: 65, mobile: 55, desktopVal: "$21,400", mobileVal: "$18,200" },
    { month: "February", desktop: 88, mobile: 68, desktopVal: "$28,900", mobileVal: "$22,400" },
    { month: "March", desktop: 85, mobile: 42, desktopVal: "$27,800", mobileVal: "$14,100" },
    { month: "April", desktop: 45, mobile: 68, desktopVal: "$15,200", mobileVal: "$22,500" },
    { month: "May", desktop: 40, mobile: 48, desktopVal: "$13,600", mobileVal: "$16,200" },
    { month: "June", desktop: 92, mobile: 52, desktopVal: "$30,500", mobileVal: "$17,400" },
  ];

  const returningMonths = [
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "October",
    "December",
  ];

  // Section 3: Sales by Location
  const salesByLocation = [
    { country: "Canada", change: "+5.2%", positive: true, percentage: 85 },
    { country: "Greenland", change: "+7.8%", positive: true, percentage: 80 },
    { country: "Russia", change: "-2.1%", positive: false, percentage: 63 },
    { country: "China", change: "+3.4%", positive: true, percentage: 60 },
    { country: "Australia", change: "+1.2%", positive: true, percentage: 45 },
    { country: "Greece", change: "+1%", positive: true, percentage: 40 },
  ];

  // Section 3: Customer Review Stars Breakdown
  const reviewBreakdown = [
    { stars: 5, count: 4000, percentage: 72, color: "bg-emerald-500" },
    { stars: 4, count: 2100, percentage: 38, color: "bg-lime-500" },
    { stars: 3, count: 800, percentage: 14, color: "bg-amber-400" },
    { stars: 2, count: 631, percentage: 11, color: "bg-orange-500" },
    { stars: 1, count: 344, percentage: 6, color: "bg-rose-500" },
  ];

  // Section 4: Recent Orders
  const recentOrdersData = [
    { id: "#1023", customer: "Theodore Bell", avatar: "TB", product: "T-shirt with Tape Details", amount: "$300.00", status: "Processing", statusColor: "border-sky-500/30 text-sky-600 bg-sky-50 " },
    { id: "#2045", customer: "Amelia Grant", avatar: "AG", product: "Skinny Fit Jeans", amount: "$450.00", status: "Paid", statusColor: "border-amber-500/30 text-amber-600 bg-amber-50 " },
    { id: "#3067", customer: "Eleanor Ward", avatar: "EW", product: "Checkered Shirt", amount: "$200.00", status: "Success", statusColor: "border-emerald-500/30 text-emerald-600 bg-emerald-50 " },
    { id: "#4089", customer: "Henry Carter", avatar: "HC", product: "Sleeve Striped T-Shirt", amount: "$500.00", status: "Processing", statusColor: "border-sky-500/30 text-sky-600 bg-sky-50 " },
    { id: "#5102", customer: "Olivia Harris", avatar: "OH", product: "Vertical Striped Shirt", amount: "$350.00", status: "Failed", statusColor: "border-rose-500/30 text-rose-600 bg-rose-50 " },
    { id: "#6123", customer: "James Robinson", avatar: "JR", product: "Courage Graphic T-Shirt", amount: "$180.00", status: "Paid", statusColor: "border-amber-500/30 text-amber-600 bg-amber-50 " },
    { id: "#7145", customer: "Sophia Martinez", avatar: "SM", product: "Loose Fit Bermuda Shorts", amount: "$220.00", status: "Success", statusColor: "border-emerald-500/30 text-emerald-600 bg-emerald-50 " },
    { id: "#8167", customer: "Liam Thompson", avatar: "LT", product: "Faded Skinny Jeans", amount: "$290.00", status: "Processing", statusColor: "border-sky-500/30 text-sky-600 bg-sky-50 " },
  ];

  // Section 4: Best Selling Products (Real Catalog Images)
  const bestSellingProductsData = [
    { name: "Sports Shoes", image: "/images/product-1.png", sold: "$316.00", sales: 10 },
    { name: "Black T-Shirt", image: "/images/product-2.png", sold: "$274.00", sales: 20 },
    { name: "Jeans", image: "/images/product-3.png", sold: "$195.00", sales: 15 },
    { name: "Red Sneakers", image: "/images/product-4.png", sold: "$402.00", sales: 40 },
    { name: "Red Scarf", image: "/images/product-5.png", sold: "$280.00", sales: 37 },
    { name: "Casual Cap", image: "/images/product-6.png", sold: "$150.00", sales: 18 },
    { name: "Classic Polo", image: "/images/product-7.png", sold: "$316.00", sales: 25 },
    { name: "Oversized Hoodie", image: "/images/product-8.png", sold: "$290.00", sales: 12 },
  ];

  const filteredOrders = recentOrdersData.filter(
    (o) =>
      o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.product.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredProducts = bestSellingProductsData.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-8">
      {/* 1️⃣ TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            E-Commerce Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time sales & fashion catalog analytics for SHOP.CO
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>17 Jul 2026 – 13 Aug 2026</span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition shadow-2xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* 2️⃣ STAT KPI CARDS (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="p-5 flex flex-col justify-between relative overflow-hidden bg-card border-border">
          <div className="absolute top-2 right-3 text-sm opacity-60">🎉</div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Welcome back, Admin! 🎉
            </h3>
            <p className="text-xs text-muted-foreground">Best seller of the month</p>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold font-integral text-foreground">
                $15,231.89
              </span>
              <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                +65% from last month
              </p>
            </div>

            <Link href="/admin/orders">
              <button
                type="button"
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition shadow-2xs cursor-pointer"
              >
                View Sales
              </button>
            </Link>
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="p-5 flex flex-col justify-between bg-card border-border">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium truncate">
                Monthly recurring r...
              </span>
              <span className="text-xs font-semibold text-emerald-600">+6.1%</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold font-integral text-foreground">
                $34.1K
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-2.5 mt-4">
            <Link
              href="/admin/orders"
              className="w-full flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <span>View more</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="p-5 flex flex-col justify-between bg-card border-border">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Users</span>
              <span className="text-xs font-semibold text-emerald-600">+19.2%</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold font-integral text-foreground">
                500.1K
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-2.5 mt-4">
            <Link
              href="/admin/orders"
              className="w-full flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <span>View more</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Card 4 */}
        <Card className="p-5 flex flex-col justify-between bg-card border-border">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">User growth</span>
              <span className="text-xs font-semibold text-rose-500">-1.2%</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold font-integral text-foreground">
                11.3%
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-2.5 mt-4">
            <Link
              href="/admin/products"
              className="w-full flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <span>View more</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* 3️⃣ SECTION 2: 2-Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Total Revenue */}
        <Card className="p-6 bg-card border-border flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Total Revenue</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Income in the last 28 days
              </p>
            </div>

            <div className="flex items-center gap-5 rounded-xl border border-border bg-muted/30 px-4 py-2 text-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Desktop
                </p>
                <p className="text-sm font-bold font-integral text-foreground">24,828</p>
              </div>
              <div className="h-6 w-px bg-border" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Mobile
                </p>
                <p className="text-sm font-bold font-integral text-foreground">25,010</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 pt-4 pb-2 border-b border-border">
              {revenueComparisonData.map((item, idx) => (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {hoveredBar === idx && (
                    <div className="absolute -top-12 z-20 whitespace-nowrap rounded-xl bg-primary text-primary-foreground px-2.5 py-1 text-[10px] shadow-xl">
                      <p className="font-bold">Desktop: {item.desktopVal}</p>
                      <p className="text-[9px] opacity-80">Mobile: {item.mobileVal}</p>
                    </div>
                  )}

                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    <div
                      style={{ height: `${item.desktop}%` }}
                      className="w-full max-w-[30px] rounded-t-lg bg-[#18181B] dark:bg-black transition-all duration-300 group-hover:opacity-90"
                    />
                    <div
                      style={{ height: `${item.mobile}%` }}
                      className="w-full max-w-[30px] rounded-t-lg bg-[#71717A] dark:bg-zinc-700 transition-all duration-300 group-hover:opacity-90"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 px-1 text-[11px] font-medium text-muted-foreground">
              {revenueComparisonData.map((d) => (
                <span key={d.month}>{d.month}</span>
              ))}
            </div>
          </div>
        </Card>

        {/* Right Card: Returning Rate */}
        <Card className="p-6 bg-card border-border flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Returning Rate</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold font-integral text-foreground">
                  $42,379
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  +2.5%
                </span>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Export</span>
            </button>
          </div>

          <div className="mt-8">
            <div className="relative h-56 w-full">
              <svg
                viewBox="0 0 500 170"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <line x1="0" y1="20" x2="500" y2="20" stroke="currentColor" className="text-border/40" strokeDasharray="3 3" />
                <line x1="0" y1="65" x2="500" y2="65" stroke="currentColor" className="text-border/40" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="currentColor" className="text-border/40" strokeDasharray="3 3" />
                <line x1="0" y1="155" x2="500" y2="155" stroke="currentColor" className="text-border" />

                <path
                  d="M 10 145 L 75 125 L 140 140 L 205 130 L 270 142 L 335 138 L 400 120 L 465 135 L 495 98"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground/40"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M 10 115 L 75 98 L 140 110 L 205 68 L 270 80 L 335 62 L 400 120 L 465 72 L 495 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className="text-foreground"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between pt-3 px-1 text-[11px] font-medium text-muted-foreground">
              {returningMonths.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 4️⃣ SECTION 3: 3-Column Row (Sales by Location | Store Visits | Customer Reviews) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Card 1: Sales by Location */}
        <Card className="p-6 bg-card border-border lg:col-span-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Sales by Location</h3>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition cursor-pointer"
              >
                <FileSpreadsheet className="h-3 w-3 text-muted-foreground" />
                <span>Export</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Income in the last 28 days</p>

            <div className="space-y-4 mt-6">
              {salesByLocation.map((loc) => (
                <div key={loc.country} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{loc.country}</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                          loc.positive
                            ? "text-emerald-700 bg-emerald-50  dark:text-emerald-400"
                            : "text-rose-700 bg-rose-50  dark:text-rose-400"
                        }`}
                      >
                        {loc.change}
                      </span>
                    </div>
                    <span className="font-bold text-foreground font-mono">{loc.percentage}%</span>
                  </div>
                  {/* Clean light track with solid primary fill */}
                  <div className="h-2 w-full rounded-full bg-[#E4E4E7]  overflow-hidden">
                    <div
                      style={{ width: `${loc.percentage}%` }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Card 2: Store Visits by Source */}
        <Card className="p-6 bg-card border-border lg:col-span-3 flex flex-col items-center justify-between text-center shadow-xs">
          <div className="w-full text-left">
            <h3 className="text-base font-bold text-foreground">Store Visits by Source</h3>
          </div>

          {/* Large Centered Metric Number */}
          <div className="flex flex-col items-center justify-center my-auto py-12">
            <span className="text-4xl font-extrabold font-integral text-foreground">
              10.2K
            </span>
            <span className="text-xs text-muted-foreground mt-1">Visitors</span>
          </div>

          {/* Legend */}
          <div className="w-full space-y-2.5 text-[11px] text-muted-foreground pt-2">
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Direct
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/60" /> Referrals
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" /> Email
              </span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" /> Other
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Social
              </span>
            </div>
          </div>
        </Card>

        {/* Card 3: Customer Reviews */}
        <Card className="p-6 bg-card border-border lg:col-span-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Customer Reviews</h3>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Based on 5,500 verified purchases</p>

            {/* Top Score & Stars Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mt-5">
              {/* Left Score */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-0.5 text-amber-400 mb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-4xl font-extrabold font-integral text-foreground leading-none">
                  4.5
                </span>
                <span className="text-xs text-muted-foreground mt-1.5">out of 5</span>
              </div>

              {/* Right Bars */}
              <div className="sm:col-span-7 space-y-1.5 text-xs">
                {reviewBreakdown.map((r) => (
                  <div key={r.stars} className="flex items-center gap-2">
                    <span className="w-5 text-muted-foreground text-right">{r.stars}★</span>
                    <div className="h-2 flex-1 rounded-full bg-[#E4E4E7]  overflow-hidden">
                      <div
                        style={{ width: `${r.percentage}%` }}
                        className={`h-full rounded-full ${r.color}`}
                      />
                    </div>
                    <span className="w-9 text-right text-muted-foreground text-[11px] font-mono">
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Light Testimonial Box */}
            <div className="mt-5 p-4 rounded-xl bg-muted/40 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground">March 12, 2025</span>
              </div>
              <h5 className="font-bold text-xs text-foreground">
                Exceeded my expectations!
              </h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                I was skeptical at first, but this product has completely changed my daily routine. The quality is outstanding and it&apos;s so easy to use.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-foreground">Sarah J.</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-600  dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold">
                  Verified Purchase
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 5️⃣ SECTION 4: 2-Column Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Table: Recent Orders */}
        <Card className="p-6 bg-card border-border flex flex-col justify-between relative shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Recent Orders</h3>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Export</span>
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
              />
            </div>

            <div className="overflow-x-auto min-h-[360px]">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2 px-1">ID</th>
                    <th className="py-2 px-1">Customer</th>
                    <th className="py-2 px-1">Product</th>
                    <th className="py-2 px-1">Amount ⇅</th>
                    <th className="py-2 px-1">Status</th>
                    <th className="py-2 px-1 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-muted/30 transition relative">
                      <td className="py-2.5 px-1 font-mono text-muted-foreground">{ord.id}</td>
                      <td className="py-2.5 px-1">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                            {ord.avatar}
                          </div>
                          <span className="font-medium text-foreground truncate max-w-[100px]">
                            {ord.customer}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-1 text-muted-foreground truncate max-w-[120px]">
                        {ord.product}
                      </td>
                      <td className="py-2.5 px-1 font-semibold text-foreground">{ord.amount}</td>
                      <td className="py-2.5 px-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${ord.statusColor}`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-1 text-right relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenActionMenuId(openActionMenuId === ord.id ? null : ord.id)
                          }
                          className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition cursor-pointer"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>

                        {openActionMenuId === ord.id && (
                          <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-xl text-left animate-in fade-in-50 zoom-in-95">
                            <button
                              type="button"
                              onClick={() => handleCopyOrderId(ord.id)}
                              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                            >
                              {copiedId === ord.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              <span>{copiedId === ord.id ? "Copied!" : "Copy order ID"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenActionMenuId(null)}
                              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                            >
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>View customer</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenActionMenuId(null)}
                              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                            >
                              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>View payment details</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border mt-4 text-xs text-muted-foreground">
            <span>Showing 1 to 8 of 16 entries</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="p-1 rounded-md border border-border hover:bg-muted text-muted-foreground disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="p-1 rounded-md border border-border hover:bg-muted text-muted-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </Card>

        {/* Right Table: Best Selling Products */}
        <Card className="p-6 bg-card border-border flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Best Selling Products</h3>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Export</span>
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
              />
            </div>

            <div className="overflow-x-auto min-h-[360px]">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2 px-1">Product</th>
                    <th className="py-2 px-1">Sold ⇅</th>
                    <th className="py-2 px-1">Sales ⇅</th>
                    <th className="py-2 px-1 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition">
                      <td className="py-2.5 px-1">
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-8 w-8 rounded-lg bg-muted p-0.5 shrink-0 overflow-hidden border border-border/40">
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              fill
                              className="object-contain"
                              sizes="32px"
                            />
                          </div>
                          <span className="font-semibold text-foreground truncate max-w-[140px]">
                            {prod.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-1 font-semibold text-foreground">{prod.sold}</td>
                      <td className="py-2.5 px-1 font-mono text-muted-foreground">{prod.sales}</td>
                      <td className="py-2.5 px-1 text-right">
                        <button type="button" className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border mt-4 text-xs text-muted-foreground">
            <span>0 of 8 row(s) selected.</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="p-1 rounded-md border border-border hover:bg-muted text-muted-foreground disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="p-1 rounded-md border border-border hover:bg-muted text-muted-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

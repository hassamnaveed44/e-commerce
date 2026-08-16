"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRight,
  Search,
  Check,
  Copy,
  ExternalLink,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  Banknote,
  ChevronDown,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AdminAnalyticsData } from "@/services/analytics.service";

const ORDER_STATUS_OPTIONS = [
  { value: "PROCESSING", label: "Processing", color: "text-sky-700 bg-sky-50 border-sky-200" },
  { value: "SHIPPED", label: "Shipped", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  { value: "DELIVERED", label: "Delivered", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { value: "PENDING_PAYMENT", label: "Pending Payment", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { value: "CANCELLED", label: "Cancelled", color: "text-rose-700 bg-rose-50 border-rose-200" },
  { value: "RETURNED_REFUSED", label: "Returned / Refused", color: "text-gray-700 bg-gray-100 border-gray-300" },
];

export default function EcommerceDashboardPage() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Status updating state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenStatusMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setOpenStatusMenuId(null);
    setUpdatingOrderId(orderId);

    // Optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        recentOrders: prev.recentOrders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        ),
      };
    });

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusFeedback(`Order status updated to ${newStatus}`);
        setTimeout(() => setStatusFeedback(null), 3000);
        // Refresh analytics in background to recalculate revenue & counts
        fetchAnalytics(true);
      } else {
        alert(json.error || "Failed to update status");
        fetchAnalytics(true);
      }
    } catch (err) {
      console.error("Status update error:", err);
      fetchAnalytics(true);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const renderStatusBadge = (order: { id: string; status: string }) => {
    const isUpdating = updatingOrderId === order.id;
    const isMenuOpen = openStatusMenuId === order.id;

    const matchedConfig = ORDER_STATUS_OPTIONS.find((s) => s.value === order.status) || {
      value: order.status,
      label: order.status,
      color: "text-gray-700 bg-gray-50 border-gray-200",
    };

    let Icon = Clock;
    if (order.status === "DELIVERED") Icon = CheckCircle2;
    else if (order.status === "PROCESSING" || order.status === "SHIPPED") Icon = Truck;
    else if (order.status === "CANCELLED") Icon = XCircle;
    else if (order.status === "RETURNED_REFUSED") Icon = RotateCcw;

    return (
      <div className="relative inline-block" ref={isMenuOpen ? dropdownRef : null}>
        <button
          type="button"
          onClick={() => setOpenStatusMenuId(isMenuOpen ? null : order.id)}
          disabled={isUpdating}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer hover:shadow-xs disabled:opacity-50 ${matchedConfig.color}`}
          title="Click to change order status"
        >
          {isUpdating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Icon size={12} className="shrink-0" />
          )}
          <span>{matchedConfig.label}</span>
          <ChevronDown size={12} className="shrink-0 opacity-60" />
        </button>

        {/* Dropdown Menu to change status */}
        {isMenuOpen && (
          <div className="absolute left-0 mt-1.5 w-44 bg-card border border-border rounded-xl shadow-lg p-1 z-30 animate-in fade-in zoom-in-95">
            <p className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider border-b border-border mb-1">
              Change Status
            </p>
            <div className="space-y-0.5">
              {ORDER_STATUS_OPTIONS.map((opt) => {
                const isSelected = opt.value === order.status;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleUpdateOrderStatus(order.id, opt.value)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-muted text-foreground font-bold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          opt.value === "DELIVERED"
                            ? "bg-emerald-500"
                            : opt.value === "PROCESSING"
                            ? "bg-sky-500"
                            : opt.value === "SHIPPED"
                            ? "bg-indigo-500"
                            : opt.value === "CANCELLED"
                            ? "bg-rose-500"
                            : opt.value === "PENDING_PAYMENT"
                            ? "bg-amber-500"
                            : "bg-gray-400"
                        }`}
                      />
                      {opt.label}
                    </span>
                    {isSelected && <Check size={12} className="text-foreground" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredOrders = (data?.recentOrders || []).filter(
    (o) =>
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.productSummary.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredProducts = (data?.topSellingProducts || []).filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (isLoading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded-md w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-muted rounded-xl" />
          <div className="h-72 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  const overview = data?.overview || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    activeProductsCount: 0,
    lowStockCount: 0,
    pendingOrdersCount: 0,
    processingOrdersCount: 0,
    deliveredOrdersCount: 0,
    averageOrderValue: 0,
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-12 font-satoshi">
      {/* Toast feedback banner */}
      {statusFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* 1️⃣ TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
            Admin Overview & Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live e-commerce metrics & dynamic order management for SHOP.CO
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <Link href="/admin/products/new">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-black text-white px-3.5 py-2 text-xs font-semibold hover:bg-black/80 transition shadow-2xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Product</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2️⃣ STAT KPI CARDS (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <Card className="p-5 flex flex-col justify-between bg-card border-border shadow-xs hover:border-black/20 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Revenue</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-sans text-foreground">
              ${overview.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Avg order: <span className="font-semibold text-foreground">${overview.averageOrderValue.toFixed(2)}</span>
            </p>
          </div>
          <div className="border-t border-border pt-2.5 mt-3">
            <Link
              href="/admin/orders"
              className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition"
            >
              <span>View all orders</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Card 2: Total Orders */}
        <Card className="p-5 flex flex-col justify-between bg-card border-border shadow-xs hover:border-black/20 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Orders</span>
            <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-sans text-foreground">
              {overview.totalOrders}
            </span>
            <p className="text-xs text-sky-600 font-medium mt-1">
              {overview.processingOrdersCount} processing · {overview.pendingOrdersCount} pending
            </p>
          </div>
          <div className="border-t border-border pt-2.5 mt-3">
            <Link
              href="/admin/orders"
              className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition"
            >
              <span>Manage orders</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Card 3: Active Products */}
        <Card className="p-5 flex flex-col justify-between bg-card border-border shadow-xs hover:border-black/20 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Catalog Products</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-sans text-foreground">
              {overview.activeProductsCount} Active
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Customers: <span className="font-semibold text-foreground">{overview.totalCustomers}</span> registered
            </p>
          </div>
          <div className="border-t border-border pt-2.5 mt-3">
            <Link
              href="/admin/products"
              className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition"
            >
              <span>View catalog</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Card 4: Low Stock Alert */}
        <Card className="p-5 flex flex-col justify-between bg-card border-border shadow-xs hover:border-black/20 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Low Stock Alert</span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                overview.lowStockCount > 0
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl font-bold font-sans ${
                overview.lowStockCount > 0 ? "text-rose-600" : "text-foreground"
              }`}
            >
              {overview.lowStockCount} {overview.lowStockCount === 1 ? "Item" : "Items"}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.lowStockCount > 0 ? "Requires restock (≤ 10 qty)" : "All inventory well-stocked"}
            </p>
          </div>
          <div className="border-t border-border pt-2.5 mt-3">
            <Link
              href="/admin/inventory"
              className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition"
            >
              <span>Manage stock</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* 3️⃣ LOW STOCK ALERT BANNER (If any low stock items) */}
      {data?.lowStockItems && data.lowStockItems.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertTriangle size={18} className="text-rose-600" />
              <span>Low Inventory Attention Needed</span>
            </div>
            <Link
              href="/admin/inventory?status=LOW_STOCK"
              className="text-xs font-semibold text-rose-700 hover:underline flex items-center gap-1"
            >
              <span>View in Inventory</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.lowStockItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-xl border border-rose-100 flex items-center justify-between shadow-2xs"
              >
                <div>
                  <p className="text-xs font-bold text-black line-clamp-1">{item.productName}</p>
                  <p className="text-[11px] text-black/60">
                    {item.colorName || "Default"} · Size: {item.size}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  {item.stockQuantity} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4️⃣ REVENUE CHART & REVIEWS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Sales Bar Chart */}
        <Card className="lg:col-span-2 p-5 sm:p-6 bg-card border-border shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-foreground font-sans">
                Monthly Sales & Revenue
              </h2>
              <p className="text-xs text-muted-foreground">
                6-month revenue performance across all orders
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
              Last 6 Months
            </span>
          </div>

          {/* Dynamic Interactive Chart */}
          <div className="h-48 sm:h-56 flex items-end justify-between gap-3 sm:gap-6 pt-4 pb-2 border-b border-border">
            {(data?.monthlyRevenueChart || []).map((bar, idx) => (
              <div
                key={bar.month}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                onMouseEnter={() => setHoveredBarIndex(idx)}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                {/* Tooltip */}
                {hoveredBarIndex === idx && (
                  <div className="absolute -top-12 z-20 bg-black text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95">
                    <p className="font-bold">${bar.revenue.toFixed(2)}</p>
                    <p className="text-[10px] text-white/70">{bar.orders} orders</p>
                  </div>
                )}

                {/* Animated Bar */}
                <div
                  className="w-full max-w-[48px] bg-black/10 group-hover:bg-black rounded-t-lg transition-all duration-300 relative overflow-hidden"
                  style={{
                    height: `${Math.max(bar.percentage, 8)}%`,
                  }}
                >
                  <div
                    className="absolute inset-0 bg-black opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Month Labels */}
          <div className="flex justify-between gap-3 sm:gap-6 mt-3">
            {(data?.monthlyRevenueChart || []).map((bar) => (
              <div key={bar.month} className="flex-1 text-center">
                <span className="text-xs font-medium text-muted-foreground">{bar.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right 1 Col: Customer Review Stars Breakdown */}
        <Card className="p-5 sm:p-6 bg-card border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground font-sans">
                Customer Ratings
              </h2>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star size={16} fill="currentColor" />
                <span>{data?.reviewBreakdown?.averageRating || 5.0}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Based on {data?.reviewBreakdown?.totalReviews || 0} verified customer reviews
            </p>

            <div className="space-y-3">
              {(data?.reviewBreakdown?.breakdown || []).map((row) => (
                <div key={row.stars} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 text-muted-foreground font-medium">
                    <span>{row.stars}</span>
                    <Star size={12} className="text-amber-400" fill="currentColor" />
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground font-medium">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-6">
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-foreground hover:underline flex items-center justify-between"
            >
              <span>Manage catalog reviews</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </Card>
      </div>

      {/* 5️⃣ RECENT ORDERS TABLE (WITH DIRECT INLINE STATUS CHANGER) */}
      <Card className="p-5 sm:p-6 bg-card border-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-foreground font-sans">Recent Orders</h2>
            <p className="text-xs text-muted-foreground">
              Manage & update order statuses directly from this table
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full bg-muted/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Package size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No matching orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-semibold">Order #</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Payment</th>
                  <th className="pb-3 font-semibold">Status (Click to Change)</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/40 transition">
                    <td className="py-3.5 font-medium font-mono text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>{order.orderNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderId(order.orderNumber)}
                          className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                          title="Copy order number"
                        >
                          {copiedId === order.orderNumber ? (
                            <Check size={12} className="text-emerald-600" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <p className="font-semibold text-foreground">{order.customerName}</p>
                      <p className="text-[11px] text-muted-foreground">{order.customerEmail}</p>
                    </td>
                    <td className="py-3.5 text-foreground max-w-[200px] truncate">
                      {order.productSummary}
                    </td>
                    <td className="py-3.5 font-bold text-foreground">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                        {order.paymentMethod === "CARD" ? (
                          <CreditCard size={12} className="text-sky-600" />
                        ) : (
                          <Banknote size={12} className="text-emerald-600" />
                        )}
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {renderStatusBadge(order)}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-foreground hover:bg-muted/80 font-medium transition cursor-pointer"
                      >
                        <span>Details</span>
                        <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 6️⃣ TOP PRODUCTS CATALOG CARDS */}
      <Card className="p-5 sm:p-6 bg-card border-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-foreground font-sans">
              Top Catalog Products
            </h2>
            <p className="text-xs text-muted-foreground">
              Most popular products by customer demand
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full bg-muted/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="border border-border rounded-xl p-3 bg-card hover:border-black/20 transition flex flex-col justify-between"
            >
              <div className="relative bg-[#F0EEED] rounded-lg aspect-square mb-2.5 overflow-hidden">
                <Image
                  src={p.image || "/images/product-1.png"}
                  alt={p.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-xs text-foreground line-clamp-1 mb-1">{p.name}</h3>
                <p className="text-xs font-bold text-foreground">${p.price}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {p.unitsSold > 0 ? `${p.unitsSold} units sold` : "Active in catalog"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

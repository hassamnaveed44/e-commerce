"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Boxes,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Search,
  RefreshCw,
  Plus,
  Minus,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  Package,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InventoryVariant {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  categoryName: string;
  categoryId: string;
  dressStyle: string;
  size: string;
  colorName: string;
  colorHex: string;
  sku: string;
  stockQuantity: number;
  stockLevel: "OK" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
  isActive: boolean;
  price: number;
}

interface InventoryOverview {
  totalUnits: number;
  totalVariants: number;
  lowStockCount: number;
  criticalStockCount: number;
  outOfStockCount: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface GroupedProduct {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  categoryName: string;
  dressStyle: string;
  price: number;
  isActive: boolean;
  totalStock: number;
  variants: InventoryVariant[];
  hasLowStock: boolean;
  hasCriticalStock: boolean;
  hasOutOfStock: boolean;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryVariant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [overview, setOverview] = useState<InventoryOverview>({
    totalUnits: 0,
    totalVariants: 0,
    lowStockCount: 0,
    criticalStockCount: 0,
    outOfStockCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [viewMode, setViewMode] = useState<"GROUPED" | "FLAT">("GROUPED");
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});

  // Local draft stock edits: { [variantId]: number }
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({});
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchInventory = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (selectedCategory !== "ALL") params.set("categoryId", selectedCategory);

      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setItems(data.items || []);
        setOverview(
          data.overview || {
            totalUnits: 0,
            totalVariants: 0,
            lowStockCount: 0,
            criticalStockCount: 0,
            outOfStockCount: 0,
          }
        );
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [statusFilter, selectedCategory]);

  const toggleExpand = (productId: string) => {
    setExpandedProductIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    groupedProducts.forEach((p) => {
      allExpanded[p.productId] = true;
    });
    setExpandedProductIds(allExpanded);
  };

  const collapseAll = () => {
    setExpandedProductIds({});
  };

  // Group items by product
  const groupedProducts = useMemo(() => {
    const map = new Map<string, GroupedProduct>();

    for (const item of items) {
      if (!map.has(item.productId)) {
        map.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          productSlug: item.productSlug,
          productImage: item.productImage,
          categoryName: item.categoryName,
          dressStyle: item.dressStyle || "Casual",
          price: item.price,
          isActive: item.isActive,
          totalStock: 0,
          variants: [],
          hasLowStock: false,
          hasCriticalStock: false,
          hasOutOfStock: false,
        });
      }

      const prod = map.get(item.productId)!;
      prod.totalStock += item.stockQuantity;
      prod.variants.push(item);

      if (item.stockLevel === "LOW") prod.hasLowStock = true;
      if (item.stockLevel === "CRITICAL") prod.hasCriticalStock = true;
      if (item.stockLevel === "OUT_OF_STOCK") prod.hasOutOfStock = true;
    }

    return Array.from(map.values());
  }, [items]);

  const filteredGrouped = useMemo(() => {
    if (!searchQuery) return groupedProducts;
    const q = searchQuery.toLowerCase();
    return groupedProducts.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.dressStyle.toLowerCase().includes(q) ||
        p.variants.some(
          (v) =>
            v.sku.toLowerCase().includes(q) ||
            v.size.toLowerCase().includes(q) ||
            v.colorName.toLowerCase().includes(q)
        )
    );
  }, [groupedProducts, searchQuery]);

  const handleStockDraftChange = (variantId: string, value: number) => {
    setStockDrafts((prev) => ({
      ...prev,
      [variantId]: Math.max(0, value),
    }));
  };

  const handleDeltaChange = (variantId: string, currentStock: number, delta: number) => {
    const currentDraft = stockDrafts[variantId] !== undefined ? stockDrafts[variantId] : currentStock;
    const newStock = Math.max(0, currentDraft + delta);
    setStockDrafts((prev) => ({
      ...prev,
      [variantId]: newStock,
    }));
  };

  const handleSaveStock = async (variantId: string, currentStock: number) => {
    const targetStock = stockDrafts[variantId] !== undefined ? stockDrafts[variantId] : currentStock;
    setUpdatingIds((prev) => ({ ...prev, [variantId]: true }));

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId,
          stockQuantity: targetStock,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((item) => {
            if (item.id === variantId) {
              const updatedStock = data.variant.stockQuantity;
              let stockLevel: "OK" | "LOW" | "CRITICAL" | "OUT_OF_STOCK" = "OK";
              if (updatedStock === 0) stockLevel = "OUT_OF_STOCK";
              else if (updatedStock <= 5) stockLevel = "CRITICAL";
              else if (updatedStock <= 10) stockLevel = "LOW";

              return {
                ...item,
                stockQuantity: updatedStock,
                stockLevel,
              };
            }
            return item;
          })
        );

        setStockDrafts((prev) => {
          const next = { ...prev };
          delete next[variantId];
          return next;
        });

        showToast("Variant stock updated in database!");
      } else {
        alert(data.error || "Failed to update stock");
      }
    } catch (err) {
      console.error("Update stock error:", err);
      alert("An error occurred while updating stock");
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  const getStockBadge = (level: "OK" | "LOW" | "CRITICAL" | "OUT_OF_STOCK", qty: number) => {
    switch (level) {
      case "OUT_OF_STOCK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-900 text-white dark:bg-gray-100 dark:text-black">
            <AlertOctagon size={11} /> Out of Stock (0)
          </span>
        );
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
            <AlertTriangle size={11} className="animate-pulse" /> Critical ({qty} left)
          </span>
        );
      case "LOW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-900">
            <TrendingDown size={11} /> Low Stock ({qty} left)
          </span>
        );
      case "OK":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 size={11} /> In Stock ({qty})
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 font-satoshi">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
            Inventory & Stock Tracking
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your {groupedProducts.length} catalog products ({overview.totalVariants} size & color variants)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchInventory(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Stock"}</span>
          </button>

          <Link href="/admin/products/new">
            <Button size="sm" className="rounded-xl font-semibold">
              <Plus size={14} className="mr-1.5" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products & Units */}
        <Card className="p-5 bg-card border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Catalog Products</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-sans text-foreground">
              {groupedProducts.length} Products
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.totalUnits.toLocaleString()} total units across {overview.totalVariants} variants
            </p>
          </div>
        </Card>

        {/* Low Stock (<= 10) */}
        <Card
          onClick={() => setStatusFilter(statusFilter === "LOW_STOCK" ? "ALL" : "LOW_STOCK")}
          className={`p-5 bg-card border-border shadow-xs cursor-pointer transition ${
            statusFilter === "LOW_STOCK" ? "ring-2 ring-amber-500 border-amber-500" : "hover:border-amber-400/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Low Stock (≤ 10)</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-bold font-sans ${overview.lowStockCount > 0 ? "text-amber-600" : "text-foreground"}`}>
              {overview.lowStockCount} Variants
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.lowStockCount > 0 ? "Click to filter low stock items" : "All variants well stocked"}
            </p>
          </div>
        </Card>

        {/* Critical Stock (<= 5) */}
        <Card
          onClick={() => setStatusFilter(statusFilter === "CRITICAL" ? "ALL" : "CRITICAL")}
          className={`p-5 bg-card border-border shadow-xs cursor-pointer transition ${
            statusFilter === "CRITICAL" ? "ring-2 ring-rose-500 border-rose-500" : "hover:border-rose-400/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Critical Stock (≤ 5)</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-bold font-sans ${overview.criticalStockCount > 0 ? "text-rose-600" : "text-foreground"}`}>
              {overview.criticalStockCount} Variants
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.criticalStockCount > 0 ? "Urgent restock needed" : "Zero critical items"}
            </p>
          </div>
        </Card>

        {/* Out of Stock (0) */}
        <Card
          onClick={() => setStatusFilter(statusFilter === "OUT_OF_STOCK" ? "ALL" : "OUT_OF_STOCK")}
          className={`p-5 bg-card border-border shadow-xs cursor-pointer transition ${
            statusFilter === "OUT_OF_STOCK" ? "ring-2 ring-gray-900 border-gray-900" : "hover:border-black/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Out of Stock (0)</span>
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 flex items-center justify-center">
              <AlertOctagon size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-sans text-foreground">
              {overview.outOfStockCount} Variants
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.outOfStockCount > 0 ? "Unavailable for checkout" : "All variants in stock"}
            </p>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filter Controls */}
      <Card className="p-4 bg-card border-border shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search by product name, SKU, size, color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 rounded-xl bg-muted/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:border-ring cursor-pointer"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="LOW_STOCK">⚠️ Low Stock (≤ 10)</option>
              <option value="CRITICAL">🚨 Critical (≤ 5)</option>
              <option value="OUT_OF_STOCK">⬛ Out of Stock (0)</option>
              <option value="OK">🟢 In Stock (&gt; 10)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 rounded-xl bg-muted/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:border-ring cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="sm:col-span-2 flex items-center justify-end gap-1 border-l border-border pl-3">
            <button
              type="button"
              onClick={() => setViewMode("GROUPED")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                viewMode === "GROUPED"
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground border-border"
              }`}
              title="Group by Product (1 row per product)"
            >
              📦 Grouped
            </button>
            <button
              type="button"
              onClick={() => setViewMode("FLAT")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                viewMode === "FLAT"
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground border-border"
              }`}
              title="View all individual size/color variants"
            >
              📄 Flat List
            </button>
          </div>
        </div>

        {/* Quick Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1">Filter By:</span>
            {[
              { label: "All Items", value: "ALL" },
              { label: "⚠️ Low Stock (≤ 10)", value: "LOW_STOCK" },
              { label: "🚨 Critical (≤ 5)", value: "CRITICAL" },
              { label: "⬛ Out of Stock", value: "OUT_OF_STOCK" },
              { label: "🟢 In Stock", value: "OK" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  statusFilter === tab.value
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold shadow-xs"
                    : "bg-muted/40 hover:bg-muted text-foreground border-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {viewMode === "GROUPED" && (
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={expandAll}
                className="text-muted-foreground hover:text-foreground font-medium underline cursor-pointer"
              >
                Expand All
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-muted-foreground hover:text-foreground font-medium underline cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : viewMode === "GROUPED" ? (
        /* 📦 GROUPED VIEW: 1 Row / Card Per Product */
        <div className="space-y-3">
          {filteredGrouped.length === 0 ? (
            <Card className="py-16 text-center text-muted-foreground bg-card border-border">
              <Boxes size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-foreground">No products match your search</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try resetting your search query or status filter.
              </p>
            </Card>
          ) : (
            filteredGrouped.map((prod) => {
              const isExpanded = expandedProductIds[prod.productId] || false;

              return (
                <Card
                  key={prod.productId}
                  className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs transition hover:border-black/20"
                >
                  {/* Product Header Row */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card">
                    {/* Left: Image & Name */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <Link
                        href={`/admin/products/${prod.productId}`}
                        className="relative w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 border border-border block hover:opacity-80 transition"
                      >
                        <Image src={prod.productImage} alt={prod.productName} fill className="object-cover" />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${prod.productId}`}
                            className="font-bold text-foreground hover:underline text-sm truncate"
                          >
                            {prod.productName}
                          </Link>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground shrink-0">
                            {prod.dressStyle}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Category: <span className="font-semibold text-foreground">{prod.categoryName}</span> · Base Price: ${prod.price}
                        </p>
                      </div>
                    </div>

                    {/* Right: Summary Pills & Accordion Trigger */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center gap-1.5 sm:justify-end">
                          <span className="text-sm font-bold font-sans text-foreground">
                            {prod.totalStock} Units
                          </span>
                          {prod.hasCriticalStock ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                              🚨 Critical
                            </span>
                          ) : prod.hasLowStock ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              ⚠️ Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              ✓ Good
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {prod.variants.length} {prod.variants.length === 1 ? "size/color variant" : "sizes & color variants"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(prod.productId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold transition cursor-pointer ${
                          isExpanded
                            ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                            : "bg-muted/40 hover:bg-muted text-foreground"
                        }`}
                      >
                        <span>{isExpanded ? "Hide Variants" : "Manage Variants"}</span>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Accordion: Inner Variant Table & Stock Adjusters */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/20 p-4 sm:p-5 animate-in fade-in slide-in-from-top-1">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground">
                              <th className="pb-2.5 font-semibold">Size</th>
                              <th className="pb-2.5 font-semibold">Color</th>
                              <th className="pb-2.5 font-semibold">SKU</th>
                              <th className="pb-2.5 font-semibold">Stock Status</th>
                              <th className="pb-2.5 font-semibold text-center">Quick Stock Adjuster</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {prod.variants.map((v) => {
                              const draftStock = stockDrafts[v.id] !== undefined ? stockDrafts[v.id] : v.stockQuantity;
                              const hasChanges = draftStock !== v.stockQuantity;
                              const isUpdating = updatingIds[v.id] || false;

                              return (
                                <tr key={v.id} className="hover:bg-muted/40 transition">
                                  {/* Size */}
                                  <td className="py-3 font-bold text-foreground">{v.size}</td>

                                  {/* Color */}
                                  <td className="py-3">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                        style={{ backgroundColor: v.colorHex }}
                                      />
                                      <span className="text-foreground font-medium">{v.colorName}</span>
                                    </div>
                                  </td>

                                  {/* SKU */}
                                  <td className="py-3 font-mono text-[11px] text-muted-foreground font-semibold">
                                    {v.sku}
                                  </td>

                                  {/* Status */}
                                  <td className="py-3">{getStockBadge(v.stockLevel, v.stockQuantity)}</td>

                                  {/* Quick Stock Adjuster */}
                                  <td className="py-3">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleDeltaChange(v.id, v.stockQuantity, -5)}
                                        className="w-6 h-6 rounded bg-card hover:bg-muted text-foreground text-[10px] font-bold flex items-center justify-center transition cursor-pointer border border-border"
                                        title="Subtract 5 units"
                                      >
                                        -5
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeltaChange(v.id, v.stockQuantity, -1)}
                                        className="w-6 h-6 rounded bg-card hover:bg-muted text-foreground text-xs font-bold flex items-center justify-center transition cursor-pointer border border-border"
                                        title="Subtract 1 unit"
                                      >
                                        <Minus size={11} />
                                      </button>

                                      <input
                                        type="number"
                                        min="0"
                                        value={draftStock}
                                        onChange={(e) => handleStockDraftChange(v.id, Number(e.target.value))}
                                        className={`w-14 h-7 text-center rounded-lg border text-xs font-bold focus:outline-none transition-colors ${
                                          hasChanges
                                            ? "border-black dark:border-white bg-amber-50 dark:bg-amber-950/40 text-foreground"
                                            : "border-border bg-card text-foreground"
                                        }`}
                                      />

                                      <button
                                        type="button"
                                        onClick={() => handleDeltaChange(v.id, v.stockQuantity, 1)}
                                        className="w-6 h-6 rounded bg-card hover:bg-muted text-foreground text-xs font-bold flex items-center justify-center transition cursor-pointer border border-border"
                                        title="Add 1 unit"
                                      >
                                        <Plus size={11} />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeltaChange(v.id, v.stockQuantity, 10)}
                                        className="w-6 h-6 rounded bg-card hover:bg-muted text-foreground text-[10px] font-bold flex items-center justify-center transition cursor-pointer border border-border"
                                        title="Add 10 units"
                                      >
                                        +10
                                      </button>

                                      {hasChanges && (
                                        <Button
                                          type="button"
                                          size="sm"
                                          disabled={isUpdating}
                                          onClick={() => handleSaveStock(v.id, v.stockQuantity)}
                                          className="h-7 px-2.5 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black cursor-pointer animate-in fade-in"
                                        >
                                          {isUpdating ? "Saving..." : "Save"}
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      ) : (
        /* 📄 FLAT VIEW: Detailed table of all variants */
        <Card className="p-4 sm:p-6 bg-card border-border shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-semibold">Product & Variant</th>
                  <th className="pb-3 font-semibold">SKU</th>
                  <th className="pb-3 font-semibold">Category & Style</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-center">Quick Stock Adjuster</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => {
                  const draftStock = stockDrafts[item.id] !== undefined ? stockDrafts[item.id] : item.stockQuantity;
                  const hasChanges = draftStock !== item.stockQuantity;
                  const isUpdating = updatingIds[item.id] || false;

                  return (
                    <tr key={item.id} className="hover:bg-muted/40 transition">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/products/${item.productId}`}
                            className="relative w-11 h-11 rounded-lg bg-muted overflow-hidden shrink-0 border border-border block hover:opacity-80 transition"
                          >
                            <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                          </Link>
                          <div>
                            <Link
                              href={`/admin/products/${item.productId}`}
                              className="font-bold text-foreground hover:underline line-clamp-1"
                            >
                              {item.productName}
                            </Link>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              <span className="font-semibold text-foreground">{item.size}</span>
                              <span>·</span>
                              <div className="flex items-center gap-1">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: item.colorHex }}
                                />
                                <span>{item.colorName}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 font-mono text-[11px] text-muted-foreground font-semibold">
                        {item.sku}
                      </td>

                      <td className="py-3.5 text-muted-foreground">
                        <span className="font-medium text-foreground">{item.categoryName}</span>
                        <span className="block text-[10px] text-muted-foreground">{item.dressStyle}</span>
                      </td>

                      <td className="py-3.5">{getStockBadge(item.stockLevel, item.stockQuantity)}</td>

                      <td className="py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDeltaChange(item.id, item.stockQuantity, -5)}
                            className="w-6 h-6 rounded bg-muted/60 hover:bg-muted text-foreground text-[10px] font-bold flex items-center justify-center transition cursor-pointer border border-border"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeltaChange(item.id, item.stockQuantity, -1)}
                            className="w-6 h-6 rounded bg-muted/60 hover:bg-muted text-foreground text-xs font-bold flex items-center justify-center transition cursor-pointer border border-border"
                          >
                            <Minus size={11} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={draftStock}
                            onChange={(e) => handleStockDraftChange(item.id, Number(e.target.value))}
                            className={`w-14 h-7 text-center rounded-lg border text-xs font-bold focus:outline-none transition-colors ${
                              hasChanges
                                ? "border-black dark:border-white bg-amber-50 dark:bg-amber-950/40 text-foreground"
                                : "border-border bg-card text-foreground"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeltaChange(item.id, item.stockQuantity, 1)}
                            className="w-6 h-6 rounded bg-muted/60 hover:bg-muted text-foreground text-xs font-bold flex items-center justify-center transition cursor-pointer border border-border"
                          >
                            <Plus size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeltaChange(item.id, item.stockQuantity, 10)}
                            className="w-6 h-6 rounded bg-muted/60 hover:bg-muted text-foreground text-[10px] font-bold flex items-center justify-center transition cursor-pointer border border-border"
                          >
                            +10
                          </button>
                          {hasChanges && (
                            <Button
                              type="button"
                              size="sm"
                              disabled={isUpdating}
                              onClick={() => handleSaveStock(item.id, item.stockQuantity)}
                              className="h-7 px-2.5 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black cursor-pointer animate-in fade-in"
                            >
                              {isUpdating ? "Saving..." : "Save"}
                            </Button>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 text-right">
                        <Link href={`/admin/products/${item.productId}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg text-xs font-semibold hover:bg-muted text-foreground cursor-pointer"
                          >
                            <span>Edit Product</span>
                            <ArrowUpRight size={13} className="ml-1 text-muted-foreground" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

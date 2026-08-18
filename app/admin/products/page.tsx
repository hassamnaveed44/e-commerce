"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ChevronDown,
  ArrowUpDown,
  Star,
  MoreHorizontal,
  PlusCircle,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Edit,
  Trash2,
  Check,
  AlertTriangle,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductVariant {
  id: string;
  size: string;
  colorName: string | null;
  colorHex: string | null;
  stockQuantity: number;
  sku: string | null;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  priceNum: number;
  originalPrice: number | null;
  discountPercent: number | null;
  dressStyle: string;
  category: string;
  categoryId: string;
  categorySlug: string;
  image: string;
  images: { id: string; url: string; isPrimary: boolean }[];
  stock: number;
  sku: string;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  status: string;
  variants: ProductVariant[];
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductStats {
  totalSales: number;
  totalSalesGrowth: number;
  numberOfSales: number;
  numberOfSalesGrowth: number;
  affiliateSales: number;
  affiliateSalesGrowth: number;
  totalDiscounts: number;
  totalDiscountsGrowth: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<ProductStats>({
    totalSales: 30230,
    totalSalesGrowth: 20.1,
    numberOfSales: 982,
    numberOfSalesGrowth: 5.02,
    affiliateSales: 4530,
    affiliateSalesGrowth: 3.1,
    totalDiscounts: 2230,
    totalDiscountsGrowth: -3.58,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priceRangeFilter, setPriceRangeFilter] = useState("ALL");

  // Dynamic Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    productName: true,
    price: true,
    category: true,
    stock: true,
    sku: true,
    rating: true,
    status: true,
  });

  // Filter Dropdown Open States
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<"name" | "price" | "category" | "stock" | "status">("name");
  const [sortAsc, setSortAsc] = useState(true);

  // Row Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Action Menu & Delete Modal State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
        setIsStatusOpen(false);
        setIsCategoryOpen(false);
        setIsPriceOpen(false);
        setIsColumnsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setCategories(data.categories || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Toggle Column Visibility
  const toggleColumn = (col: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  // Handle Sort
  const handleSort = (field: "name" | "price" | "category" | "stock" | "status") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesSku = p.sku.toLowerCase().includes(q);
          const matchesCategory = p.category.toLowerCase().includes(q);
          if (!matchesName && !matchesSku && !matchesCategory) return false;
        }

        // Status filter
        if (statusFilter !== "ALL") {
          if (statusFilter === "Active" && p.status !== "Active") return false;
          if (statusFilter === "Out Of Stock" && p.status !== "Out Of Stock") return false;
          if (statusFilter === "Closed For Sale" && p.status !== "Closed For Sale") return false;
        }

        // Category filter
        if (categoryFilter !== "ALL") {
          if (p.categoryId !== categoryFilter && p.category !== categoryFilter) return false;
        }

        // Price range filter
        if (priceRangeFilter !== "ALL") {
          if (priceRangeFilter === "UNDER_50" && p.priceNum >= 50) return false;
          if (priceRangeFilter === "50_100" && (p.priceNum < 50 || p.priceNum > 100)) return false;
          if (priceRangeFilter === "100_200" && (p.priceNum < 100 || p.priceNum > 200)) return false;
          if (priceRangeFilter === "OVER_200" && p.priceNum <= 200) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === "name") comp = a.name.localeCompare(b.name);
        else if (sortField === "price") comp = a.priceNum - b.priceNum;
        else if (sortField === "category") comp = a.category.localeCompare(b.category);
        else if (sortField === "stock") comp = a.stock - b.stock;
        else if (sortField === "status") comp = a.status.localeCompare(b.status);
        return sortAsc ? comp : -comp;
      });
  }, [products, searchQuery, statusFilter, categoryFilter, priceRangeFilter, sortField, sortAsc]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  // Toggle single selection
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all on current page
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    }
  };

  // Handle Delete Product
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${deletingProduct.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
        setDeletingProduct(null);
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Active") {
      return (
        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-50/70 text-[#10B981] border border-[#10B981]">
          Active
        </span>
      );
    }
    if (status === "Out Of Stock") {
      return (
        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-amber-50/70 text-amber-600 border border-amber-400">
          Out Of Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-[#E11D48] text-white">
        Closed For Sale
      </span>
    );
  };

  // Calculated visible column count for colSpan
  const visibleColumnCount =
    1 + // Checkbox column
    (visibleColumns.productName ? 1 : 0) +
    (visibleColumns.price ? 1 : 0) +
    (visibleColumns.category ? 1 : 0) +
    (visibleColumns.stock ? 1 : 0) +
    (visibleColumns.sku ? 1 : 0) +
    (visibleColumns.rating ? 1 : 0) +
    (visibleColumns.status ? 1 : 0) +
    1; // Actions column

  return (
    <div ref={menuRef} className="space-y-5 sm:space-y-6 pb-12 font-satoshi text-slate-900">
      {/* 1️⃣ Header with Title & Add Product Button (Screenshot 1 Match) */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900">
          Products
        </h1>

        <Link
          href="/admin/products/new"
          className="bg-black text-white hover:bg-black/80 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Plus size={15} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* 2️⃣ Top 4 Metric KPI Cards (Exact Match to Screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Sales */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[13px] text-slate-500 font-normal">
              Total Sales
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
              +{stats.totalSalesGrowth}%
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
              ${stats.totalSales.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Number of Sales */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[13px] text-slate-500 font-normal">
              Number of Sales
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
              +{stats.numberOfSalesGrowth}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
              {stats.numberOfSales.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 3: Affiliate */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[13px] text-slate-500 font-normal">
              Affiliate
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
              +{stats.affiliateSalesGrowth}%
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
              ${stats.affiliateSales.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 4: Discounts */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[13px] text-slate-500 font-normal">
              Discounts
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
              {stats.totalDiscountsGrowth}%
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
              ${stats.totalDiscounts.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3️⃣ Filter Bar (Exact Match to Screenshot 1) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Search & Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-1 min-w-[260px]">
          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-300 transition shadow-2xs"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsStatusOpen(!isStatusOpen);
                setIsCategoryOpen(false);
                setIsPriceOpen(false);
                setIsColumnsOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer shadow-2xs ${
                statusFilter !== "ALL"
                  ? "bg-slate-100 border-slate-300 text-slate-900"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <PlusCircle size={13} className="text-slate-500" />
              <span>Status</span>
              {statusFilter !== "ALL" && (
                <span className="ml-1 bg-slate-900 text-white text-[9px] px-1.5 rounded-full">
                  {statusFilter}
                </span>
              )}
            </button>

            {isStatusOpen && (
              <div className="absolute left-0 top-9 z-50 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95">
                {["ALL", "Active", "Out Of Stock", "Closed For Sale"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st);
                      setIsStatusOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 ${
                      statusFilter === st ? "font-semibold text-slate-900 bg-slate-50" : "text-slate-600"
                    }`}
                  >
                    <span>{st === "ALL" ? "All Statuses" : st}</span>
                    {statusFilter === st && <Check size={13} className="text-slate-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsCategoryOpen(!isCategoryOpen);
                setIsStatusOpen(false);
                setIsPriceOpen(false);
                setIsColumnsOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer shadow-2xs ${
                categoryFilter !== "ALL"
                  ? "bg-slate-100 border-slate-300 text-slate-900"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <PlusCircle size={13} className="text-slate-500" />
              <span>Category</span>
              {categoryFilter !== "ALL" && (
                <span className="ml-1 bg-slate-900 text-white text-[9px] px-1.5 rounded-full truncate max-w-[80px]">
                  {categories.find((c) => c.id === categoryFilter)?.name || categoryFilter}
                </span>
              )}
            </button>

            {isCategoryOpen && (
              <div className="absolute left-0 top-9 z-50 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1 text-xs max-h-56 overflow-y-auto animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter("ALL");
                    setIsCategoryOpen(false);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 ${
                    categoryFilter === "ALL" ? "font-semibold text-slate-900 bg-slate-50" : "text-slate-600"
                  }`}
                >
                  <span>All Categories</span>
                  {categoryFilter === "ALL" && <Check size={13} className="text-slate-900" />}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(c.id);
                      setIsCategoryOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 ${
                      categoryFilter === c.id ? "font-semibold text-slate-900 bg-slate-50" : "text-slate-600"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {categoryFilter === c.id && <Check size={13} className="text-slate-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Dropdown Pill (Screenshot 1) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsPriceOpen(!isPriceOpen);
                setIsStatusOpen(false);
                setIsCategoryOpen(false);
                setIsColumnsOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <span>
                {priceRangeFilter === "ALL"
                  ? "Price: $100-$200"
                  : priceRangeFilter === "UNDER_50"
                  ? "Price: Under $50"
                  : priceRangeFilter === "50_100"
                  ? "Price: $50-$100"
                  : priceRangeFilter === "100_200"
                  ? "Price: $100-$200"
                  : "Price: $200+"}
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {isPriceOpen && (
              <div className="absolute left-0 top-9 z-50 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95">
                {[
                  { id: "ALL", label: "All Prices" },
                  { id: "UNDER_50", label: "Under $50" },
                  { id: "50_100", label: "$50 - $100" },
                  { id: "100_200", label: "$100 - $200" },
                  { id: "OVER_200", label: "$200+" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPriceRangeFilter(item.id);
                      setIsPriceOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 ${
                      priceRangeFilter === item.id ? "font-semibold text-slate-900 bg-slate-50" : "text-slate-600"
                    }`}
                  >
                    <span>{item.label}</span>
                    {priceRangeFilter === item.id && <Check size={13} className="text-slate-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Columns Dropdown Button (Screenshot 2 Match) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsColumnsOpen(!isColumnsOpen);
              setIsStatusOpen(false);
              setIsCategoryOpen(false);
              setIsPriceOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <span>Columns</span>
            <SlidersHorizontal size={13} className="text-slate-500" />
          </button>

          {/* Toggle Columns Popover (Screenshot 2 Match) */}
          {isColumnsOpen && (
            <div className="absolute right-0 top-9 z-50 w-44 rounded-xl bg-white border border-slate-200 shadow-xl p-2 text-xs animate-in fade-in zoom-in-95">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 py-1 mb-0.5">
                TOGGLE COLUMNS
              </span>
              <div className="space-y-0.5 text-slate-700">
                {[
                  { id: "productName", label: "Product Name" },
                  { id: "price", label: "Price" },
                  { id: "category", label: "Category" },
                  { id: "stock", label: "Stock" },
                  { id: "sku", label: "SKU" },
                  { id: "rating", label: "Rating" },
                  { id: "status", label: "Status" },
                ].map((col) => {
                  const isChecked = visibleColumns[col.id as keyof typeof visibleColumns];
                  return (
                    <div
                      key={col.id}
                      onClick={() => toggleColumn(col.id as keyof typeof visibleColumns)}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs transition select-none"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                          isChecked
                            ? "bg-[#2563EB] border-[#2563EB] text-white"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </div>
                      <span className="font-medium text-slate-800">{col.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4️⃣ Products Data Table (Exact Match to Screenshots 1 & 2) */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] sm:text-xs font-medium text-slate-500">
                <th className="py-3 px-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedProducts.length > 0 &&
                      selectedIds.length === paginatedProducts.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                </th>

                {/* Product Name Column */}
                {visibleColumns.productName && (
                  <th
                    onClick={() => handleSort("name")}
                    className="py-3 px-3 font-medium cursor-pointer hover:text-slate-900 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Product Name</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>
                )}

                {/* Price Column */}
                {visibleColumns.price && (
                  <th
                    onClick={() => handleSort("price")}
                    className="py-3 px-3 font-medium cursor-pointer hover:text-slate-900 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Price</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>
                )}

                {/* Category Column */}
                {visibleColumns.category && (
                  <th
                    onClick={() => handleSort("category")}
                    className="py-3 px-3 font-medium cursor-pointer hover:text-slate-900 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>
                )}

                {/* Stock Column */}
                {visibleColumns.stock && (
                  <th
                    onClick={() => handleSort("stock")}
                    className="py-3 px-3 font-medium cursor-pointer hover:text-slate-900 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Stock</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>
                )}

                {/* SKU Column */}
                {visibleColumns.sku && (
                  <th className="py-3 px-3 font-medium">SKU</th>
                )}

                {/* Rating Column */}
                {visibleColumns.rating && (
                  <th className="py-3 px-3 font-medium">Rating</th>
                )}

                {/* Status Column */}
                {visibleColumns.status && (
                  <th
                    onClick={() => handleSort("status")}
                    className="py-3 px-3 font-medium cursor-pointer hover:text-slate-900 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>
                )}

                {/* Actions Column */}
                <th className="py-3 px-3.5 text-right font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={visibleColumnCount} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={15} className="animate-spin text-slate-500" />
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isMenuOpen = activeMenuId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/70 transition ${
                        isSelected ? "bg-slate-50/50" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(p.id)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Product Thumbnail & Name (Screenshot 1 Match) */}
                      {visibleColumns.productName && (
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-bold text-slate-900 text-xs sm:text-[13px]">
                              {p.name}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Price */}
                      {visibleColumns.price && (
                        <td className="py-3.5 px-3 font-medium text-slate-900 text-xs sm:text-[13px]">
                          {p.price}
                        </td>
                      )}

                      {/* Category */}
                      {visibleColumns.category && (
                        <td className="py-3.5 px-3 text-slate-600 font-normal text-xs sm:text-[13px]">
                          {p.category}
                        </td>
                      )}

                      {/* Stock */}
                      {visibleColumns.stock && (
                        <td className="py-3.5 px-3 text-slate-700 font-normal text-xs sm:text-[13px]">
                          {p.stock}
                        </td>
                      )}

                      {/* SKU */}
                      {visibleColumns.sku && (
                        <td className="py-3.5 px-3 font-medium text-xs text-slate-600">
                          {p.sku}
                        </td>
                      )}

                      {/* Rating */}
                      {visibleColumns.rating && (
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                            <Star size={13} className="fill-amber-400 text-amber-400" />
                            <span>{p.rating}</span>
                          </div>
                        </td>
                      )}

                      {/* Status */}
                      {visibleColumns.status && (
                        <td className="py-3.5 px-3">{getStatusBadge(p.status)}</td>
                      )}

                      {/* Actions */}
                      <td className="py-3.5 px-3.5 text-right relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : p.id)}
                          className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 inline-flex items-center justify-center transition cursor-pointer"
                          title="Product options"
                        >
                          <MoreHorizontal size={14} />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div className="absolute right-3 top-9 z-50 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 text-left text-xs animate-in fade-in zoom-in-95">
                            <Link
                              href={`/product/${p.slug}`}
                              target="_blank"
                              className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                            >
                              <ExternalLink size={13} className="text-slate-400" />
                              <span>View in Store</span>
                            </Link>

                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                            >
                              <Edit size={13} className="text-slate-400" />
                              <span>Edit Product</span>
                            </Link>

                            <div className="border-t border-slate-100 my-1" />

                            <button
                              type="button"
                              onClick={() => {
                                setDeletingProduct(p);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                            >
                              <Trash2 size={13} className="text-rose-500" />
                              <span>Delete Product</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={visibleColumnCount} className="py-12 text-center text-slate-400">
                    No products found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5️⃣ Footer & Pagination (Screenshot 2 Match) */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500 bg-white">
          <span>
            {selectedIds.length} of {filteredProducts.length} row(s) selected.
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 rounded-lg border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-8 px-3 rounded-lg border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* 6️⃣ Delete Confirmation Modal */}
      {deletingProduct && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingProduct(null);
          }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 text-slate-900 relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-500" />
                <span>Delete Product</span>
              </h3>
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900">{deletingProduct.name}</strong>? This action cannot be undone.
            </p>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingProduct(null)}
                className="rounded-lg text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

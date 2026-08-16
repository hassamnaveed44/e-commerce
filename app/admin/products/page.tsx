"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  RefreshCw,
  Star,
  Eye,
  Trash2,
  Check,
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
  category: string;
  categoryId: string;
  image: string;
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Deletion Modal State
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (product: ProductItem) => {
    setTogglingId(product.id);
    const newActiveState = !product.isActive;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              isActive: newActiveState,
              status: !newActiveState
                ? "Closed For Sale"
                : p.stock === 0
                ? "Out Of Stock"
                : p.stock <= 10
                ? "Low Stock"
                : "Active",
            }
          : p
      )
    );

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActiveState }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Product ${product.name} is now ${newActiveState ? "Active" : "Hidden"}`
        );
      } else {
        fetchProducts(true);
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      fetchProducts(true);
    } finally {
      setTogglingId(null);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${deletingProduct.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
        showToast(`Product "${deletingProduct.name}" deleted`);
        setDeletingProduct(null);
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting product");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || p.categoryId === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === "ACTIVE") matchesStatus = p.isActive && p.stock > 0;
    else if (selectedStatus === "LOW_STOCK") matchesStatus = p.stock > 0 && p.stock <= 10;
    else if (selectedStatus === "OUT_OF_STOCK") matchesStatus = p.stock === 0;
    else if (selectedStatus === "INACTIVE") matchesStatus = !p.isActive;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStockBadge = (stock: number, isActive: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          Hidden
        </span>
      );
    }
    if (stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          0 Left (Out of stock)
        </span>
      );
    }
    if (stock <= 10) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
          {stock} Left (Low stock)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
        {stock} In Stock
      </span>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-12 font-satoshi">
      {/* Toast message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1️⃣ TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
            Products Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your store&apos;s garment catalog, stock inventory, and multi-variants
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchProducts(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <Link href="/admin/products/create">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black px-3.5 py-2 text-xs font-semibold hover:opacity-90 transition shadow-2xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Product</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2️⃣ FILTERS & SEARCH TOOLBAR */}
      <Card className="p-4 bg-card border-border shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search products by title, SKU, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 rounded-lg bg-muted/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:border-ring"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-9 rounded-lg bg-muted/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:border-ring"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="ACTIVE">Active & In Stock</option>
              <option value="LOW_STOCK">Low Stock (≤ 10)</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="INACTIVE">Hidden / Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 3️⃣ PRODUCTS LIST TABLE */}
      <Card className="p-4 sm:p-6 bg-card border-border shadow-xs">
        {isLoading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Package size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold text-foreground">No products found</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Try adjusting your search query or create a new product.
            </p>
            <Link href="/admin/products/create">
              <Button size="sm" className="rounded-xl">
                <Plus size={14} className="mr-1.5" />
                Add Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Price</th>
                  <th className="pb-3 font-semibold">Inventory</th>
                  <th className="pb-3 font-semibold">Rating</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((p) => {
                  const isToggling = togglingId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-muted/40 transition">
                      {/* Product Name & Image */}
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-lg bg-muted overflow-hidden shrink-0 border border-border">
                            <Image src={p.image} alt={p.name} fill className="object-cover" />
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="font-bold text-foreground hover:underline line-clamp-1"
                            >
                              {p.name}
                            </Link>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              <span className="font-mono">{p.sku}</span>
                              <span>·</span>
                              <span>{p.variants.length} {p.variants.length === 1 ? "variant" : "variants"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 text-muted-foreground font-medium">{p.category}</td>

                      {/* Price */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground">{p.price}</span>
                          {p.discountPercent ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                              -{p.discountPercent}%
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Stock Inventory */}
                      <td className="py-3.5">{getStockBadge(p.stock, p.isActive)}</td>

                      {/* Rating */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-1 text-foreground font-semibold">
                          <Star size={13} className="text-amber-400" fill="currentColor" />
                          <span>{p.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground text-[11px]">
                            ({p.reviewsCount})
                          </span>
                        </div>
                      </td>

                      {/* Active Status Toggle */}
                      <td className="py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer disabled:opacity-50 ${
                            p.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                          title="Click to toggle live visibility"
                        >
                          {isToggling ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : p.isActive ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          <span>{p.isActive ? "Active" : "Hidden"}</span>
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
                            title="View & Edit Product"
                          >
                            <Eye size={15} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 4️⃣ DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground font-sans">
                Delete Product &ldquo;{deletingProduct.name}&rdquo;?
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                This action will remove the product and all associated variants from the database. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin mr-1.5" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

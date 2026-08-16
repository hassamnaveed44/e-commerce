"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  DollarSign,
  Package,
  Layers,
  Star,
  CheckCircle2,
  Loader2,
  Plus,
  Save,
  AlertTriangle,
  UploadCloud,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductVariant {
  id: string;
  size: string;
  colorName: string | null;
  colorHex: string | null;
  stockQuantity: number;
  sku: string | null;
}

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  categoryId: string;
  categoryName: string;
  isActive: boolean;
  averageRating: number;
  ratingCount: number;
  stock: number;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: Review[];
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [originalPrice, setOriginalPrice] = useState<number | string>("");
  const [discountPercent, setDiscountPercent] = useState<number | string>("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/admin/products/${productId}`),
          fetch("/api/admin/products"),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData.success && prodData.product) {
          const p = prodData.product;
          setProduct(p);
          setName(p.name);
          setDescription(p.description || "");
          setPrice(p.price);
          setOriginalPrice(p.originalPrice || "");
          setDiscountPercent(p.discountPercent || "");
          setCategoryId(p.categoryId);
          setIsActive(p.isActive);
          setVariants(p.variants || []);
        }

        if (catData.success && catData.categories) {
          setCategories(catData.categories);
        }
      } catch (err) {
        console.error("Failed to load product detail:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [productId]);

  const handleStockChange = (variantId: string, newQty: number) => {
    const safeQty = Math.max(0, newQty);
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, stockQuantity: safeQty } : v))
    );
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `new-${Date.now()}`,
      size: "Medium",
      colorName: "Black",
      colorHex: "#000000",
      stockQuantity: 15,
      sku: `${name.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const handleRemoveVariant = (variantId: string) => {
    if (variants.length <= 1) {
      alert("A product must have at least one variant");
      return;
    }
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  const handleSaveChanges = async () => {
    if (!product) return;
    setIsSaving(true);

    try {
      const payload = {
        name,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        discountPercent: discountPercent ? Number(discountPercent) : null,
        categoryId,
        isActive,
        variants: variants.map((v) => ({
          id: v.id.startsWith("new-") ? undefined : v.id,
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          stockQuantity: Number(v.stockQuantity),
          sku: v.sku,
        })),
      };

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Product changes saved successfully!");
      } else {
        alert(data.error || "Failed to save product");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !product) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto pb-12">
        <div className="h-8 bg-muted rounded-md w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-96 bg-muted rounded-2xl" />
          <div className="lg:col-span-5 h-96 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [{ id: "1", url: "/images/product-1.png", isPrimary: true }];
  const currentImage = images[activeImageIdx] || images[0];

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 font-satoshi">
      {/* Toast message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shrink-0 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
                {product.name}
              </h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {isActive ? "Active" : "Hidden"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Category: {product.categoryName} · Total Stock: {variants.reduce((s, v) => s + v.stockQuantity, 0)} units
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
            size="sm"
            className="rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-medium cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid: Gallery & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Media Gallery & Customer Reviews */}
        <div className="lg:col-span-5 space-y-6">
          {/* Gallery Card */}
          <Card className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="relative aspect-square rounded-xl bg-muted/40 overflow-hidden mb-3 border border-border">
              <Image
                src={currentImage.url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                      activeImageIdx === idx
                        ? "border-black dark:border-white shadow-xs"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.url} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Customer Reviews Section */}
          <Card className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground font-sans">
                Verified Reviews ({product.reviews.length})
              </h2>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                <Star size={14} fill="currentColor" />
                <span>{product.averageRating.toFixed(1)}</span>
              </div>
            </div>

            {product.reviews.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No customer reviews yet for this product.
              </p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto divide-y divide-border">
                {product.reviews.map((r) => (
                  <div key={r.id} className="pt-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{r.authorName}</p>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} size={11} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (7 cols): Editable Details & Variant Inventory */}
        <div className="lg:col-span-7 space-y-6">
          {/* Details Card */}
          <Card className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
            <h2 className="text-base font-bold text-foreground font-sans mb-4">
              Product Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:border-ring resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground focus:outline-none focus:border-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Original Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Visibility
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-full h-9 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {isActive ? "✓ Active (Public in Store)" : "✕ Hidden (Draft)"}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Variants & Stock Management Card */}
          <Card className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground font-sans">
                  Variants & Stock Inventory
                </h2>
                <p className="text-xs text-muted-foreground">
                  Adjust individual variant stock quantities with immediate save
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariant}
                className="rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Variant</span>
              </Button>
            </div>

            <div className="space-y-2.5">
              {variants.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: v.colorHex || "#000" }}
                    />
                    <div>
                      <p className="font-bold text-foreground">
                        {v.size} · {v.colorName || "Default"}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground">
                        SKU: {v.sku || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Stock Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStockChange(v.id, v.stockQuantity - 1)}
                      className="w-7 h-7 rounded-lg border border-border bg-card flex items-center justify-center font-bold text-foreground hover:bg-muted cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={v.stockQuantity}
                      onChange={(e) => handleStockChange(v.id, parseInt(e.target.value) || 0)}
                      className="w-16 h-7 rounded-lg border border-border bg-card text-center font-bold text-xs text-foreground focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleStockChange(v.id, v.stockQuantity + 1)}
                      className="w-7 h-7 rounded-lg border border-border bg-card flex items-center justify-center font-bold text-foreground hover:bg-muted cursor-pointer"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.id)}
                      className="p-1.5 text-muted-foreground hover:text-rose-600 transition cursor-pointer ml-1"
                      title="Remove variant"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
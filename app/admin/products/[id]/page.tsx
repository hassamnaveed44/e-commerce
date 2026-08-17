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
  const [dressStyle, setDressStyle] = useState("Casual");
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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
        
        let catList: Category[] = [];
        try {
          const catAdminRes = await fetch("/api/admin/categories");
          const catAdminData = await catAdminRes.json();
          if (catAdminData.success && Array.isArray(catAdminData.categories)) {
            catList = catAdminData.categories;
          } else {
            const catData = await catRes.json();
            catList = catData.categories || [];
          }
        } catch (e) {
          const catData = await catRes.json();
          catList = catData.categories || [];
        }

        setCategories(catList);

        if (prodData.success && prodData.product) {
          const p = prodData.product;
          setProduct(p);
          setName(p.name);
          setDescription(p.description || "");
          setPrice(p.price);
          setOriginalPrice(p.originalPrice || "");
          setDiscountPercent(p.discountPercent || "");
          setCategoryId(p.categoryId);
          setDressStyle(p.dressStyle || "Casual");
          setIsActive(p.isActive);
          setVariants(p.variants || []);
          setImages(p.images || [{ id: "1", url: "/images/product-1.png", isPrimary: true }]);
        }
      } catch (err) {
        console.error("Failed to load product detail:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [productId]);

  // Image Management
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        const newImg: ProductImage = {
          id: `new-${Date.now()}`,
          url: data.url,
          isPrimary: images.length === 0,
        };
        setImages((prev) => [
          ...prev.map((img) => ({ ...img, isPrimary: false })),
          { ...newImg, isPrimary: true },
        ]);
        setActiveImageIdx(images.length);
        showToast("Image uploaded! Click 'Save Changes' to update store.");
      } else {
        alert(data.error || "Image upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddPresetImage = (url: string) => {
    const newImg: ProductImage = {
      id: `img-${Date.now()}`,
      url,
      isPrimary: true,
    };
    setImages((prev) => [
      ...prev.map((img) => ({ ...img, isPrimary: false })),
      newImg,
    ]);
    setActiveImageIdx(images.length);
    showToast("Hoodie image added as Primary! Click 'Save Changes'.");
  };

  const handleAddCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    const newImg: ProductImage = {
      id: `img-${Date.now()}`,
      url: customImageUrl.trim(),
      isPrimary: images.length === 0,
    };
    setImages((prev) => [...prev, newImg]);
    setCustomImageUrl("");
    setActiveImageIdx(images.length);
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({ ...img, isPrimary: idx === index }))
    );
    setActiveImageIdx(index);
    showToast("Primary cover image updated! Click 'Save Changes'.");
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      alert("A product should have at least one image");
      return;
    }
    setImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
    setActiveImageIdx(0);
  };

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
        dressStyle,
        isActive,
        images: images.map((img) => ({
          url: img.url,
          isPrimary: img.isPrimary,
        })),
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

  const currentImage =
    images[activeImageIdx] ||
    images[0] || { id: "1", url: "/images/product-1.png", isPrimary: true };

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
          {/* Gallery Card & Image Manager */}
          <Card className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground font-sans">
                Product Media & Cover
              </h2>
              <span className="text-[10px] text-muted-foreground">
                ★ Star = Primary Cover Image
              </span>
            </div>

            {/* Main Preview Box */}
            <div className="relative aspect-square rounded-xl bg-muted/40 overflow-hidden border border-border">
              <Image
                src={currentImage.url}
                alt={product.name}
                fill
                className="object-cover"
              />
              {currentImage.isPrimary && (
                <div className="absolute top-2.5 left-2.5 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  PRIMARY COVER
                </div>
              )}
            </div>

            {/* Thumbnail Carousel & Actions */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-foreground">
                Gallery Images ({images.length})
              </p>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 group ${
                      activeImageIdx === idx
                        ? "border-black dark:border-white shadow-xs"
                        : "border-border opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Thumbnail ${idx}`}
                      fill
                      className="object-cover cursor-pointer"
                      onClick={() => setActiveImageIdx(idx)}
                    />

                    {/* Action overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className={`p-1 rounded-full text-[10px] shadow cursor-pointer ${
                          img.isPrimary
                            ? "bg-amber-400 text-black"
                            : "bg-white/80 hover:bg-white text-black"
                        }`}
                        title="Set as primary storefront cover"
                      >
                        <Star size={11} fill={img.isPrimary ? "currentColor" : "none"} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] shadow cursor-pointer"
                        title="Remove image"
                      >
                        <X size={11} />
                      </button>
                    </div>

                    {img.isPrimary && (
                      <div className="absolute bottom-1 right-1 bg-amber-400 text-black p-0.5 rounded-full shadow-xs">
                        <Star size={8} fill="currentColor" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Store Presets */}
            <div className="pt-2 border-t border-border space-y-1.5">
              <label className="block text-[11px] font-semibold text-foreground">
                Quick Preset Images:
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddPresetImage("/images/product-8.png")}
                  className="px-2.5 py-1 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <span>🧥 Set Hoodie Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetImage("/images/product-1.png")}
                  className="px-2.5 py-1 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                >
                  <span>👕 Set T-Shirt Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetImage("/images/product-2.png")}
                  className="px-2.5 py-1 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                >
                  <span>👖 Set Jeans Image</span>
                </button>
              </div>
            </div>

            {/* Upload or Add URL */}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste image URL (e.g. /images/product-8.png)"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:border-ring"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomImageUrl}
                  className="h-8 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Add URL
                </Button>
              </div>

              <div>
                <input
                  type="file"
                  id="detail-file-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="detail-file-upload"
                  className="w-full py-2 px-3 border border-dashed border-border hover:border-foreground/50 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground bg-muted/20 hover:bg-muted/40 transition cursor-pointer"
                >
                  <UploadCloud size={14} className="text-muted-foreground" />
                  <span>{isUploading ? "Uploading..." : "Upload photo from your computer"}</span>
                </label>
              </div>
            </div>
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

              {/* Parent Category & Garment Subcategory Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Parent Category (Dress Style) */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Parent Category (Dress Style)
                  </label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {["Casual", "Formal", "Party", "Gym", "Men", "Women", "Kids", "Unisex"].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setDressStyle(style)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer border ${
                          dressStyle.toLowerCase() === style.toLowerCase()
                            ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold shadow-xs"
                            : "bg-muted/40 hover:bg-muted text-foreground border-border"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                  <select
                    value={dressStyle}
                    onChange={(e) => setDressStyle(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    {["Casual", "Formal", "Party", "Gym", "Men", "Women", "Kids", "Unisex"].map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Garment Subcategory */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Subcategory (Garment Type)
                  </label>
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCategoryId(c.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer border ${
                            categoryId === c.id
                              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold shadow-xs"
                              : "bg-muted/40 hover:bg-muted text-foreground border-border"
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Visibility Status */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Visibility Status
                </label>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-full sm:w-auto px-4 h-9 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {isActive ? "✓ Active (Public in Store)" : "✕ Hidden (Draft)"}
                </button>
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
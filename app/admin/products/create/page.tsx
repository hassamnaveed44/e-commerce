"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  Plus,
  Trash2,
  Star,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface VariantInput {
  id: string;
  size: string;
  colorName: string;
  colorHex: string;
  stockQuantity: number;
  sku: string;
}

interface ImageInput {
  url: string;
  isPrimary: boolean;
}

const COMMON_SIZES = ["Small", "Medium", "Large", "X-Large", "XX-Large"];
const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy Blue", hex: "#1E3A8A" },
  { name: "Olive Green", hex: "#4D7C0F" },
  { name: "Wine Red", hex: "#881337" },
  { name: "Beige", hex: "#D4B996" },
];

export default function AddProductPage() {
  const router = useRouter();

  // Basic Details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dressStyle, setDressStyle] = useState("Casual");
  const [categories, setCategories] = useState<Category[]>([]);
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Images
  const [images, setImages] = useState<ImageInput[]>([
    { url: "/images/product-1.png", isPrimary: true },
  ]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Variants
  const [variants, setVariants] = useState<VariantInput[]>([
    {
      id: "v1",
      size: "Medium",
      colorName: "Black",
      colorHex: "#000000",
      stockQuantity: 25,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}-M`,
    },
    {
      id: "v2",
      size: "Large",
      colorName: "Black",
      colorHex: "#000000",
      stockQuantity: 20,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}-L`,
    },
  ]);

  // Loading & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        // Try dedicated admin categories endpoint first
        let res = await fetch("/api/admin/categories");
        let data = await res.json();
        
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
          setCategoryId((prev) => prev || data.categories[0].id);
          return;
        }

        // Fallback to public categories API
        res = await fetch("/api/categories");
        data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
          setCategoryId((prev) => prev || data.data[0].id);
          return;
        }

        // Fallback to admin products endpoint
        res = await fetch("/api/admin/products");
        data = await res.json();
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
          setCategoryId((prev) => prev || data.categories[0].id);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Handle image upload from computer
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
        setImages((prev) => [
          ...prev.map((img) => ({ ...img, isPrimary: false })),
          { url: data.url, isPrimary: prev.length === 0 },
        ]);
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

  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      { url: customImageUrl.trim(), isPrimary: prev.length === 0 },
    ]);
    setCustomImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({ ...img, isPrimary: idx === index }))
    );
  };

  // Add Variant Row
  const handleAddVariant = () => {
    const newId = `v-${Date.now()}`;
    setVariants((prev) => [
      ...prev,
      {
        id: newId,
        size: "Medium",
        colorName: "Black",
        colorHex: "#000000",
        stockQuantity: 15,
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    ]);
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) {
      alert("A product must have at least one variant");
      return;
    }
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVariantChange = (id: string, field: keyof VariantInput, value: any) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Product name is required");
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMessage("Please enter a valid price");
      return;
    }
    if (!categoryId) {
      setErrorMessage("Please select a category");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        categoryId,
        dressStyle,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        discountPercent: discountPercent ? Number(discountPercent) : null,
        isActive,
        images,
        variants: variants.map((v) => ({
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          stockQuantity: Number(v.stockQuantity),
          sku: v.sku,
        })),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || "Failed to create product");
      }
    } catch (err) {
      console.error("Product submit error:", err);
      setErrorMessage("An error occurred while creating product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 font-satoshi">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shrink-0 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
              Add New Product
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create a new item in your catalog with customizable variants and inventory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/admin/products">
            <Button variant="outline" size="sm" className="rounded-xl text-foreground font-medium cursor-pointer">
              Discard
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="sm"
            className="rounded-xl bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 font-medium cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>Publish Product</span>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {submitted ? (
        <Card className="p-8 text-center bg-card border-emerald-200">
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mb-3" />
            <h3 className="text-xl font-bold font-sans text-foreground">Product Published Successfully!</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-6">
              Your item is now live in the PostgreSQL database and available for shoppers on SHOP.CO.
            </p>
            <div className="flex gap-3">
              <Link href="/admin/products">
                <Button variant="outline" size="sm" className="rounded-xl">
                  Back to Products
                </Button>
              </Link>
              <Button
                size="sm"
                className="rounded-xl bg-black text-white dark:bg-white dark:text-black"
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setDescription("");
                  setPrice("");
                  setOriginalPrice("");
                  setDiscountPercent("");
                }}
              >
                Add Another Product
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols): Product Details, Media, Variants */}
            <div className="lg:col-span-8 space-y-6">
              {/* Product Details Card */}
              <Card className="rounded-2xl border border-border shadow-xs bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-bold font-sans">Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Classic Relaxed Fit Denim Jacket"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 rounded-xl border border-border bg-card px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe the fabric, fit, design features, and style recommendations..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors resize-y"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Product Images Card */}
              <Card className="rounded-2xl border border-border shadow-xs bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold font-sans">Product Media</CardTitle>
                  <span className="text-[11px] text-muted-foreground">Click a star to set primary image</span>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Upload Dropzone */}
                  <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-foreground/40 transition bg-muted/20">
                    <input
                      type="file"
                      id="image-file-upload"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-file-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-xs font-semibold text-foreground">
                        {isUploading ? "Uploading image..." : "Click to upload image from your computer"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </label>
                  </div>

                  {/* Or Add Image URL */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Or paste image URL (e.g. /images/product-2.png)"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="flex-1 h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddImageUrl}
                      className="rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Add URL
                    </Button>
                  </div>

                  {/* Image Previews */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-muted/40 group ${
                          img.isPrimary ? "border-black dark:border-white shadow-xs" : "border-border"
                        }`}
                      >
                        <Image src={img.url} alt={`Product ${idx}`} fill className="object-cover" />
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className={`p-1 rounded-full text-xs shadow-sm cursor-pointer ${
                              img.isPrimary
                                ? "bg-amber-400 text-black"
                                : "bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            }`}
                            title="Set as primary image"
                          >
                            <Star size={11} fill={img.isPrimary ? "currentColor" : "none"} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 rounded-full bg-rose-600 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                            title="Delete image"
                          >
                            <X size={11} />
                          </button>
                        </div>
                        {img.isPrimary && (
                          <div className="absolute bottom-1.5 left-1.5 bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                            PRIMARY
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Product Variants Card */}
              <Card className="rounded-2xl border border-border shadow-xs bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold font-sans">Variants & Inventory</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Configure sizes, color swatches, individual stock counts, and SKUs
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddVariant}
                    className="rounded-xl flex items-center gap-1 text-xs cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Variant</span>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2.5">
                    {variants.map((v, idx) => (
                      <div
                        key={v.id}
                        className="p-3 rounded-xl border border-border bg-muted/20 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                      >
                        {/* Size */}
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                            Size
                          </label>
                          <select
                            value={v.size}
                            onChange={(e) => handleVariantChange(v.id, "size", e.target.value)}
                            className="w-full h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground focus:outline-none"
                          >
                            {COMMON_SIZES.map((sz) => (
                              <option key={sz} value={sz}>
                                {sz}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Color Name & Hex */}
                        <div className="sm:col-span-4 flex items-center gap-2">
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                              Color Name
                            </label>
                            <input
                              type="text"
                              value={v.colorName}
                              onChange={(e) => handleVariantChange(v.id, "colorName", e.target.value)}
                              placeholder="e.g. Navy Blue"
                              className="w-full h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none"
                            />
                          </div>
                          <div className="w-12">
                            <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                              Swatch
                            </label>
                            <input
                              type="color"
                              value={v.colorHex}
                              onChange={(e) => handleVariantChange(v.id, "colorHex", e.target.value)}
                              className="w-full h-8 rounded-lg border border-border bg-card p-0.5 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Stock Quantity */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                            Stock Qty
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={v.stockQuantity}
                            onChange={(e) => handleVariantChange(v.id, "stockQuantity", e.target.value)}
                            className="w-full h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none"
                          />
                        </div>

                        {/* SKU */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                            SKU
                          </label>
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => handleVariantChange(v.id, "sku", e.target.value)}
                            className="w-full h-8 rounded-lg border border-border bg-card px-2 text-xs font-mono text-foreground focus:outline-none"
                          />
                        </div>

                        {/* Remove button */}
                        <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="text-muted-foreground hover:text-rose-600 transition p-1.5 rounded cursor-pointer"
                            title="Remove variant"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (4 cols): Category, Pricing & Status */}
            <div className="lg:col-span-4 space-y-6">
              {/* Category & Organization Card */}
              <Card className="rounded-2xl border border-border shadow-xs bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-bold font-sans">Organization & Style</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Parent Category (Dress Style) */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Parent Category (Dress Style) *
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {["Casual", "Formal", "Party", "Gym"].map((style) => {
                        const isSelected = dressStyle.toLowerCase() === style.toLowerCase();
                        return (
                          <button
                            key={style}
                            type="button"
                            onClick={() => setDressStyle(style)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                              isSelected
                                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs font-semibold"
                                : "bg-muted/40 hover:bg-muted text-foreground border-border"
                            }`}
                          >
                            {style}
                          </button>
                        );
                      })}
                    </div>
                    <select
                      value={dressStyle}
                      onChange={(e) => setDressStyle(e.target.value)}
                      className="w-full h-10 rounded-xl border border-border bg-card px-3 pr-8 text-xs text-foreground focus:outline-none focus:border-ring transition-colors cursor-pointer"
                    >
                      {["Casual", "Formal", "Party", "Gym"].map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Garment Subcategory */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Subcategory (Garment Type) *
                    </label>

                    {/* Quick Category Chips / Pills */}
                    {categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {categories.map((c) => {
                          const isSelected = categoryId === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setCategoryId(c.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                                isSelected
                                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs font-semibold"
                                  : "bg-muted/40 hover:bg-muted text-foreground border-border"
                              }`}
                            >
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Category Dropdown */}
                    <div className="relative">
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full h-10 rounded-xl border border-border bg-card px-3 pr-8 text-xs text-foreground focus:outline-none focus:border-ring transition-colors cursor-pointer"
                      >
                        <option value="" disabled>
                          -- Choose a Category --
                        </option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Visibility Status
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsActive(true)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsActive(false)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          !isActive
                            ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        Inactive
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Card */}
              <Card className="rounded-2xl border border-border shadow-xs bg-card">
                <CardHeader>
                  <CardTitle className="text-base font-bold font-sans">Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Selling Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="120.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full h-10 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus:border-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Original Price ($) (Optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="150.00"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full h-10 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Discount (%) (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="20"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-full h-10 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
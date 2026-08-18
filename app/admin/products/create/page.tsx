"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  Trash2,
  Image as ImageIcon,
  UploadCloud,
  X,
  Check,
  RefreshCw,
  PlusCircle,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface VariantItem {
  id: string;
  option: string; // Size, Color, Material, Style, Status
  value: string; // SM, MD, LG, Black, etc.
  price: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State - Left Column
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [description, setDescription] = useState("");

  // Images State
  const [images, setImages] = useState<string[]>([
    "/images/product-1.png",
  ]);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  // Variants State
  const [variants, setVariants] = useState<VariantItem[]>([
    { id: "v-1", option: "Size", value: "SM", price: "120.40" },
    { id: "v-2", option: "Size", value: "MD", price: "120.40" },
  ]);

  // Form State - Right Column
  const [basePrice, setBasePrice] = useState("120.40");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [chargeTax, setChargeTax] = useState(false);
  const [inStock, setInStock] = useState(true);

  const [status, setStatus] = useState<"Draft" | "Published" | "Out of Stock" | "Archived">("Draft");

  // Categories & Subcategories
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [subcategories, setSubcategories] = useState<string[]>([
    "T-Shirts",
    "Casual Shirts",
    "Formal Shirts",
    "Jeans",
    "Hoodies & Sweatshirts",
    "Shorts",
    "Jackets & Coats",
    "Tracksuits",
    "Accessories",
  ]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("T-Shirts");

  // Modals for Adding Category / Subcategory
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const [isAddSubcategoryModalOpen, setIsAddSubcategoryModalOpen] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch initial categories from DB
  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
        if (data.data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(data.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Handle Add Variant Row
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `v-${Date.now()}`,
        option: "Size",
        value: "",
        price: basePrice || "120.40",
      },
    ]);
  };

  // Handle Remove Variant Row
  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // Handle Variant Change
  const handleUpdateVariant = (
    id: string,
    field: "option" | "value" | "price",
    val: string
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: val } : v))
    );
  };

  // Handle Image File Upload (mock/local data URL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Add Media from URL
  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput("");
    setIsUrlModalOpen(false);
    showToast("Image added from URL!");
  };

  // Handle Remove Image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Create Category in DB
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreatingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCategories((prev) => [...prev, data.data]);
        setSelectedCategoryId(data.data.id);
        setNewCategoryName("");
        setIsAddCategoryModalOpen(false);
        showToast(`Category "${data.data.name}" added!`);
      } else {
        showToast(data.message || "Failed to create category");
      }
    } catch (err) {
      console.error(err);
      showToast("Error creating category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Handle Create Subcategory locally
  const handleCreateSubcategory = () => {
    if (!newSubcategoryName.trim()) return;
    const trimmed = newSubcategoryName.trim();
    if (!subcategories.includes(trimmed)) {
      setSubcategories((prev) => [...prev, trimmed]);
    }
    setSelectedSubcategory(trimmed);
    setNewSubcategoryName("");
    setIsAddSubcategoryModalOpen(false);
    showToast(`Subcategory "${trimmed}" added!`);
  };

  // Handle Submit Form (Publish or Draft)
  const handleSubmit = async (submitStatus: "Draft" | "Published") => {
    if (!name.trim()) {
      showToast("Product name is required!");
      return;
    }
    if (!selectedCategoryId) {
      showToast("Please select a category!");
      return;
    }
    if (!basePrice || isNaN(parseFloat(basePrice))) {
      showToast("Please enter a valid price!");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedPrice = parseFloat(basePrice);
      const parsedDiscounted = discountedPrice ? parseFloat(discountedPrice) : null;
      let discountPct = 0;
      if (parsedDiscounted && parsedPrice > parsedDiscounted) {
        discountPct = Math.round(((parsedPrice - parsedDiscounted) / parsedPrice) * 100);
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || "Quality cotton apparel crafted for comfort and style.",
          price: parsedPrice,
          originalPrice: parsedDiscounted ? parsedPrice : null,
          discountPercent: discountPct,
          categoryId: selectedCategoryId,
          dressStyle: selectedSubcategory || "Casual",
          status: submitStatus === "Draft" ? "DRAFT" : "ACTIVE",
          sku: sku.trim() || undefined,
          barcode: barcode.trim() || undefined,
          images: images.length > 0 ? images.map((url, i) => ({ url, isPrimary: i === 0 })) : [{ url: "/images/product-1.png", isPrimary: true }],
          variants: variants.map((v) => ({
            size: v.value || "M",
            colorName: v.option === "Color" ? v.value : "Standard",
            colorHex: "#000000",
            stockQuantity: inStock ? 50 : 0,
            sku: sku ? `${sku}-${v.value || "M"}` : undefined,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          submitStatus === "Draft"
            ? "Product saved as draft!"
            : "Product published successfully!"
        );
        setTimeout(() => {
          router.push("/admin/products");
        }, 1000);
      } else {
        showToast(data.error || "Failed to create product");
      }
    } catch (err) {
      console.error(err);
      showToast("Error creating product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 font-satoshi text-slate-900 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header: Back Button, Title & Action Buttons (Screenshot 1 Match) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-2xs"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Add Products
          </h1>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="bg-[#E2E8F0] hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
          >
            Discard
          </button>

          <button
            type="button"
            onClick={() => handleSubmit("Draft")}
            disabled={isSubmitting}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-4 py-2 rounded-lg text-xs transition cursor-pointer shadow-2xs"
          >
            {isSubmitting && status === "Draft" ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit("Published")}
            disabled={isSubmitting}
            className="bg-black hover:bg-black/80 text-white font-semibold px-5 py-2 rounded-lg text-xs transition cursor-pointer shadow-xs"
          >
            {isSubmitting && status === "Published" ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Main 2-Column Form Layout (Screenshots 1 & 2 Match) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN (Col Span 8) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1️⃣ Product Details Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Product Details
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Prism T-Shirt"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-slate-400 outline-none transition"
                />
              </div>

              {/* SKU & Barcode Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    SKU
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WH1000XM4"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-slate-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Barcode
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 012345678901"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-slate-400 outline-none transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Tommy Hilfiger men striped pink sweatshirt. Crafted with cotton. Material composition is 100% organic cotton."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-slate-400 outline-none transition"
                />
                <span className="text-[11px] text-slate-400 font-normal block mt-1.5">
                  Set a description to the product for better visibility.
                </span>
              </div>
            </div>
          </div>

          {/* 2️⃣ Product Images Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Product Images
              </h2>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(true)}
                className="text-xs font-semibold text-slate-600 hover:text-black transition cursor-pointer"
              >
                Add media from URL
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Drag & Drop Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer space-y-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs mx-auto flex items-center justify-center text-slate-400">
                <ImageIcon size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Drop your images here
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PNG or JPG (max. 5MB)
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-lg px-4 py-2 text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud size={13} />
                  <span>Select images</span>
                </button>
              </div>
            </div>

            {/* Uploaded Images Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl bg-[#EFEFEF] overflow-hidden border border-slate-200 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Remove image"
                    >
                      <X size={11} />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-sm">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3️⃣ Variants Card (Screenshot 2 Match) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Variants
            </h2>

            {/* Table Header Labels */}
            <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-slate-700 px-1">
              <div className="col-span-4">Options</div>
              <div className="col-span-4">Value</div>
              <div className="col-span-3">Price</div>
              <div className="col-span-1"></div>
            </div>

            {/* Variant Rows List */}
            <div className="space-y-2.5">
              {variants.map((v) => (
                <div key={v.id} className="grid grid-cols-12 gap-3 items-center">
                  {/* Options Dropdown */}
                  <div className="col-span-4 relative">
                    <select
                      value={v.option}
                      onChange={(e) =>
                        handleUpdateVariant(v.id, "option", e.target.value)
                      }
                      className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 bg-white focus:border-slate-400 outline-none pr-8 cursor-pointer"
                    >
                      <option value="Size">Size</option>
                      <option value="Color">Color</option>
                      <option value="Material">Material</option>
                      <option value="Style">Style</option>
                      <option value="Status">Status</option>
                    </select>
                    <ChevronDown
                      size={13}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>

                  {/* Value Input */}
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder={v.option === "Size" ? "e.g. SM" : "e.g. Black"}
                      value={v.value}
                      onChange={(e) =>
                        handleUpdateVariant(v.id, "value", e.target.value)
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:border-slate-400 outline-none"
                    />
                  </div>

                  {/* Price Input */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="120.40"
                      value={v.price}
                      onChange={(e) =>
                        handleUpdateVariant(v.id, "price", e.target.value)
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:border-slate-400 outline-none"
                    />
                  </div>

                  {/* Delete Row Button */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.id)}
                      className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                      title="Remove row"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Variant Button */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-black transition cursor-pointer"
              >
                <PlusCircle size={14} />
                <span>Add Variant</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (Col Span 4) ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1️⃣ Pricing Card (Screenshot 1 Match) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Pricing
            </h2>

            <div className="space-y-3.5">
              {/* Base Price */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Base Price
                </label>
                <input
                  type="text"
                  placeholder="120.40"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-slate-400 outline-none transition"
                />
              </div>

              {/* Discounted Price */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Discounted Price
                </label>
                <input
                  type="text"
                  placeholder="e.g. 99.00"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-slate-400 outline-none transition"
                />
              </div>

              {/* Charge Tax Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={chargeTax}
                  onChange={(e) => setChargeTax(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Charge tax on this product
                </span>
              </label>

              {/* In Stock Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-800">
                  In stock
                </span>
                <button
                  type="button"
                  onClick={() => setInStock(!inStock)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    inStock ? "bg-slate-900" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      inStock ? "left-5.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 2️⃣ Status Card (Screenshot 1 Match) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900">
              Status
            </h2>

            <div className="relative">
              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as "Draft" | "Published" | "Out of Stock" | "Archived"
                  )
                }
                className="w-full appearance-none border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:border-slate-400 outline-none pr-8 cursor-pointer font-medium"
              >
                <option value="Draft">🟠 Draft</option>
                <option value="Published">🟢 Published / Active</option>
                <option value="Out of Stock">🔴 Out of Stock</option>
                <option value="Archived">⚪ Archived</option>
              </select>
              <ChevronDown
                size={13}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            <span className="text-[11px] text-slate-400 font-normal block">
              Set the product status.
            </span>
          </div>

          {/* 3️⃣ Categories Card (Screenshot 2 Match) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3.5">
            <h2 className="text-sm font-bold text-slate-900">
              Categories
            </h2>

            {/* Category Select Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:border-slate-400 outline-none pr-8 cursor-pointer font-medium"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>

              {/* ⊕ Add Category Button */}
              <button
                type="button"
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition cursor-pointer shadow-2xs shrink-0"
                title="Add new category"
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Subcategory Select Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:border-slate-400 outline-none pr-8 cursor-pointer font-medium"
                >
                  <option value="" disabled>
                    Select a sub category
                  </option>
                  {subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>

              {/* ⊕ Add Subcategory Button */}
              <button
                type="button"
                onClick={() => setIsAddSubcategoryModalOpen(true)}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition cursor-pointer shadow-2xs shrink-0"
                title="Add new subcategory"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 Add Category Modal */}
      {isAddCategoryModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddCategoryModalOpen(false);
          }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PlusCircle size={15} />
                <span>Add New Category</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div>
              <label className="font-semibold block text-slate-700 mb-1 text-xs">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Footwear, Accessories, Jackets"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="rounded-lg text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateCategory}
                disabled={isCreatingCategory || !newCategoryName.trim()}
                className="bg-black hover:bg-black/80 text-white rounded-lg text-xs font-semibold"
              >
                {isCreatingCategory ? "Adding..." : "Add Category"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Add Subcategory Modal */}
      {isAddSubcategoryModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddSubcategoryModalOpen(false);
          }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PlusCircle size={15} />
                <span>Add Subcategory</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddSubcategoryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div>
              <label className="font-semibold block text-slate-700 mb-1 text-xs">
                Subcategory Name
              </label>
              <input
                type="text"
                placeholder="e.g. Slim Jeans, Graphic Tees"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddSubcategoryModalOpen(false)}
                className="rounded-lg text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateSubcategory}
                disabled={!newSubcategoryName.trim()}
                className="bg-black hover:bg-black/80 text-white rounded-lg text-xs font-semibold"
              >
                Add Subcategory
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Add Media from URL Modal */}
      {isUrlModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsUrlModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <LinkIcon size={15} />
                <span>Add Image from URL</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div>
              <label className="font-semibold block text-slate-700 mb-1 text-xs">
                Image URL
              </label>
              <input
                type="text"
                placeholder="https://... or /images/product-2.png"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUrlModalOpen(false)}
                className="rounded-lg text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddImageUrl}
                disabled={!urlInput.trim()}
                className="bg-black hover:bg-black/80 text-white rounded-lg text-xs font-semibold"
              >
                Add Image
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
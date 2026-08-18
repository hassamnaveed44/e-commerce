"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Truck,
  Layers,
  CircleDollarSign,
  HandCoins,
  Star,
  PlusCircle,
  Heart,
  ShoppingCart,
  Check,
  X,
  AlertTriangle,
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

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  avatar?: string;
}

interface OtherProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  seller: string;
  sku: string;
  description: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  dressStyle: string;
  category: string;
  categoryId: string;
  categorySlug: string;
  brand: string;
  color: string;
  weight: string;
  ordersCount: number;
  stock: number;
  totalRevenue: number;
  isActive: boolean;
  averageRating: number;
  ratingCount: number;
  images: ProductImage[];
  variants: ProductVariant[];
  reviewBreakdown: {
    stars: number;
    count: number;
    percentage: number;
  }[];
  reviews: ReviewItem[];
  createdAt: string;
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
  const [otherProducts, setOtherProducts] = useState<OtherProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState("#10B981");
  const [selectedSize, setSelectedSize] = useState("MD");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reviews Load More State
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(4);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Submit Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch single product details
  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`);
      const data = await res.json();
      if (data.success && data.product) {
        setProduct(data.product);
        setOtherProducts(data.otherProducts || []);
        setEditName(data.product.name);
        setEditPrice(String(data.product.price));
        setEditDescription(data.product.description);
        setActiveImageIdx(0);

        // Set initial color and size from real product variants
        const firstVariant = data.product.variants?.[0];
        if (firstVariant?.size) setSelectedSize(firstVariant.size);
        if (firstVariant?.colorHex) setSelectedColor(firstVariant.colorHex);
      }
    } catch (err) {
      console.error("Failed to load product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // Handle Edit Save
  const handleSaveEdit = async () => {
    if (!product) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          price: parseFloat(editPrice) || product.price,
          description: editDescription,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProduct((prev) =>
          prev
            ? {
                ...prev,
                name: editName,
                price: parseFloat(editPrice) || prev.price,
                description: editDescription,
              }
            : null
        );
        setIsEditModalOpen(false);
        showToast("Product updated successfully!");
      }
    } catch (err) {
      console.error("Failed to save product:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDeleteProduct = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/products");
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Add to Cart Preview
  const handleAddToCart = () => {
    if (!product) return;
    showToast(`Added ${product.name} (${selectedSize}) to cart!`);
  };

  // Handle Submit Review (Dynamic integration: immediately prepends to current reviews)
  const handleSubmitReview = async () => {
    if (!product || !reviewTitle || !reviewComment) return;
    setIsSubmittingReview(true);
    try {
      const newRev: ReviewItem = {
        id: `rev-${Date.now()}`,
        authorName: reviewName || "Verified Buyer",
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        createdAt: "Just now",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      };

      setProduct((prev) => {
        if (!prev) return null;
        const updatedReviews = [newRev, ...prev.reviews];
        const newTotal = updatedReviews.length;
        const newSum = updatedReviews.reduce((s, r) => s + r.rating, 0);
        const newAvg = Number((newSum / newTotal).toFixed(1));

        return {
          ...prev,
          reviews: updatedReviews,
          ratingCount: newTotal,
          averageRating: newAvg,
        };
      });

      setIsReviewModalOpen(false);
      setReviewTitle("");
      setReviewComment("");
      showToast("Review submitted successfully!");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 font-satoshi">
        <RefreshCw size={20} className="animate-spin text-slate-600" />
        <span className="text-sm font-medium">Loading product details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16 text-center font-satoshi text-slate-600 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Product not found</h2>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-black underline"
        >
          <ArrowLeft size={13} />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  // 🖼️ DYNAMIC CAROUSEL IMAGES
  const hasMultipleImages = product.images && product.images.length > 1;

  const currentMainImage = hasMultipleImages
    ? product.images[activeImageIdx]?.url || product.images[0]?.url
    : product.images[0]?.url || "/images/product-1.png";

  const totalImageCount = hasMultipleImages ? product.images.length : 1;

  const prevImage = () => {
    if (hasMultipleImages) {
      setActiveImageIdx((prev) => (prev === 0 ? totalImageCount - 1 : prev - 1));
    }
  };

  const nextImage = () => {
    if (hasMultipleImages) {
      setActiveImageIdx((prev) => (prev === totalImageCount - 1 ? 0 : prev + 1));
    }
  };

  // 🎯 DYNAMIC SIZES AVAILABLE FOR THIS PRODUCT
  const availableSizes: string[] = [];
  const seenSizes = new Set<string>();
  if (product.variants && product.variants.length > 0) {
    for (const v of product.variants) {
      if (v.size && !seenSizes.has(v.size)) {
        seenSizes.add(v.size);
        availableSizes.push(v.size);
      }
    }
  }
  const displaySizes = availableSizes.length > 0 ? availableSizes : ["SM", "MD", "LG", "XL", "XXL"];

  // 🎨 DYNAMIC COLORS AVAILABLE FOR THIS PRODUCT
  const availableColors: { hex: string; name: string }[] = [];
  const seenColors = new Set<string>();
  if (product.variants && product.variants.length > 0) {
    for (const v of product.variants) {
      const hex =
        v.colorHex ||
        (v.colorName?.toLowerCase() === "emerald"
          ? "#10B981"
          : v.colorName?.toLowerCase() === "indigo"
          ? "#6366F1"
          : v.colorName?.toLowerCase() === "purple"
          ? "#A855F7"
          : v.colorName?.toLowerCase() === "black"
          ? "#0F172A"
          : v.colorName?.toLowerCase() === "white"
          ? "#F8FAFC"
          : v.colorName?.toLowerCase() === "red"
          ? "#EF4444"
          : v.colorName?.toLowerCase() === "blue"
          ? "#3B82F6"
          : "#10B981");
      const name = v.colorName || "Color";
      if (!seenColors.has(hex.toLowerCase())) {
        seenColors.add(hex.toLowerCase());
        availableColors.push({ hex, name });
      }
    }
  }
  const displayColors =
    availableColors.length > 0
      ? availableColors
      : [
          { hex: "#10B981", name: "Emerald" },
          { hex: "#6366F1", name: "Indigo" },
          { hex: "#A855F7", name: "Purple" },
        ];

  return (
    <div className="space-y-6 pb-20 font-satoshi text-slate-900 max-w-7xl mx-auto">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1️⃣ Top Header: Title, Metadata, Edit & Delete Buttons (Screenshot 1 Match) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {product.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-1.5 text-xs text-slate-500 font-normal">
            <span>
              <strong className="text-slate-800 font-medium">Seller :</strong>{" "}
              {product.seller || "Poetic Fashion"}
            </span>
            <span>
              <strong className="text-slate-800 font-medium">Published :</strong>{" "}
              {product.createdAt || "20 Oct, 2024"}
            </span>
            <span>
              <strong className="text-slate-800 font-medium">SKU :</strong>{" "}
              {product.sku || "WH1000XM4"}
            </span>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="bg-black text-white hover:bg-black/80 rounded-lg px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Edit size={13} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="bg-[#DC2626] text-white hover:bg-red-700 rounded-lg p-2 text-xs font-semibold flex items-center justify-center shadow-xs transition cursor-pointer"
            title="Delete Product"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* 2️⃣ Main 2-Column Section: Sticky Left Carousel + All Content in Single Scrolling Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dynamic Sticky Image Carousel (Stays fixed on scroll) */}
        <div className="lg:col-span-5 space-y-3.5 lg:sticky lg:top-6 lg:self-start">
          {/* Big Featured Image Container */}
          <div className="relative w-full aspect-square rounded-2xl bg-[#EFEFEF] overflow-hidden border border-slate-200 shadow-xs flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentMainImage}
              alt={product.name}
              className="w-full h-full object-cover transition duration-300"
            />

            {/* Left Chevron Button (Active if multiple images) */}
            {hasMultipleImages && (
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            {/* Right Chevron Button (Active if multiple images) */}
            {hasMultipleImages && (
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>

          {/* 4 Thumbnails Below Main Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {hasMultipleImages
              ? // Case A: Product has multiple images
                product.images.slice(0, 4).map((img, idx) => {
                  const isActive = activeImageIdx === idx;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`aspect-square rounded-xl bg-[#EFEFEF] overflow-hidden border-2 transition cursor-pointer ${
                        isActive ? "border-slate-900 shadow-xs" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={`View ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })
              : // Case B: 1 image on this product -> Show this product + other active store products!
                [
                  { id: product.id, image: currentMainImage, isCurrent: true, name: product.name },
                  ...otherProducts.slice(0, 3).map((op) => ({
                    id: op.id,
                    image: op.image,
                    isCurrent: false,
                    name: op.name,
                  })),
                ].map((item, idx) => {
                  return (
                    <button
                      key={item.id + idx}
                      type="button"
                      onClick={() => {
                        if (!item.isCurrent) {
                          router.push(`/admin/products/${item.id}`);
                        }
                      }}
                      className={`aspect-square rounded-xl bg-[#EFEFEF] overflow-hidden border-2 transition cursor-pointer ${
                        item.isCurrent
                          ? "border-slate-900 shadow-xs"
                          : "border-transparent opacity-75 hover:opacity-100 hover:border-slate-400"
                      }`}
                      title={item.isCurrent ? product.name : `View ${item.name}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Right Column: 4 KPI Cards + Spec & Details Card + Reviews Parent Container */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Top 4 Mini Metric Cards with Soft Grey Background (Screenshot 1 Match) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Card 1: Price */}
            <div className="rounded-xl border border-slate-200/90 bg-[#F8FAFC] p-3.5 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-500 shrink-0">
                <CircleDollarSign size={18} />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-normal block">
                  Price
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-mono">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Card 2: No. of Orders */}
            <div className="rounded-xl border border-slate-200/90 bg-[#F8FAFC] p-3.5 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-500 shrink-0">
                <Truck size={17} />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-normal block">
                  No. of Orders
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-mono">
                  {product.ordersCount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Card 3: Available Stocks */}
            <div className="rounded-xl border border-slate-200/90 bg-[#F8FAFC] p-3.5 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-500 shrink-0">
                <Layers size={17} />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-normal block">
                  Available Stocks
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-mono">
                  {product.stock.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Card 4: Total Revenue */}
            <div className="rounded-xl border border-slate-200/90 bg-[#F8FAFC] p-3.5 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-500 shrink-0">
                <HandCoins size={17} />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-normal block">
                  Total Revenue
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-mono">
                  ${product.totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 2. White Details Container (Spec Table, Description, Key Features, Dynamic Colors, Dynamic Sizes, Add to Card) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            {/* Top Row: Description & Spec Table */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Description & Key Features */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                    Description:
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                    {product.description ||
                      "Tommy Hilfiger men striped pink sweatshirt. Crafted with cotton. Material composition is 100% organic cotton."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">
                    Key Features:
                  </h3>
                  <ul className="space-y-1 text-xs sm:text-[13px] text-slate-600 list-disc list-inside">
                    <li>Industry-leading noise cancellation</li>
                    <li>30-hour battery life</li>
                    <li>Touch sensor controls</li>
                    <li>Speak-to-chat technology</li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Specification Mini Table (Screenshot 1 Match) */}
              <div className="md:col-span-5 rounded-xl border border-slate-200 bg-white overflow-hidden text-xs">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
                  <span className="font-bold text-slate-800">Category</span>
                  <span className="text-slate-600 font-normal">{product.category || "T-Shirt"}</span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
                  <span className="font-bold text-slate-800">Brand</span>
                  <span className="text-slate-600 font-normal">{product.brand || "Tommy Hilfiger"}</span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
                  <span className="font-bold text-slate-800">Color</span>
                  <span className="text-slate-600 font-normal">{product.color || "Purple"}</span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="font-bold text-slate-800">Weight</span>
                  <span className="text-slate-600 font-normal">{product.weight || "140 Gr"}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Available Colors Selector */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-2">Colors:</h3>
              <div className="flex items-center gap-2.5">
                {displayColors.map((c) => {
                  const isSel = selectedColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex + c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full transition cursor-pointer ${
                        isSel ? "ring-2 ring-offset-2 ring-slate-900 scale-105" : "hover:scale-105 opacity-90"
                      }`}
                      title={c.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Dynamic Available Sizes Selector */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-2">Sizes:</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {displaySizes.map((sz) => {
                  const isSel = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isSel
                          ? "border-2 border-slate-900 bg-white text-slate-900 shadow-2xs"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: Add to Card & Wishlist (Screenshot 1 Match) */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="bg-black text-white hover:bg-black/80 rounded-lg px-5 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-95"
              >
                <ShoppingCart size={14} />
                <span>Add to Card</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsWishlisted(!isWishlisted);
                  showToast(!isWishlisted ? "Added to wishlist!" : "Removed from wishlist!");
                }}
                className={`border rounded-lg px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-2xs transition cursor-pointer active:scale-95 ${
                  isWishlisted
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Heart size={14} className={isWishlisted ? "fill-rose-600" : ""} />
                <span>Wishlist</span>
              </button>
            </div>
          </div>

          {/* 3. 📦 REVIEWS IN UNIFIED PARENT CONTAINER (Exact Match to User Screenshot!) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            {/* Reviews Header inside Parent Container */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Reviews
              </h2>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <PlusCircle size={13} />
                <span>Submit Review</span>
              </button>
            </div>

            {/* Reviews 2-Column Grid inside Parent Container */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Column: Customer Review Cards List */}
              <div className="md:col-span-7 space-y-3.5">
                {product.reviews.slice(0, visibleReviewsCount).map((rev, idx) => {
                  const fallbackAvatars = [
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                  ];
                  const avatarUrl = rev.avatar || fallbackAvatars[idx % fallbackAvatars.length];

                  return (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-2.5"
                    >
                      {/* Review Header: Avatar, Name, Rating, Time */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={avatarUrl}
                              alt={rev.authorName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs sm:text-[13px] block">
                              {rev.authorName}
                            </span>
                            <div className="inline-flex items-center gap-1 bg-white text-slate-800 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 shadow-2xs">
                              <Star size={10} className="fill-amber-400 text-amber-400" />
                              <span>{rev.rating}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400 font-normal">
                          {rev.createdAt}
                        </span>
                      </div>

                      {/* Review Title & Body */}
                      <h4 className="font-bold text-slate-900 text-xs sm:text-[13px]">
                        {rev.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {rev.comment}
                      </p>
                    </div>
                  );
                })}

                {/* Load more button */}
                {product.reviews.length > visibleReviewsCount && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleReviewsCount((prev) => prev + 3)
                      }
                      className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg px-4 py-2 text-xs font-semibold shadow-2xs transition cursor-pointer"
                    >
                      Load more..
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Review Breakdown Summary Card (Screenshot Match) */}
              <div className="md:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
                {/* Header: 4.3 (12 reviews) & Stars */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <Star
                        key={starIdx}
                        size={15}
                        className={
                          starIdx <= Math.floor(product.averageRating || 4.3)
                            ? "fill-amber-400 text-amber-400"
                            : "text-amber-400"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {product.averageRating || "4.3"} ({product.ratingCount || "12"} reviews)
                  </span>
                </div>

                {/* Star Distribution Progress Bars */}
                <div className="space-y-3 text-xs text-slate-600">
                  {[
                    { star: "5 stars", width: "70%", pct: "70%" },
                    { star: "4 stars", width: "17%", pct: "17%" },
                    { star: "3 stars", width: "7%", pct: "7%" },
                    { star: "2 stars", width: "4%", pct: "4%" },
                    { star: "1 star", width: "2%", pct: "2%" },
                  ].map((item) => (
                    <div key={item.star} className="flex items-center gap-2.5">
                      <span className="w-11 font-medium text-slate-700 shrink-0 text-[11px]">
                        {item.star}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200/70 overflow-hidden">
                        <div
                          style={{ width: item.width }}
                          className="h-full bg-black rounded-full transition-all duration-300"
                        />
                      </div>
                      <span className="w-8 text-right font-medium text-slate-500 shrink-0 text-[11px]">
                        {item.pct}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4️⃣ Edit Product Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Edit size={15} />
                <span>Edit Product Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="bg-black hover:bg-black/80 text-white rounded-lg text-xs font-semibold"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5️⃣ Delete Product Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDeleteModalOpen(false);
          }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-500" />
                <span>Delete Product</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900">{product.name}</strong>? This action cannot be undone.
            </p>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-lg text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6️⃣ Submit Review Modal */}
      {isReviewModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsReviewModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Star size={15} className="text-amber-500 fill-amber-400" />
                <span>Submit Product Review</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex M."
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-1.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="cursor-pointer transition hover:scale-110"
                    >
                      <Star
                        size={20}
                        className={
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-slate-700 text-xs">
                    {reviewRating} out of 5
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Highly functional and stylish"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Review Comments
                </label>
                <textarea
                  rows={3}
                  placeholder="Share your thoughts about this product..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReviewModalOpen(false)}
                className="rounded-lg text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitReview}
                disabled={isSubmittingReview || !reviewTitle || !reviewComment}
                className="bg-black hover:bg-black/80 text-white rounded-lg text-xs font-semibold"
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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
  DollarSign,
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
  const [isLoading, setIsLoading] = useState(true);

  // Static fashion carousel items matching screenshot
  const staticCarouselImages = [
    { id: "img-1", url: "/images/product-1.png", alt: "Hoodie" },
    { id: "img-2", url: "/images/product-2.png", alt: "T-Shirt" },
    { id: "img-3", url: "/images/product-3.png", alt: "Sweatpants" },
    { id: "img-4", url: "/images/product-4.png", alt: "Cap" },
  ];

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
        setEditName(data.product.name);
        setEditPrice(String(data.product.price));
        setEditDescription(data.product.description);
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

  // Handle Submit Review
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
        avatar: undefined,
      };

      setProduct((prev) =>
        prev
          ? {
              ...prev,
              reviews: [newRev, ...prev.reviews],
              ratingCount: prev.ratingCount + 1,
            }
          : null
      );
      setIsReviewModalOpen(false);
      setReviewTitle("");
      setReviewComment("");
      showToast("Review submitted successfully!");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Carousel navigation
  const prevImage = () => {
    setActiveImageIdx((prev) =>
      prev === 0 ? staticCarouselImages.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setActiveImageIdx((prev) =>
      prev === staticCarouselImages.length - 1 ? 0 : prev + 1
    );
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

  const activeImage = staticCarouselImages[activeImageIdx] || staticCarouselImages[0];

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
        {/* Left Column: Static Sticky Fashion Image Carousel (Does not move away on scroll) */}
        <div className="lg:col-span-5 space-y-3.5 lg:sticky lg:top-6 lg:self-start">
          {/* Big Featured Image Container */}
          <div className="relative w-full aspect-square rounded-2xl bg-[#EFEFEF] overflow-hidden border border-slate-200 shadow-xs flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.url}
              alt={activeImage.alt}
              className="w-full h-full object-cover transition duration-300"
            />

            {/* Left Chevron Button */}
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Right Chevron Button */}
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 4 Bottom Thumbnails (Hoodie, T-Shirt, Sweatpants, Cap) */}
          <div className="grid grid-cols-4 gap-2.5">
            {staticCarouselImages.map((img, idx) => {
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
                    alt={img.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: 4 KPI Cards + Spec & Details Card + Reviews Section (All in one unified flow!) */}
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

          {/* 2. White Details Container (Spec Table, Description, Key Features, Colors, Sizes, Add to Card) */}
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

            {/* Colors Selector (Screenshot 1 Match) */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-2">Colors:</h3>
              <div className="flex items-center gap-2.5">
                {[
                  { hex: "#10B981", name: "Emerald" },
                  { hex: "#6366F1", name: "Indigo" },
                  { hex: "#A855F7", name: "Purple" },
                ].map((c) => {
                  const isSel = selectedColor === c.hex;
                  return (
                    <button
                      key={c.hex}
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

            {/* Sizes Selector (Screenshot 1 Match) */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-2">Sizes:</h3>
              <div className="flex items-center gap-2">
                {["SM", "MD", "LG", "XL", "XXL"].map((sz) => {
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

          {/* 3. Reviews Section (Nested Directly Inside Right Column - Screenshot 2 Match!) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
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

            {/* Reviews 2-Column Grid inside Right Column */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Column: Customer Review Cards List (Screenshot 2 Match) */}
              <div className="md:col-span-7 space-y-3">
                {product.reviews.slice(0, visibleReviewsCount).map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-2.5"
                  >
                    {/* Review Header: Avatar, Name, Rating, Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-600 text-xs">
                          {rev.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs sm:text-[13px] block">
                            {rev.authorName}
                          </span>
                          <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.2 rounded-full text-[10px] font-bold mt-0.5">
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
                ))}

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

              {/* Right Column: Review Breakdown Summary Card (Screenshot 2 Match) */}
              <div className="md:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
                {/* Header: Stars & Average Rating */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.round(product.averageRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {product.averageRating} ({product.ratingCount} reviews)
                  </span>
                </div>

                {/* Star Distribution Progress Bars */}
                <div className="space-y-2.5 text-xs text-slate-600">
                  {product.reviewBreakdown.map((item) => (
                    <div key={item.stars} className="flex items-center gap-2">
                      <span className="w-10 font-medium text-slate-700 shrink-0 text-[11px]">
                        {item.stars} {item.stars === 1 ? "star" : "stars"}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${item.percentage}%` }}
                          className="h-full bg-slate-900 rounded-full transition-all duration-300"
                        />
                      </div>
                      <span className="w-7 text-right font-medium text-slate-500 shrink-0 text-[11px]">
                        {item.percentage}%
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
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  DollarSign,
  Truck,
  Layers,
  Coins,
  ShoppingCart,
  Heart,
  PlusCircle,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ProductDetailPage() {
  // Gallery Carousel State
  const images = [
    "/images/product-8.png", // Oversized Hoodie
    "/images/product-2.png", // Black T-Shirt
    "/images/product-3.png", // Jeans
    "/images/product-4.png", // Red Cap / Sneakers
  ];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Purple");
  const [selectedSize, setSelectedSize] = useState("MD");

  const colors = [
    { name: "Green", class: "bg-emerald-400" },
    { name: "Blue", class: "bg-indigo-500" },
    { name: "Purple", class: "bg-purple-500" },
  ];

  const sizes = ["SM", "MD", "LG", "XL", "XXL"];

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Customer Reviews Data with Dummy Initials Avatars
  const reviews = [
    {
      id: 1,
      name: "Mark P.",
      initials: "MP",
      avatarBg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      time: "5 days ago",
      rating: 3.2,
      title: "Decent but could be better",
      text: "The product is okay, but I expected more for the price. A few minor flaws, but overall, it's acceptable.",
    },
    {
      id: 2,
      name: "Jessica K.",
      initials: "JK",
      avatarBg: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300",
      time: "2 weeks ago",
      rating: 4.8,
      title: "Beautiful design",
      text: "I love the sleek design and the ease of use. Haven't come across such a stylish product in a long time. Highly satisfied!",
    },
    {
      id: 3,
      name: "Michael B.",
      initials: "MB",
      avatarBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      time: "4 days ago",
      rating: 4.5,
      title: "Satisfied with my purchase",
      text: "I'm really happy with this purchase. The quality is great, and it works just as described. No complaints so far!",
    },
    {
      id: 4,
      name: "Anna M.",
      initials: "AM",
      avatarBg: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
      time: "6 days ago",
      rating: 3.2,
      title: "Could be improved",
      text: "The product works, but there's room for improvement. It does its job, but the build quality feels a bit cheap.",
    },
    {
      id: 5,
      name: "Lisa G.",
      initials: "LG",
      avatarBg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      time: "3 weeks ago",
      rating: 3.0,
      title: "Not worth the price",
      text: "The product does the job, but I feel it's overpriced for what it offers. There are better options available at a similar price.",
    },
    {
      id: 6,
      name: "David L.",
      initials: "DL",
      avatarBg: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
      time: "1 month ago",
      rating: 5.0,
      title: "Highly functional and stylish",
      text: "This product is both functional and stylish. It fits perfectly with my needs, and I'm really impressed with the overall quality.",
    },
  ];

  return (
    <div className="space-y-8 w-full max-w-[90rem] mx-auto pb-16 px-4 sm:px-6 lg:px-8">
      {/* 1️⃣ TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Acme Prism T-Shirt
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm sm:text-base text-foreground font-medium">
            <span>
              Seller : <small className="text-muted-foreground">Poetic Fashion</small>
            </span>
            <span></span>
            <span>
              Published : <small className="text-muted-foreground">20 Oct, 2024</small>
            </span>
            <span></span>
            <span>
              SKU : <small className="text-muted-foreground">WH1000XM4</small>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/admin/products/PROD-1/edit">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition shadow-sm cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          </Link>
          <button
            type="button"
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-600 text-white hover:bg-red-700 transition shadow-sm cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2️⃣ MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ◀️ LEFT COLUMN: Compact Sticky Image Carousel */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 self-start space-y-3 z-20 max-w-[360px] w-full mx-auto lg:mx-0">
          {/* Main Compact Photo Card */}
          <div className="relative h-[320px] sm:h-[340px] w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 overflow-hidden flex items-center justify-center p-4 border border-border shadow-xs group">
            <div className="relative w-full h-full">
              <Image
                src={images[activeImageIdx]}
                alt="Product View"
                fill
                className="object-contain transition-all duration-300 group-hover:scale-105"
                priority
                sizes="(max-width: 1024px) 100vw, 340px"
              />
            </div>

            {/* Left Nav Arrow */}
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer z-30"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>

            {/* Right Nav Arrow */}
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer z-30"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* 4 Compact Thumbnails */}
          <div className="grid grid-cols-4 gap-2.5">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIdx(idx)}
                className={`relative h-18 sm:h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 p-1.5 overflow-hidden border transition-all cursor-pointer ${
                  activeImageIdx === idx
                    ? "border-2 border-primary ring-2 ring-primary/20 shadow-xs scale-102"
                    : "border-border hover:border-foreground/40 opacity-75 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ▶️ RIGHT COLUMN: Metric Cards, Details & Reviews */}
        <div className="lg:col-span-8 space-y-8">
          {/* Top 4 KPI Metric Cards (Vertical on mobile, side-by-side horizontal grid on desktop matching target screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Price */}
            <Card className="p-5 bg-card border-border shadow-xs bg-accent">
              <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium">
                <DollarSign className="h-4 w-4" />
                <span>Price</span>
              </div>
              <p className="mt-2.5 text-xl sm:text-2xl font-bold font-integral text-foreground">
                $120.40
              </p>
            </Card>

            {/* No. of Orders */}
            <Card className="p-5 bg-card border-border shadow-xs bg-accent">
              <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium">
                <Truck className="h-4 w-4" />
                <span>No. of Orders</span>
              </div>
              <p className="mt-2.5 text-xl sm:text-2xl font-bold font-integral text-foreground">
                250
              </p>
            </Card>

            {/* Available Stocks */}
            <Card className="p-5 bg-card border-border shadow-xs bg-accent">
              <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium">
                <Layers className="h-4 w-4" />
                <span>Available Stocks</span>
              </div>
              <p className="mt-2.5 text-xl sm:text-2xl font-bold font-integral text-foreground">
                2,550
              </p>
            </Card>

            {/* Total Revenue */}
            <Card className="p-5 bg-card border-border shadow-xs bg-accent">
              <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium">
                <Coins className="h-4 w-4" />
                <span>Total Revenue</span>
              </div>
              <p className="mt-2.5 text-xl sm:text-2xl font-bold font-integral text-foreground">
                $45,938
              </p>
            </Card>
          </div>

          {/* Product Description & Attributes Card */}
          <Card className="p-7 bg-card border-border shadow-xs space-y-7">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-7">
              {/* Left Column: Description & Features */}
              <div className="md:col-span-7 space-y-5">
                <div>
                  <h4 className="text-base font-bold text-foreground">Description:</h4>
                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed mt-2">
                    Tommy Hilfiger men striped pink sweatshirt. Crafted with cotton. Material composition is 100% organic cotton.
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-bold text-foreground">Key Features:</h4>
                  <ul className="mt-2.5 space-y-2 text-sm sm:text-base text-foreground/80 list-disc list-inside">
                    <li>Industry-leading noise cancellation</li>
                    <li>30-hour battery life</li>
                    <li>Touch sensor controls</li>
                    <li>Speak-to-chat technology</li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Attributes Table */}
              <div className="md:col-span-5">
                <div className="rounded-2xl border border-border overflow-hidden text-sm sm:text-base">
                  <div className="flex justify-between px-4 py-3 bg-muted/20 border-b border-border">
                    <span className="font-semibold text-foreground">Category</span>
                    <span className="text-muted-foreground">T-Shirt</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 border-b border-border">
                    <span className="font-semibold text-foreground">Brand</span>
                    <span className="text-muted-foreground">Tommy Hilfiger</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 bg-muted/20 border-b border-border">
                    <span className="font-semibold text-foreground">Color</span>
                    <span className="text-muted-foreground">Purple</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="font-semibold text-foreground">Weight</span>
                    <span className="text-muted-foreground">140 Gr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colors Selection */}
            <div className="space-y-3 pt-3 border-t border-border">
              <h4 className="text-base font-bold text-foreground">Colors:</h4>
              <div className="flex items-center gap-3.5">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={`h-9 w-9 rounded-full ${c.class} transition cursor-pointer ${
                      selectedColor === c.name
                        ? "ring-3 ring-offset-2 ring-primary scale-110 shadow-sm"
                        : "hover:scale-105 opacity-90"
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Sizes Selection */}
            <div className="space-y-3">
              <h5 className="text-base font-semibold text-foreground">Sizes:</h5>
              <div className="flex flex-wrap items-center gap-2.5">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`h-11 px-5 rounded-xl text-sm font-bold border transition cursor-pointer ${
                      selectedSize === s
                        ? "border-primary bg-accent text-foreground shadow-xs"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart & Wishlist Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm sm:text-base font-semibold hover:opacity-90 transition shadow-sm cursor-pointer"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-border bg-card text-foreground px-5 py-3 text-sm sm:text-base font-semibold hover:bg-muted transition cursor-pointer"
              >
                <Heart className="h-5 w-5 text-muted-foreground" />
                <span>Wishlist</span>
              </button>
            </div>
          </Card>

          {/* Reviews Section Card */}
          <Card className="p-7 bg-card border-border shadow-xs space-y-7">
            {/* Reviews Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">Reviews</h3>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 text-muted-foreground" />
                <span>Submit Review</span>
              </button>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-7 items-start">
              
              {/* 📊 Rating Summary Box (Now First) */}
              <div className="md:col-span-4 p-5 rounded-2xl border border-border bg-muted/20 space-y-5">
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                    <Star className="h-5 w-5 text-amber-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 font-medium">
                    4.3 (12 reviews)
                  </p>
                </div>

                {/* Stars Breakdown Bars */}
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-14 text-muted-foreground">5 stars</span>
                    <div className="h-2.5 flex-1 rounded-full bg-[#D4D4D8] dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-primary w-[70%]" />
                    </div>
                    <span className="w-9 text-right font-mono text-muted-foreground">70%</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="w-14 text-muted-foreground">4 stars</span>
                    <div className="h-2.5 flex-1 rounded-full bg-[#D4D4D8] dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-primary w-[17%]" />
                    </div>
                    <span className="w-9 text-right font-mono text-muted-foreground">17%</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="w-14 text-muted-foreground">3 stars</span>
                    <div className="h-2.5 flex-1 rounded-full bg-[#D4D4D8] dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-primary w-[7%]" />
                    </div>
                    <span className="w-9 text-right font-mono text-muted-foreground">7%</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="w-14 text-muted-foreground">2 stars</span>
                    <div className="h-2.5 flex-1 rounded-full bg-[#D4D4D8] dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-primary w-[4%]" />
                    </div>
                    <span className="w-9 text-right font-mono text-muted-foreground">4%</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="w-14 text-muted-foreground">1 star</span>
                    <div className="h-2.5 flex-1 rounded-full bg-[#D4D4D8] dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-primary w-[2%]" />
                    </div>
                    <span className="w-9 text-right font-mono text-muted-foreground">2%</span>
                  </div>
                </div>
              </div>

              {/* 📝 Reviews List (Now Second) */}
              <div className="md:col-span-8 space-y-5">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        {/* Dummy Initial Avatar */}
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-full font-bold text-sm shrink-0 ${rev.avatarBg}`}
                        >
                          {rev.initials}
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-bold text-foreground">
                            {rev.name}
                          </p>
                          <div className="flex items-center gap-1 text-amber-500 text-xs sm:text-sm font-semibold">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span>{rev.rating}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-xs text-muted-foreground font-medium">{rev.time}</span>
                    </div>

                    <h5 className="text-sm sm:text-base font-bold text-foreground">
                      {rev.title}
                    </h5>
                    <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                      {rev.text}
                    </p>
                  </div>
                ))}

                {/* Load More Button */}
                <div className="text-center pt-3">
                  <button
                    type="button"
                    className="px-6 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition cursor-pointer"
                  >
                    Load more..
                  </button>
                </div>
              </div>

            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Filter,
  User,
  ThumbsUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  customer: {
    id: string | null;
    name: string;
    email: string;
  };
  product: {
    id: string | null;
    name: string;
    slug: string;
    image: string;
    productAverageRating: number;
  };
}

interface ReviewsOverview {
  totalReviews: number;
  averageRating: number;
  verifiedCount: number;
  distribution: Record<number, number>;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [overview, setOverview] = useState<ReviewsOverview>({
    totalReviews: 0,
    averageRating: 0,
    verifiedCount: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [verifiedFilter, setVerifiedFilter] = useState(false);
  const [sortOption, setSortOption] = useState("newest");

  // Deletion state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchReviews = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (ratingFilter !== "ALL") params.set("rating", ratingFilter);
      if (verifiedFilter) params.set("verified", "true");
      if (sortOption !== "newest") params.set("sort", sortOption);

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setReviews(data.reviews || []);
        setOverview(
          data.overview || {
            totalReviews: 0,
            averageRating: 0,
            verifiedCount: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          }
        );
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [ratingFilter, verifiedFilter, sortOption]);

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    const targetId = reviewToDelete.id;
    setDeletingId(targetId);

    try {
      const res = await fetch(`/api/admin/reviews/${targetId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== targetId));
        setReviewToDelete(null);
        showToast("Review deleted and product rating updated!");
        fetchReviews(true);
      } else {
        alert(data.error || "Failed to delete review");
      }
    } catch (err) {
      console.error("Delete review error:", err);
      alert("An error occurred while deleting the review");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={13}
            className={`${
              star <= rating
                ? "text-amber-400 fill-amber-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
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
            Review Moderation & Feedback
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor customer ratings, verify genuine feedback, and moderate spam reviews
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchReviews(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Reviews"}</span>
          </button>
        </div>
      </div>

      {/* 1️⃣ Rating Metrics & Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Overall Store Rating */}
        <Card className="md:col-span-4 p-5 bg-card border-border shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Store Average Rating</span>
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-4xl font-bold font-sans text-foreground">
                {overview.averageRating}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">/ 5.0</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${
                      star <= Math.round(overview.averageRating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                ({overview.totalReviews} total reviews)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-emerald-600" />
              <span>
                <strong className="text-foreground">{overview.verifiedCount}</strong> Verified Purchases
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600">
              {overview.totalReviews > 0
                ? `${Math.round((overview.verifiedCount / overview.totalReviews) * 100)}% verified`
                : "100% verified"}
            </span>
          </div>
        </Card>

        {/* Star Rating Distribution Progress Bars */}
        <Card className="md:col-span-8 p-5 bg-card border-border shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">Rating Breakdown</span>
            <span className="text-[11px] text-muted-foreground">Click any bar to filter</span>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = overview.distribution[star] || 0;
              const pct = overview.totalReviews > 0 ? (count / overview.totalReviews) * 100 : 0;
              const isSelected = ratingFilter === String(star);

              return (
                <div
                  key={star}
                  onClick={() => setRatingFilter(isSelected ? "ALL" : String(star))}
                  className={`flex items-center gap-3 p-1.5 rounded-lg transition cursor-pointer ${
                    isSelected ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-1 w-14 shrink-0 text-xs font-semibold text-foreground">
                    <span>{star}</span>
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                  </div>

                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="w-16 text-right text-xs font-semibold text-muted-foreground shrink-0">
                    <span>{count} ({Math.round(pct)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 2️⃣ Search & Filter Toolbar */}
      <Card className="p-4 bg-card border-border shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search comments, reviewer name, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
            />
          </div>

          {/* Rating Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full h-9 rounded-xl bg-muted/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:border-ring cursor-pointer"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">★★★★★ (5 Stars)</option>
              <option value="4">★★★★☆ (4 Stars)</option>
              <option value="3">★★★☆☆ (3 Stars)</option>
              <option value="2">★★☆☆☆ (2 Stars)</option>
              <option value="1">★☆☆☆☆ (1 Star)</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full h-9 rounded-xl bg-muted/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:border-ring cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rating (5 → 1)</option>
              <option value="rating-low">Lowest Rating (1 → 5)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1">Quick Filter:</span>
            {[
              { label: "All Reviews", value: "ALL" },
              { label: "5 Stars ★★★★★", value: "5" },
              { label: "4 Stars ★★★★☆", value: "4" },
              { label: "3 Stars ★★★☆☆", value: "3" },
              { label: "Negative (≤ 2★)", value: "2" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setRatingFilter(tab.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  ratingFilter === tab.value
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold shadow-xs"
                    : "bg-muted/40 hover:bg-muted text-foreground border-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setVerifiedFilter(!verifiedFilter)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
              verifiedFilter
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-muted/40 hover:bg-muted text-foreground border-border"
            }`}
          >
            <ShieldCheck size={13} />
            <span>Verified Buyers Only</span>
          </button>
        </div>
      </Card>

      {/* 3️⃣ Reviews List */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="py-16 text-center text-muted-foreground bg-card border-border">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold text-foreground">No customer reviews match your criteria</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query or rating filter.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <Card
              key={rev.id}
              className="p-4 sm:p-5 bg-card border-border shadow-xs hover:border-black/20 transition rounded-2xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Customer Info & Review */}
                <div className="flex-1 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Star Rating */}
                    {renderStars(rev.rating)}

                    {/* Verified Buyer Badge */}
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 size={10} /> Verified Purchase
                      </span>
                    )}

                    <span className="text-[11px] text-muted-foreground">
                      {new Date(rev.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs sm:text-sm text-foreground font-medium whitespace-pre-line leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* Customer Identity */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <User size={13} className="text-muted-foreground" />
                    <span className="font-semibold text-foreground">{rev.customer.name}</span>
                    <span>({rev.customer.email})</span>
                  </div>
                </div>

                {/* Right: Product Thumbnail & Moderation Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                  {/* Product Tag */}
                  <Link
                    href={`/admin/products/${rev.product.id}`}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-muted/40 hover:bg-muted border border-border transition max-w-[220px]"
                  >
                    <div className="relative w-8 h-8 rounded-lg bg-muted overflow-hidden shrink-0 border border-border">
                      <Image src={rev.product.image} alt={rev.product.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{rev.product.name}</p>
                      <p className="text-[10px] text-muted-foreground">Avg: {rev.product.productAverageRating} ★</p>
                    </div>
                  </Link>

                  {/* Delete / Moderate Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReviewToDelete(rev)}
                    className="h-8 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <Trash2 size={13} className="mr-1.5" />
                    <span>Delete Review</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Review Deletion */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <Card className="w-full max-w-md bg-card border-border shadow-2xl rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Delete Customer Review?</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs space-y-1">
              <p className="font-bold text-foreground">{reviewToDelete.customer.name}</p>
              <p className="text-muted-foreground italic">&ldquo;{reviewToDelete.comment}&rdquo;</p>
              <p className="text-[11px] text-muted-foreground pt-1">
                Product: <strong className="text-foreground">{reviewToDelete.product.name}</strong>
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Deleting this review will remove it permanently and automatically recalculate the product&apos;s average rating.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewToDelete(null)}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={deletingId !== null}
                onClick={handleDeleteReview}
                className="rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                {deletingId ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

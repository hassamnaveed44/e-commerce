"use client";

import { useState, useMemo } from "react";
import { Star, SlidersHorizontal, ChevronDown, CheckCircle2, ChevronUp, Check } from "lucide-react";
import ReviewModal from "./ReviewModal";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { fullName: string | null };
}

interface TabsProps {
  product: {
    id: string;
    name: string;
    description: string;
    averageRating: number;
    category?: { name: string } | null;
    variants: { size: string; colorName: string; stockQuantity: number }[];
    reviews: ReviewItem[];
  };
}

type SortOption = "latest" | "oldest" | "highest" | "lowest";

export default function Tabs({ product }: TabsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "faqs">("reviews");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Strictly dynamic reviews from PostgreSQL
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(product.reviews || []);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);

  const handleNewReview = (newReview: ReviewItem) => {
    setReviewsList((prev) => [newReview, ...prev]);
  };

  // Compute filtered & sorted reviews dynamically
  const displayReviews = useMemo(() => {
    let list = [...reviewsList];

    // Filter by star rating
    if (filterStar !== null) {
      list = list.filter((r) => Math.floor(r.rating) === filterStar);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "highest") {
        return b.rating - a.rating;
      }
      if (sortBy === "lowest") {
        return a.rating - b.rating;
      }
      return 0;
    });

    return list;
  }, [reviewsList, filterStar, sortBy]);

  const sortLabels: Record<SortOption, string> = {
    latest: "Latest",
    oldest: "Oldest",
    highest: "Highest Rating",
    lowest: "Lowest Rating",
  };

  const faqs = [
    {
      q: "What material is this product made of?",
      a: "This garment is crafted from 100% premium combed cotton with durable double-stitched hems for exceptional breathability and everyday comfort.",
    },
    {
      q: "How do I choose the correct size?",
      a: "Our sizing follows standard regular fits. If you prefer a relaxed or streetwear oversized look, we recommend choosing one size up.",
    },
    {
      q: "What is the estimated delivery time and shipping cost?",
      a: "Standard delivery takes 2 to 4 business days. Free shipping applies to all orders over $50 across the nation.",
    },
    {
      q: "What is your return & exchange policy?",
      a: "We offer a hassle-free 30-day return and exchange policy on all unworn items with original tags intact.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 mt-12 sm:mt-16 mb-6 sm:mb-8 font-satoshi">
      {/* Tab Navigation */}
      <div className="w-full border-b border-black/10 mb-8">
        <div className="grid grid-cols-3 text-center text-sm sm:text-base lg:text-lg">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`pb-4 sm:pb-5 transition-colors relative cursor-pointer ${
              activeTab === "details" ? "text-black font-semibold" : "text-black/60 hover:text-black"
            }`}
          >
            Product Details
            {activeTab === "details" && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 sm:pb-5 transition-colors relative cursor-pointer ${
              activeTab === "reviews" ? "text-black font-semibold" : "text-black/60 hover:text-black"
            }`}
          >
            Rating & Reviews ({reviewsList.length})
            {activeTab === "reviews" && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("faqs")}
            className={`pb-4 sm:pb-5 transition-colors relative cursor-pointer ${
              activeTab === "faqs" ? "text-black font-semibold" : "text-black/60 hover:text-black"
            }`}
          >
            FAQs
            {activeTab === "faqs" && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCT DETAILS */}
      {activeTab === "details" && (
        <div className="bg-[#F9F9F9] rounded-[20px] p-6 sm:p-8 border border-black/10">
          <h3 className="text-xl font-bold text-black mb-4">Product Specifications</h3>
          <p className="text-black/70 mb-6 leading-relaxed">{product.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-white rounded-xl border border-black/5">
              <span className="font-semibold text-black">Category:</span>{" "}
              <span className="text-black/70 capitalize">{product.category?.name || "General"}</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-black/5">
              <span className="font-semibold text-black">Available Sizes:</span>{" "}
              <span className="text-black/70">
                {Array.from(new Set(product.variants.map((v) => v.size))).join(", ") || "Standard"}
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-black/5">
              <span className="font-semibold text-black">Material:</span>{" "}
              <span className="text-black/70">100% Breathable Cotton</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-black/5">
              <span className="font-semibold text-black">Care:</span>{" "}
              <span className="text-black/70">Machine wash cold, tumble dry low</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RATING & REVIEWS */}
      {activeTab === "reviews" && (
        <div>
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-black flex items-center gap-1.5">
              All Reviews{" "}
              <span className="text-sm sm:text-base font-normal text-black/60">
                ({displayReviews.length})
              </span>
            </h2>

            <div className="flex items-center gap-2.5 sm:gap-3 relative">
              {/* Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}
                className={`p-2.5 sm:p-3 rounded-full transition-colors cursor-pointer ${
                  isFilterBarOpen || filterStar !== null
                    ? "bg-black text-white"
                    : "bg-[#F0F0F0] text-black hover:bg-black/10"
                }`}
                title="Filter by rating"
              >
                <SlidersHorizontal size={18} />
              </button>

              {/* Sort Dropdown Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="bg-[#F0F0F0] px-4 py-3 rounded-full text-sm font-medium text-black flex items-center gap-2 hover:bg-black/10 transition-colors cursor-pointer"
                >
                  {sortLabels[sortBy]} <ChevronDown size={16} />
                </button>

                {isSortDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-black/10 py-2 z-20">
                    {(Object.keys(sortLabels) as SortOption[]).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSortBy(opt);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-[#F0F0F0] cursor-pointer ${
                          sortBy === opt ? "font-bold text-black" : "text-black/70"
                        }`}
                      >
                        {sortLabels[opt]}
                        {sortBy === opt && <Check size={14} className="text-black" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Write Review Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-black text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium hover:bg-black/80 transition-colors cursor-pointer whitespace-nowrap"
              >
                Write a Review
              </button>
            </div>
          </div>

          {/* Star Filter Pill Bar */}
          {isFilterBarOpen && (
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              <span className="text-xs font-semibold text-black/60 uppercase mr-1">Rating:</span>
              <button
                type="button"
                onClick={() => setFilterStar(null)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  filterStar === null
                    ? "bg-black text-white"
                    : "bg-[#F0F0F0] text-black/70 hover:bg-black/10"
                }`}
              >
                All Ratings
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFilterStar(filterStar === star ? null : star)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                    filterStar === star
                      ? "bg-black text-white"
                      : "bg-[#F0F0F0] text-black/70 hover:bg-black/10"
                  }`}
                >
                  <span>{star}</span>
                  <Star size={12} className={filterStar === star ? "fill-white" : "fill-[#FFC633] text-[#FFC633]"} />
                </button>
              ))}
            </div>
          )}

          {/* Reviews Grid / Empty State */}
          {displayReviews.length === 0 ? (
            <div className="text-center py-12 border border-black/10 rounded-[20px] bg-white">
              <p className="text-black/60 mb-3">
                {filterStar !== null
                  ? `No ${filterStar}-star reviews found.`
                  : "No reviews yet for this product."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilterStar(null);
                  setIsModalOpen(true);
                }}
                className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-black/80 cursor-pointer"
              >
                Be the first to review!
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-10">
              {displayReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-black/10 rounded-[20px] p-6 sm:p-8 flex flex-col justify-between bg-white"
                >
                  <div>
                    <div className="flex items-center text-[#FFC633] mb-3.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={18}
                          fill={i < review.rating ? "currentColor" : "#E4E4E7"}
                          className={i < review.rating ? "text-[#FFC633]" : "text-[#E4E4E7]"}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="font-bold text-base sm:text-lg text-black">
                        {review.user?.fullName || "Verified Buyer"}
                      </span>
                      <CheckCircle2 size={16} className="text-[#01AB31] fill-[#01AB31]" />
                    </div>
                    <p className="text-black/60 text-sm leading-relaxed mb-5">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  </div>
                  <span className="text-black/60 text-xs sm:text-sm font-medium">
                    Posted on {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          )}

          <ReviewModal
            productId={product.id}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleNewReview}
          />
        </div>
      )}

      {/* TAB 3: FAQs */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-black/10 rounded-[16px] overflow-hidden bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-base sm:text-lg text-black hover:bg-black/[0.02] cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openFaq === index && (
                <div className="px-6 pb-5 text-sm sm:text-base text-black/70 leading-relaxed border-t border-black/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

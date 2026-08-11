"use client";

import { useState } from "react";

export default function Tabs() {
  const [activeTab, setActiveTab] = useState("reviews");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 mt-12 sm:mt-16 mb-6 sm:mb-8">
      {/* Border & Tabs constrained to match Reviews Section width */}
      <div className="w-full border-b border-black/10">
        <div className="grid grid-cols-3 text-center font-satoshi text-sm sm:text-base lg:text-lg">
          {/* Tab 1: Product Details */}
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`pb-4 sm:pb-5 transition-colors relative cursor-pointer ${
              activeTab === "details"
                ? "text-black font-medium"
                : "text-black/60 hover:text-black"
            }`}
          >
            Product Details
            {activeTab === "details" && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
            )}
          </button>

          {/* Tab 2: Rating & Reviews */}
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 sm:pb-5 transition-colors relative cursor-pointer ${
              activeTab === "reviews"
                ? "text-black font-medium"
                : "text-black/60 hover:text-black"
            }`}
          >
            Rating & Reviews
            {activeTab === "reviews" && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
            )}
          </button>

          {/* Tab 3: FAQs */}
          <button
            type="button"
            onClick={() => setActiveTab("faqs")}
            className={`pb-4 sm:pb-5 transition-colors relative cursor-pointer ${
              activeTab === "faqs"
                ? "text-black font-medium"
                : "text-black/60 hover:text-black"
            }`}
          >
            FAQs
            {activeTab === "faqs" && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

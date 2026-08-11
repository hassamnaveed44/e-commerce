"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Pagination() {
  const [currentPage, setCurrentPage] = useState(1);

  // Desktop shows 1, 2, 3 ... 8, 9, 10; on mobile 3 and 8 are hidden to fit cleanly
  const pageItems = [1, 2, 3, "...", 8, 9, 10];

  return (
    <div className="w-full pt-6 pb-12 font-satoshi">
      {/* Top Divider Line */}
      <hr className="border-t border-black/10 mb-6" />

      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {/* Previous Button (Satoshi Medium 14px, #000000, 20px line-height) */}
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-black/10 text-black text-xs sm:text-sm font-medium leading-[20px] hover:bg-black/5 transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft size={16} />
          <span>Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {pageItems.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-7 sm:w-9 h-8 sm:h-9 flex items-center justify-center text-black/40 text-xs sm:text-sm font-medium select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = currentPage === pageNum;

            // Hide 3 and 8 on mobile so it perfectly fits 1 2 ... 9 10 like Screenshot 4
            const isDesktopOnly = pageNum === 3 || pageNum === 8;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 sm:w-9 h-8 sm:h-9 rounded-lg text-xs sm:text-sm font-medium leading-[20px] transition-colors items-center justify-center cursor-pointer ${
                  isDesktopOnly ? "hidden sm:flex" : "flex"
                } ${
                  isActive
                    ? "bg-[#F0F0F0] text-black font-bold"
                    : "text-black/50 hover:bg-black/5 hover:text-black"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button (Satoshi Medium 14px, #000000, 20px line-height) */}
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, 10))}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-black/10 text-black text-xs sm:text-sm font-medium leading-[20px] hover:bg-black/5 transition-colors cursor-pointer shrink-0"
        >
          <span>Next</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

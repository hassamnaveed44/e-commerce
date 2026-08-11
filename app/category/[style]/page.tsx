"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import Breadcrumb from "@/app/components/category/Breadcrumb";
import FiltersSidebar from "@/app/components/category/FiltersSidebar";

export default function CategoryPage() {
  const params = useParams();
  const category = params?.category as string;
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const formattedCategory = category 
    ? category.charAt(0).toUpperCase() + category.slice(1) 
    : "Category";

  return (
    <main className="min-h-screen bg-white">
      {/* Category Breadcrumb */}
      <Breadcrumb categoryName={formattedCategory} />

      {/* Main Category Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4">
        {/* Mobile Filter Header Trigger */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h1 className="text-2xl font-bold font-satoshi capitalize text-black">
            {formattedCategory}
          </h1>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="bg-[#F0F0F0] p-3 rounded-full flex items-center justify-center text-black hover:bg-black/10 transition-colors"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Filters Sidebar (Passes props to handle mobile toggle) */}
          <FiltersSidebar 
            isOpen={isFilterOpen} 
            onClose={() => setIsFilterOpen(false)} 
          />

          {/* Product Grid Area */}
          <div className="flex-1 w-full">
            <h1 className="hidden lg:block text-3xl font-bold font-satoshi mb-6 capitalize text-black">
              {formattedCategory}
            </h1>
            <p className="text-black/60 font-satoshi">
              Product grid and pagination will be assembled here component by component.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
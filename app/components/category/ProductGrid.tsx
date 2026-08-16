"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Star, ChevronDown, SlidersHorizontal, PackageX, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface CategoryProductItem {
  id: string;
  name: string;
  slug?: string;
  images: { url: string }[];
  price: number | string | { toString(): string };
  originalPrice?: number | string | { toString(): string } | null;
  discountPercent?: number;
  averageRating: number;
}

interface ProductGridProps {
  categoryName: string;
  products: CategoryProductItem[];
  totalCount: number;
}

const sortOptions = [
  { label: "Most Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
];

export default function ProductGrid({
  categoryName,
  products,
  totalCount,
}: ProductGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSortValue = searchParams.get("sort") || "popular";
  const currentSortOption =
    sortOptions.find((opt) => opt.value === currentSortValue) || sortOptions[0];

  const currentSlug = categoryName.toLowerCase();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sortValue);
    params.delete("page");
    setSortDropdownOpen(false);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="flex-1 w-full font-satoshi">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 mb-5 sm:mb-6">
        <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <h1 className="text-2xl sm:text-3xl font-bold capitalize text-black font-integral leading-none">
            {categoryName}
          </h1>
          <span className="text-xs sm:text-sm text-black/60 font-satoshi whitespace-nowrap">
            {products.length > 0
              ? `Showing 1-${products.length} of ${totalCount || products.length} Products`
              : "0 Products found"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop Sort Dropdown */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            <div className="flex items-center gap-1.5 text-sm text-black">
              <span className="text-black/60">Sort by:</span>
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="font-semibold flex items-center gap-1 cursor-pointer hover:text-black/70 transition-colors"
              >
                {currentSortOption.label} <ChevronDown size={14} />
              </button>
            </div>

            {sortDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-black/10 py-1.5 z-40">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSortChange(opt.value)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                      currentSortValue === opt.value
                        ? "bg-black/5 font-bold text-black"
                        : "text-black/70 hover:bg-black/5 hover:text-black"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Filter Button */}
          <Link
            href={`/category/${currentSlug}/filters${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
            className="bg-[#F0F0F0] p-2.5 rounded-full flex items-center justify-center text-black hover:bg-black/10 transition-colors lg:hidden shrink-0 cursor-pointer"
            aria-label="Open filters page"
          >
            <SlidersHorizontal size={18} />
          </Link>
        </div>
      </div>

      {/* Empty State when 0 products in stock */}
      {products.length === 0 ? (
        <div className="bg-[#F9F9F9] rounded-[24px] border border-black/5 p-8 sm:p-14 text-center my-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/5 flex items-center justify-center text-black/40 mb-4 sm:mb-6">
            <PackageX size={36} className="text-black/50 stroke-[1.5]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-black font-integral mb-2.5">
            No {categoryName.toLowerCase() === "hoodie" || categoryName.toLowerCase() === "hoodies" ? "Hoodie" : categoryName} in Stock
          </h2>

          <p className="text-sm sm:text-base text-black/60 max-w-md mb-6 leading-relaxed">
            {categoryName.toLowerCase().includes("hoodie")
              ? "We currently don't have any hoodies in stock. Check back soon for our upcoming collection or explore other categories!"
              : "We couldn't find any products matching your selected criteria. Try adjusting or clearing your filters."}
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={handleClearFilters}
              className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-black/80 transition-colors cursor-pointer flex items-center gap-2"
            >
              <RotateCcw size={15} />
              Clear Filters
            </button>
            <Link
              href="/category/casual"
              className="bg-white border border-black/15 text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-black/5 transition-colors cursor-pointer"
            >
              Explore All Styles
            </Link>
          </div>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {products.map((product) => {
            const image = product.images?.[0]?.url || "/images/product-1.png";
            const price = Number(product.price);
            const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;

            return (
              <Link
                key={product.id}
                href={`/shop/product/${product.slug || product.id}`}
                className="group flex flex-col"
              >
                <div className="bg-[#F0EEED] rounded-[20px] aspect-square relative overflow-hidden mb-3 sm:mb-4 flex items-center justify-center p-4">
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition duration-300"
                  />
                </div>

                <h3 className="font-satoshi font-bold text-sm sm:text-lg text-black mb-1 sm:mb-2 truncate">
                  {product.name}
                </h3>

                <div className="flex items-center space-x-1.5 mb-1 sm:mb-2">
                  <div className="flex text-[#FFC633]">
                    {Array.from({ length: Math.floor(product.averageRating) }, (_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-satoshi text-black font-medium">
                    {product.averageRating.toFixed(1)}/
                    <span className="text-black/60">5</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3 font-satoshi flex-wrap">
                  <span className="text-base sm:text-xl font-bold text-black">
                    ${price}
                  </span>
                  {originalPrice && (
                    <span className="text-base sm:text-xl font-bold text-black/40 line-through">
                      ${originalPrice}
                    </span>
                  )}
                  {product.discountPercent !== undefined && product.discountPercent > 0 ? (
                    <span className="bg-[#FF3333]/10 text-[#FF3333] text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full">
                      -{product.discountPercent}%
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

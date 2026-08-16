"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { ChevronRight, ChevronUp, SlidersHorizontal, Check, RotateCcw } from "lucide-react";

const categories = ["T-shirts", "Shorts", "Shirts", "Hoodie", "Jeans"];

const colors = [
  { name: "Green", hex: "#00C12B" },
  { name: "Red", hex: "#F50606" },
  { name: "Yellow", hex: "#F5DD06" },
  { name: "Orange", hex: "#F57906" },
  { name: "Cyan", hex: "#06CAF5" },
  { name: "Blue", hex: "#063AF5" },
  { name: "Purple", hex: "#7D06F5" },
  { name: "Magenta", hex: "#F506B7" },
  { name: "White", hex: "#FFFFFF", border: true },
  { name: "Black", hex: "#000000" },
];

const sizes = [
  "XX-Small",
  "X-Small",
  "Small",
  "Medium",
  "Large",
  "X-Large",
  "XX-Large",
  "3X-Large",
  "4X-Large",
];

const dressStyles = ["Casual", "Formal", "Party", "Gym"];

export default function FiltersSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const currentParamStyle = (params?.style as string)?.toLowerCase();

  // Extract values from URL
  const queryCategory = searchParams.get("category");
  const queryMinPrice = searchParams.get("minPrice");
  const queryMaxPrice = searchParams.get("maxPrice");
  const queryColor = searchParams.get("color");
  const querySize = searchParams.get("size");

  // Determine initial category
  const initialCategory = queryCategory
    ? categories.find(
        (c) =>
          c.toLowerCase() === queryCategory.toLowerCase() ||
          c.toLowerCase() + "s" === queryCategory.toLowerCase() ||
          c.toLowerCase() === queryCategory.toLowerCase() + "s"
      ) || queryCategory
    : categories.find(
        (c) =>
          c.toLowerCase() === currentParamStyle ||
          c.toLowerCase() + "s" === currentParamStyle ||
          c.toLowerCase() === currentParamStyle + "s"
      ) || null;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [priceRange, setPriceRange] = useState({
    min: queryMinPrice !== null ? Number(queryMinPrice) : 0,
    max: queryMaxPrice !== null ? Number(queryMaxPrice) : 250,
  });
  const [selectedColor, setSelectedColor] = useState<string | null>(queryColor || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(querySize || null);
  const [selectedDressStyle, setSelectedDressStyle] = useState<string | null>(
    dressStyles.find((d) => d.toLowerCase() === currentParamStyle) || "Casual"
  );

  const [priceOpen, setPriceOpen] = useState(true);
  const [colorsOpen, setColorsOpen] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(true);
  const [dressStyleOpen, setDressStyleOpen] = useState(true);

  // Sync state when URL search params change
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      const match = categories.find(
        (c) =>
          c.toLowerCase() === cat.toLowerCase() ||
          c.toLowerCase() + "s" === cat.toLowerCase() ||
          c.toLowerCase() === cat.toLowerCase() + "s"
      );
      setSelectedCategory(match || cat);
    } else {
      const match = categories.find(
        (c) =>
          c.toLowerCase() === currentParamStyle ||
          c.toLowerCase() + "s" === currentParamStyle ||
          c.toLowerCase() === currentParamStyle + "s"
      );
      setSelectedCategory(match || null);
    }

    if (searchParams.get("minPrice") !== null) {
      setPriceRange((prev) => ({ ...prev, min: Number(searchParams.get("minPrice")) }));
    }
    if (searchParams.get("maxPrice") !== null) {
      setPriceRange((prev) => ({ ...prev, max: Number(searchParams.get("maxPrice")) }));
    }
    setSelectedColor(searchParams.get("color") || null);
    setSelectedSize(searchParams.get("size") || null);
  }, [searchParams, currentParamStyle]);

  const MIN_LIMIT = 0;
  const MAX_LIMIT = 250;
  const minPercentage = ((priceRange.min - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100;
  const maxPercentage = ((priceRange.max - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100;

  // Apply filters to URL
  const pushFilters = (override?: {
    category?: string | null;
    minPrice?: number;
    maxPrice?: number;
    color?: string | null;
    size?: string | null;
  }) => {
    const nextCategory = override?.category !== undefined ? override.category : selectedCategory;
    const nextMin = override?.minPrice !== undefined ? override.minPrice : priceRange.min;
    const nextMax = override?.maxPrice !== undefined ? override.maxPrice : priceRange.max;
    const nextColor = override?.color !== undefined ? override.color : selectedColor;
    const nextSize = override?.size !== undefined ? override.size : selectedSize;

    const newParams = new URLSearchParams(searchParams.toString());

    if (nextCategory) {
      newParams.set("category", nextCategory.toLowerCase());
    } else {
      newParams.delete("category");
    }

    if (nextMin > 0) {
      newParams.set("minPrice", nextMin.toString());
    } else {
      newParams.delete("minPrice");
    }

    if (nextMax < MAX_LIMIT) {
      newParams.set("maxPrice", nextMax.toString());
    } else {
      newParams.delete("maxPrice");
    }

    if (nextColor) {
      newParams.set("color", nextColor);
    } else {
      newParams.delete("color");
    }

    if (nextSize) {
      newParams.set("size", nextSize);
    } else {
      newParams.delete("size");
    }

    // Reset pagination to page 1 on filter update
    newParams.delete("page");

    startTransition(() => {
      const queryString = newParams.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
    });
  };

  const handleCategoryClick = (cat: string) => {
    const isCurrentlySelected =
      selectedCategory?.toLowerCase() === cat.toLowerCase() ||
      selectedCategory?.toLowerCase() + "s" === cat.toLowerCase() ||
      selectedCategory?.toLowerCase() === cat.toLowerCase() + "s";

    const newCat = isCurrentlySelected ? null : cat;
    setSelectedCategory(newCat);
    pushFilters({ category: newCat });
  };

  const handleDressStyleClick = (styleItem: string) => {
    setSelectedDressStyle(styleItem);
    startTransition(() => {
      router.push(`/category/${styleItem.toLowerCase()}`, { scroll: false });
    });
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setPriceRange({ min: 0, max: 250 });
    setSelectedColor(null);
    setSelectedSize(null);
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    priceRange.min > 0 ||
    priceRange.max < 250 ||
    Boolean(selectedColor) ||
    Boolean(selectedSize);

  return (
    <aside className="hidden lg:block w-[295px] bg-white p-6 rounded-[20px] border border-black/10 shrink-0 font-satoshi">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-black/10 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-black font-integral">Filters</h2>
          {isPending && (
            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
          )}
        </div>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-black/60 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        ) : (
          <SlidersHorizontal size={18} className="text-black/40" />
        )}
      </div>

      {/* Categories List */}
      <div className="flex flex-col space-y-3.5 pb-6 border-b border-black/10 text-base">
        {categories.map((cat) => {
          const isSelected =
            selectedCategory?.toLowerCase() === cat.toLowerCase() ||
            selectedCategory?.toLowerCase() + "s" === cat.toLowerCase() ||
            selectedCategory?.toLowerCase() === cat.toLowerCase() + "s";

          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`flex items-center justify-between transition-colors text-left cursor-pointer group ${
                isSelected ? "text-black font-bold" : "text-black/60 hover:text-black"
              }`}
            >
              <span className="group-hover:translate-x-0.5 transition-transform">{cat}</span>
              <ChevronRight
                size={16}
                className={isSelected ? "text-black" : "text-black/40 group-hover:text-black"}
              />
            </button>
          );
        })}
      </div>

      {/* Price Section (Starts from $0) */}
      <div className="py-6 border-b border-black/10">
        <button
          type="button"
          onClick={() => setPriceOpen(!priceOpen)}
          className="w-full flex items-center justify-between mb-4 cursor-pointer"
        >
          <span className="font-bold text-lg text-black">Price</span>
          <ChevronUp
            size={18}
            className={`text-black transition-transform duration-200 ${
              priceOpen ? "" : "rotate-180"
            }`}
          />
        </button>

        {priceOpen && (
          <div className="pt-2 px-1">
            <div className="relative w-full h-6 flex items-center">
              <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full absolute" />
              <div
                className="h-1.5 bg-black absolute rounded-full"
                style={{
                  left: `${minPercentage}%`,
                  width: `${Math.max(0, maxPercentage - minPercentage)}%`,
                }}
              />
              <input
                type="range"
                min={MIN_LIMIT}
                max={MAX_LIMIT}
                value={priceRange.min}
                onChange={(e) => {
                  const value = Math.min(Number(e.target.value), priceRange.max - 10);
                  setPriceRange((prev) => ({ ...prev, min: value }));
                }}
                className="absolute w-full h-1.5 opacity-0 cursor-pointer pointer-events-auto z-30"
              />
              <input
                type="range"
                min={MIN_LIMIT}
                max={MAX_LIMIT}
                value={priceRange.max}
                onChange={(e) => {
                  const value = Math.max(Number(e.target.value), priceRange.min + 10);
                  setPriceRange((prev) => ({ ...prev, max: value }));
                }}
                className="absolute w-full h-1.5 opacity-0 cursor-pointer pointer-events-auto z-30"
              />
              <div
                className="w-5 h-5 bg-black rounded-full absolute -ml-2.5 z-20 pointer-events-none shadow-sm"
                style={{ left: `${minPercentage}%` }}
              />
              <div
                className="w-5 h-5 bg-black rounded-full absolute -ml-2.5 z-20 pointer-events-none shadow-sm"
                style={{ left: `${maxPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm font-semibold text-black mt-2.5 select-none">
              <span>${priceRange.min}</span>
              <span>${priceRange.max}</span>
            </div>
          </div>
        )}
      </div>

      {/* Colors Section */}
      <div className="py-6 border-b border-black/10">
        <button
          type="button"
          onClick={() => setColorsOpen(!colorsOpen)}
          className="w-full flex items-center justify-between mb-4 cursor-pointer"
        >
          <span className="font-bold text-lg text-black">Colors</span>
          <ChevronUp
            size={18}
            className={`text-black transition-transform duration-200 ${
              colorsOpen ? "" : "rotate-180"
            }`}
          />
        </button>

        {colorsOpen && (
          <div className="grid grid-cols-5 gap-3.5 pt-1">
            {colors.map((color) => {
              const isSelected = selectedColor === color.hex || selectedColor === color.name;
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => {
                    const newColor = isSelected ? null : color.hex;
                    setSelectedColor(newColor);
                  }}
                  style={{ backgroundColor: color.hex }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${
                    color.border ? "border border-black/20" : ""
                  }`}
                  aria-label={`Select color ${color.name}`}
                >
                  {isSelected && (
                    <Check
                      size={16}
                      className={`${
                        color.hex === "#FFFFFF" ? "text-black" : "text-white"
                      } stroke-[3]`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Size Section */}
      <div className="py-6 border-b border-black/10">
        <button
          type="button"
          onClick={() => setSizeOpen(!sizeOpen)}
          className="w-full flex items-center justify-between mb-4 cursor-pointer"
        >
          <span className="font-bold text-lg text-black">Size</span>
          <ChevronUp
            size={18}
            className={`text-black transition-transform duration-200 ${
              sizeOpen ? "" : "rotate-180"
            }`}
          />
        </button>

        {sizeOpen && (
          <div className="flex flex-wrap gap-2 pt-1">
            {sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setSelectedSize(isSelected ? null : size);
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-black text-white"
                      : "bg-[#F0F0F0] text-black/60 hover:bg-black/10"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Dress Style Section */}
      <div className="py-6 font-satoshi">
        <button
          type="button"
          onClick={() => setDressStyleOpen(!dressStyleOpen)}
          className="w-full flex items-center justify-between mb-4 cursor-pointer"
        >
          <span className="font-bold text-lg text-black">Dress Style</span>
          <ChevronUp
            size={18}
            className={`text-black transition-transform duration-200 ${
              dressStyleOpen ? "" : "rotate-180"
            }`}
          />
        </button>

        {dressStyleOpen && (
          <div className="flex flex-col space-y-3.5 pt-1 text-base">
            {dressStyles.map((styleItem) => {
              const isSelected =
                selectedDressStyle?.toLowerCase() === styleItem.toLowerCase() ||
                currentParamStyle === styleItem.toLowerCase();

              return (
                <button
                  key={styleItem}
                  type="button"
                  onClick={() => handleDressStyleClick(styleItem)}
                  className={`w-full flex items-center justify-between transition-colors text-left cursor-pointer ${
                    isSelected ? "text-black font-bold" : "text-black/60 hover:text-black"
                  }`}
                >
                  <span>{styleItem}</span>
                  <ChevronRight
                    size={16}
                    className={isSelected ? "text-black" : "text-black/40"}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Filter Button */}
      <button
        type="button"
        onClick={() => pushFilters()}
        className="w-full bg-black text-white rounded-full py-4 font-medium hover:bg-black/80 transition-colors text-center text-base mt-4 font-satoshi cursor-pointer shadow-sm active:scale-[0.99]"
      >
        Apply Filter
      </button>
    </aside>
  );
}

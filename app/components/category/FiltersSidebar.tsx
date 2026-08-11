"use client";

import { useState } from "react";
import { ChevronRight, ChevronUp, SlidersHorizontal, Check } from "lucide-react";

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>("T-shirts");
  const [priceRange, setPriceRange] = useState({ min: 50, max: 200 });
  const [selectedColor, setSelectedColor] = useState<string | null>("#063AF5");
  const [selectedSize, setSelectedSize] = useState<string | null>("Large");
  const [selectedDressStyle, setSelectedDressStyle] = useState<string | null>("Casual");

  const [priceOpen, setPriceOpen] = useState(true);
  const [colorsOpen, setColorsOpen] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(true);
  const [dressStyleOpen, setDressStyleOpen] = useState(true);

  const MIN_LIMIT = 0;
  const MAX_LIMIT = 250;
  const minPercentage = ((priceRange.min - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100;
  const maxPercentage = ((priceRange.max - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100;

  return (
    <aside className="hidden lg:block w-[295px] bg-white p-6 rounded-[20px] border border-black/10 shrink-0 font-satoshi">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-black/10 mb-6">
        <h2 className="text-xl font-bold text-black font-integral">Filters</h2>
        <SlidersHorizontal size={18} className="text-black/40" />
      </div>

      {/* Categories List */}
      <div className="flex flex-col space-y-3.5 pb-6 border-b border-black/10 text-base">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`flex items-center justify-between transition-colors text-left cursor-pointer ${
              selectedCategory === cat ? "text-black font-bold" : "text-black/60 hover:text-black"
            }`}
          >
            <span>{cat}</span>
            <ChevronRight size={16} className={selectedCategory === cat ? "text-black" : "text-black/40"} />
          </button>
        ))}
      </div>

      {/* Price Section */}
      <div className="py-6 border-b border-black/10">
        <button
          type="button"
          onClick={() => setPriceOpen(!priceOpen)}
          className="w-full flex items-center justify-between mb-4 cursor-pointer"
        >
          <span className="font-bold text-lg text-black">Price</span>
          <ChevronUp size={18} className={`text-black transition-transform duration-200 ${priceOpen ? "" : "rotate-180"}`} />
        </button>

        {priceOpen && (
          <div className="pt-2 px-1">
            <div className="relative w-full h-6 flex items-center">
              <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full absolute" />
              <div
                className="h-1.5 bg-black absolute rounded-full"
                style={{
                  left: `${minPercentage}%`,
                  width: `${maxPercentage - minPercentage}%`,
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
          <ChevronUp size={18} className={`text-black transition-transform duration-200 ${colorsOpen ? "" : "rotate-180"}`} />
        </button>

        {colorsOpen && (
          <div className="grid grid-cols-5 gap-3.5 pt-1">
            {colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(selectedColor === color.hex ? null : color.hex)}
                style={{ backgroundColor: color.hex }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${
                  color.border ? "border border-black/20" : ""
                }`}
                aria-label={`Select color ${color.name}`}
              >
                {selectedColor === color.hex && (
                  <Check
                    size={16}
                    className={`${color.hex === "#FFFFFF" ? "text-black" : "text-white"} stroke-[3]`}
                  />
                )}
              </button>
            ))}
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
          <ChevronUp size={18} className={`text-black transition-transform duration-200 ${sizeOpen ? "" : "rotate-180"}`} />
        </button>

        {sizeOpen && (
          <div className="flex flex-wrap gap-2 pt-1">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  selectedSize === size
                    ? "bg-black text-white"
                    : "bg-[#F0F0F0] text-black/60 hover:bg-black/10"
                }`}
              >
                {size}
              </button>
            ))}
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
          <ChevronUp size={18} className={`text-black transition-transform duration-200 ${dressStyleOpen ? "" : "rotate-180"}`} />
        </button>

        {dressStyleOpen && (
          <div className="flex flex-col space-y-3.5 pt-1 text-base">
            {dressStyles.map((styleItem) => (
              <button
                key={styleItem}
                type="button"
                onClick={() => setSelectedDressStyle(selectedDressStyle === styleItem ? null : styleItem)}
                className={`w-full flex items-center justify-between transition-colors text-left cursor-pointer ${
                  selectedDressStyle === styleItem ? "text-black font-bold" : "text-black/60 hover:text-black"
                }`}
              >
                <span>{styleItem}</span>
                <ChevronRight size={16} className={selectedDressStyle === styleItem ? "text-black" : "text-black/40"} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Apply Filter Button */}
      <button 
        type="button"
        className="w-full bg-black text-white rounded-full py-4 font-medium hover:bg-black/80 transition-colors text-center text-base mt-4 font-satoshi cursor-pointer shadow-sm"
      >
        Apply Filter
      </button>
    </aside>
  );
}

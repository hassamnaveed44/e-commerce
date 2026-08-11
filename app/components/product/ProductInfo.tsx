"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Check, Plus, Minus } from "lucide-react";

const colors = [
  { name: "Olive", hex: "#4F4631" },
  { name: "Forest Green", hex: "#314F4A" },
  { name: "Navy Blue", hex: "#31344F" },
];

const sizes = ["Small", "Medium", "Large", "X-Large"];

export default function ProductInfo() {
  const [selectedColor, setSelectedColor] = useState(colors[0].hex);
  const [selectedSize, setSelectedSize] = useState("Large");
  const [quantity, setQuantity] = useState(1);

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="flex flex-col justify-between h-full w-full font-satoshi">
      {/* Top Details Section */}
      <div>
        {/* Product Title - Scaled so it fits on one single line on desktop */}
        <h1 className="text-2xl sm:text-3xl lg:text-[30px] xl:text-[36px] 2xl:text-[40px] font-extrabold uppercase tracking-tight text-black font-integral leading-tight mb-2.5">
          ONE LIFE GRAPHIC T-SHIRT
        </h1>

        {/* Ratings */}
        <div className="flex items-center space-x-2 mb-2.5">
          <div className="flex text-[#FFC633]">
            {[...Array(4)].map((_, i) => (
              <Star key={i} size={18} fill="currentColor" />
            ))}
            <div className="relative">
              <Star size={18} fill="#E4E4E7" className="text-[#E4E4E7]" />
              <div className="absolute inset-0 overflow-hidden w-[50%] text-[#FFC633]">
                <Star size={18} fill="currentColor" />
              </div>
            </div>
          </div>
          <span className="text-sm text-black font-medium">
            4.5/<span className="text-black/60">5</span>
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-center space-x-3 mb-2.5">
          <span className="text-2xl sm:text-3xl font-bold text-black">$260</span>
          <span className="text-2xl sm:text-3xl font-bold text-black/40 line-through">
            $300
          </span>
          <span className="bg-[#FF3333]/10 text-[#FF3333] text-xs font-semibold px-3 py-1 rounded-full">
            -40%
          </span>
        </div>

        {/* Description */}
        <p className="text-black/60 text-sm leading-relaxed mb-3.5">
          This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.
        </p>

        <hr className="border-t border-black/10 my-3.5" />

        {/* Select Colors */}
        <div>
          <h3 className="text-sm text-black/60 mb-2.5">Select Colors</h3>
          <div className="flex space-x-3.5">
            {colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color.hex)}
                style={{ backgroundColor: color.hex }}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
              >
                {selectedColor === color.hex && (
                  <Check size={16} className="text-white stroke-[3]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-t border-black/10 my-3.5" />

        {/* Choose Size */}
        <div>
          <h3 className="text-sm text-black/60 mb-2.5">Choose Size</h3>
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`flex-1 px-3 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-colors text-center whitespace-nowrap cursor-pointer ${
                  selectedSize === size
                    ? "bg-black text-white"
                    : "bg-[#F0F0F0] text-black/60 hover:bg-black/10"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-t border-black/10 my-3.5" />
      </div>

      {/* Bottom Quantity Counter & Add to Cart (Flush with bottom of image) */}
      <div className="flex items-center gap-3 sm:gap-4 mt-auto pt-1">
        {/* Quantity Counter */}
        <div className="flex items-center justify-between bg-[#F0F0F0] rounded-full px-4 sm:px-5 py-3 w-[130px] sm:w-[170px] shrink-0">
          <button
            type="button"
            onClick={decrement}
            aria-label="Decrease quantity"
            className="text-black hover:opacity-60 transition-opacity cursor-pointer"
          >
            <Minus size={18} />
          </button>
          <span className="font-bold text-sm sm:text-base text-black select-none">
            {quantity}
          </span>
          <button
            type="button"
            onClick={increment}
            aria-label="Increase quantity"
            className="text-black hover:opacity-60 transition-opacity cursor-pointer"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Add to Cart Button */}
        <Link
          href="/cart"
          className="flex-1 bg-black text-white rounded-full py-3.5 sm:py-4 font-medium hover:bg-black/80 transition-colors text-center text-sm sm:text-base block"
        >
          Add to Cart
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Star, Check, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Variant {
  id: string;
  size: string;
  colorName: string;
  colorHex: string;
  stockQuantity: number;
}

interface ProductInfoProps {
  product: {
    id: string;
    slug?: string;
    name: string;
    description: string;
    images?: { url: string }[];
    price: number | string | { toString(): string };
    originalPrice?: number | string | { toString(): string } | null;
    discountPercent: number;
    averageRating: number;
    variants: Variant[];
  };
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  // Extract unique colors and sizes from variants
  const colorMap = new Map<string, { name: string; hex: string }>();
  const sizeSet = new Set<string>();

  product.variants?.forEach((v) => {
    if (v.colorName && v.colorHex) {
      colorMap.set(v.colorHex, { name: v.colorName, hex: v.colorHex });
    }
    if (v.size) {
      sizeSet.add(v.size);
    }
  });

  const availableColors = Array.from(colorMap.values());
  const availableSizes = Array.from(sizeSet);

  const [selectedColor, setSelectedColor] = useState(
    availableColors[0]?.hex || "#000000"
  );
  const [selectedSize, setSelectedSize] = useState(
    availableSizes[0] || "Large"
  );
  const [quantity, setQuantity] = useState(1);

  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Find matching variant based on selected color and size
  const matchingVariant = product.variants?.find(
    (v) =>
      v.colorHex.toLowerCase() === selectedColor.toLowerCase() &&
      v.size.toLowerCase() === selectedSize.toLowerCase()
  ) || product.variants?.[0];

  const handleAddToCart = async () => {
    if (!matchingVariant) return;

    const selectedColorObj = availableColors.find((c) => c.hex === selectedColor);
    const imageUrl = product.images?.[0]?.url || "/images/product-1.png";

    await addToCart({
      variantId: matchingVariant.id,
      quantity,
      productId: product.id,
      name: product.name,
      slug: product.slug || product.id,
      image: imageUrl,
      size: selectedSize,
      colorName: selectedColorObj?.name || matchingVariant.colorName || "Standard",
      colorHex: selectedColor,
      price,
      originalPrice,
      discountPercent: product.discountPercent,
      stockQuantity: matchingVariant.stockQuantity,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="flex flex-col justify-between h-full w-full font-satoshi">
      {/* Top Details Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold uppercase tracking-tight text-black font-integral leading-tight mb-2.5">
          {product.name}
        </h1>

        {/* Ratings */}
        <div className="flex items-center space-x-2 mb-2.5">
          <div className="flex text-[#FFC633]">
            {Array.from({ length: 5 }, (_, i) => {
              const fullStars = Math.floor(product.averageRating);
              const hasHalf = product.averageRating % 1 !== 0 && i === fullStars;
              return (
                <Star
                  key={i}
                  size={18}
                  fill={i < fullStars || hasHalf ? "currentColor" : "#E4E4E7"}
                  className={i < fullStars || hasHalf ? "text-[#FFC633]" : "text-[#E4E4E7]"}
                />
              );
            })}
          </div>
          <span className="text-sm text-black font-medium">
            {product.averageRating.toFixed(1)}/
            <span className="text-black/60">5</span>
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-center space-x-3 mb-2.5">
          <span className="text-2xl sm:text-3xl font-bold text-black">${price}</span>
          {originalPrice && (
            <span className="text-2xl sm:text-3xl font-bold text-black/40 line-through">
              ${originalPrice}
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="bg-[#FF3333]/10 text-[#FF3333] text-xs font-semibold px-3 py-1 rounded-full">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-black/60 text-sm leading-relaxed mb-3.5">
          {product.description}
        </p>

        <hr className="border-t border-black/10 my-3.5" />

        {/* Select Colors */}
        {availableColors.length > 0 && (
          <div>
            <h3 className="text-sm text-black/60 mb-2.5">Select Colors</h3>
            <div className="flex space-x-3.5">
              {availableColors.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setSelectedColor(color.hex)}
                  style={{ backgroundColor: color.hex }}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer border border-black/10"
                >
                  {selectedColor === color.hex && (
                    <Check size={16} className="text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {availableColors.length > 0 && <hr className="border-t border-black/10 my-3.5" />}

        {/* Choose Size */}
        {availableSizes.length > 0 && (
          <div>
            <h3 className="text-sm text-black/60 mb-2.5">Choose Size</h3>
            <div className="flex items-center gap-2 sm:gap-3 w-full flex-wrap">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-colors text-center cursor-pointer ${
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
        )}

        <hr className="border-t border-black/10 my-3.5" />
      </div>

      {/* Bottom Quantity Counter & Add to Cart */}
      <div className="flex items-center gap-3 sm:gap-4 mt-4 pt-1">
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

        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex-1 rounded-full py-3.5 sm:py-4 font-medium transition-all text-center text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer ${
            isAdded ? "bg-emerald-600 text-white" : "bg-black text-white hover:bg-black/80"
          }`}
        >
          {isAdded ? (
            <>
              <Check size={18} />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag size={18} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

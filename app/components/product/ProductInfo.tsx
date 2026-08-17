"use client";

import { useState, useMemo } from "react";
import { Star, Check, Plus, Minus, ShoppingBag, AlertCircle, CheckCircle2, Ban } from "lucide-react";
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

  // Extract unique colors across all variants
  const availableColors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string }>();
    product.variants?.forEach((v) => {
      if (v.colorHex) {
        map.set(v.colorHex.toLowerCase(), {
          name: v.colorName || "Standard",
          hex: v.colorHex,
        });
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  // Standard ordered sizes
  const allPossibleSizes = useMemo(() => {
    const sizeOrder = ["XX-Small", "X-Small", "Small", "Medium", "Large", "X-Large", "XX-Large", "3X-Large", "4X-Large"];
    const presentSizes = new Set<string>();
    product.variants?.forEach((v) => {
      if (v.size) presentSizes.add(v.size);
    });

    const ordered = sizeOrder.filter((s) => presentSizes.has(s));
    const extra = Array.from(presentSizes).filter((s) => !sizeOrder.includes(s));
    return [...ordered, ...extra];
  }, [product.variants]);

  // Initial selections
  const [selectedColor, setSelectedColor] = useState<string>(
    availableColors[0]?.hex || "#000000"
  );

  // Find sizes available specifically for selected color
  const colorVariants = useMemo(() => {
    return (product.variants || []).filter(
      (v) => v.colorHex.toLowerCase() === selectedColor.toLowerCase()
    );
  }, [product.variants, selectedColor]);

  // Determine initial size that is in stock for this color
  const defaultSizeForColor = useMemo(() => {
    const inStock = colorVariants.find((v) => v.stockQuantity > 0);
    return inStock?.size || colorVariants[0]?.size || allPossibleSizes[0] || "Large";
  }, [colorVariants, allPossibleSizes]);

  const [selectedSize, setSelectedSize] = useState<string>(defaultSizeForColor);
  const [quantity, setQuantity] = useState(1);

  // Handle color change: auto-select an available in-stock size if current size is out of stock
  const handleColorChange = (newColorHex: string) => {
    setSelectedColor(newColorHex);
    const variantsForNewColor = (product.variants || []).filter(
      (v) => v.colorHex.toLowerCase() === newColorHex.toLowerCase()
    );

    const isCurrentSizeInStock = variantsForNewColor.some(
      (v) => v.size.toLowerCase() === selectedSize.toLowerCase() && v.stockQuantity > 0
    );

    if (!isCurrentSizeInStock) {
      const firstInStock = variantsForNewColor.find((v) => v.stockQuantity > 0);
      if (firstInStock) {
        setSelectedSize(firstInStock.size);
      }
    }
  };

  // Find matching variant based on currently selected color and size
  const matchingVariant = useMemo(() => {
    return (product.variants || []).find(
      (v) =>
        v.colorHex.toLowerCase() === selectedColor.toLowerCase() &&
        v.size.toLowerCase() === selectedSize.toLowerCase()
    );
  }, [product.variants, selectedColor, selectedSize]);

  const isCurrentSelectionInStock = matchingVariant ? matchingVariant.stockQuantity > 0 : false;
  const currentStockCount = matchingVariant?.stockQuantity || 0;

  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;

  const increment = () => {
    if (quantity < currentStockCount) {
      setQuantity((prev) => prev + 1);
    }
  };
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    if (!matchingVariant || !isCurrentSelectionInStock) return;

    const selectedColorObj = availableColors.find(
      (c) => c.hex.toLowerCase() === selectedColor.toLowerCase()
    );
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
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm text-black/60">Select Color</h3>
              <span className="text-xs font-semibold text-black capitalize">
                {availableColors.find((c) => c.hex.toLowerCase() === selectedColor.toLowerCase())?.name || ""}
              </span>
            </div>
            <div className="flex space-x-3.5">
              {availableColors.map((color) => {
                const isSelected = selectedColor.toLowerCase() === color.hex.toLowerCase();
                const hasAnyStock = (product.variants || []).some(
                  (v) => v.colorHex.toLowerCase() === color.hex.toLowerCase() && v.stockQuantity > 0
                );

                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => handleColorChange(color.hex)}
                    style={{ backgroundColor: color.hex }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer border ${
                      color.hex.toLowerCase() === "#ffffff" ? "border-black/30" : "border-black/10"
                    } ${isSelected ? "ring-2 ring-black ring-offset-2 scale-105" : ""} relative`}
                    title={`${color.name}${!hasAnyStock ? " (Out of Stock)" : ""}`}
                  >
                    {isSelected && (
                      <Check
                        size={16}
                        className={`stroke-[3] ${
                          color.hex.toLowerCase() === "#ffffff" ? "text-black" : "text-white"
                        }`}
                      />
                    )}
                    {!hasAnyStock && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-1 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {availableColors.length > 0 && <hr className="border-t border-black/10 my-3.5" />}

        {/* Choose Size with Color-Specific Stock Validation */}
        {allPossibleSizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm text-black/60">Choose Size</h3>
              {matchingVariant && (
                <span className="text-xs font-semibold">
                  {matchingVariant.stockQuantity > 0 ? (
                    matchingVariant.stockQuantity <= 5 ? (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertCircle size={13} /> Only {matchingVariant.stockQuantity} left!
                      </span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={13} /> In Stock ({matchingVariant.stockQuantity})
                      </span>
                    )
                  ) : (
                    <span className="text-rose-500 flex items-center gap-1">
                      <Ban size={13} /> Out of Stock for this color
                    </span>
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full flex-wrap">
              {allPossibleSizes.map((size) => {
                const variantForSize = colorVariants.find(
                  (v) => v.size.toLowerCase() === size.toLowerCase()
                );
                const isAvailable = variantForSize ? variantForSize.stockQuantity > 0 : false;
                const isSelected = selectedSize.toLowerCase() === size.toLowerCase();

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      if (isAvailable) setSelectedSize(size);
                    }}
                    className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all text-center relative ${
                      !isAvailable
                        ? "bg-gray-100 text-gray-400 line-through cursor-not-allowed border border-dashed border-gray-300 opacity-50"
                        : isSelected
                        ? "bg-black text-white shadow-sm scale-105"
                        : "bg-[#F0F0F0] text-black/80 hover:bg-black/10 cursor-pointer"
                    }`}
                    title={!isAvailable ? `${size} is out of stock in this color` : `${size}`}
                  >
                    <span>{size}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <hr className="border-t border-black/10 my-3.5" />
      </div>

      {/* Bottom Quantity Counter & Add to Cart */}
      <div className="flex items-center gap-3 sm:gap-4 mt-4 pt-1">
        <div
          className={`flex items-center justify-between bg-[#F0F0F0] rounded-full px-4 sm:px-5 py-3 w-[130px] sm:w-[170px] shrink-0 ${
            !isCurrentSelectionInStock ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <button
            type="button"
            onClick={decrement}
            disabled={!isCurrentSelectionInStock || quantity <= 1}
            aria-label="Decrease quantity"
            className="text-black hover:opacity-60 transition-opacity cursor-pointer disabled:opacity-30"
          >
            <Minus size={18} />
          </button>
          <span className="font-bold text-sm sm:text-base text-black select-none">
            {quantity}
          </span>
          <button
            type="button"
            onClick={increment}
            disabled={!isCurrentSelectionInStock || quantity >= currentStockCount}
            aria-label="Increase quantity"
            className="text-black hover:opacity-60 transition-opacity cursor-pointer disabled:opacity-30"
          >
            <Plus size={18} />
          </button>
        </div>

        <button
          type="button"
          disabled={!isCurrentSelectionInStock}
          onClick={handleAddToCart}
          className={`flex-1 rounded-full py-3.5 sm:py-4 font-medium transition-all text-center text-sm sm:text-base flex items-center justify-center gap-2 ${
            !isCurrentSelectionInStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : isAdded
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-black text-white hover:bg-black/80 cursor-pointer shadow-sm"
          }`}
        >
          {isAdded ? (
            <>
              <Check size={18} />
              Added to Cart!
            </>
          ) : !isCurrentSelectionInStock ? (
            <>
              <Ban size={18} />
              Out of Stock
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

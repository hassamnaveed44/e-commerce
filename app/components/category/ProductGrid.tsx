import Image from "next/image";
import Link from "next/link";
import { Star, ChevronDown, SlidersHorizontal } from "lucide-react";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  rating: number;
  ratingMax: number;
}

const categoryProducts: Product[] = [
  {
    id: "gradient-graphic-tshirt",
    name: "Gradient Graphic T-shirt",
    image: "/products/product5.png",
    price: 145,
    originalPrice: 242,
    discount: "-20%",
    rating: 3.5,
    ratingMax: 5,
  },
  {
    id: "polo-tipping-details",
    name: "Polo with Tipping Details",
    image: "/products/product6.png",
    price: 180,
    originalPrice: 242,
    discount: "-20%",
    rating: 4.5,
    ratingMax: 5,
  },
  {
    id: "black-striped-tshirt",
    name: "Black Striped T-shirt",
    image: "/products/product7.png",
    price: 120,
    originalPrice: 150,
    discount: "-30%",
    rating: 4.0,
    ratingMax: 5,
  },
  {
    id: "skinny-fit-jeans",
    name: "Skinny Fit Jeans",
    image: "/images/product-2.png",
    price: 240,
    originalPrice: 260,
    discount: "-20%",
    rating: 3.5,
    ratingMax: 5,
  },
  {
    id: "checkered-shirt",
    name: "Checkered Shirt",
    image: "/images/product-3.png",
    price: 180,
    rating: 4.5,
    ratingMax: 5,
  },
  {
    id: "sleeve-striped-tshirt",
    name: "Sleeve Striped T-shirt",
    image: "/images/product-4.png",
    price: 130,
    originalPrice: 160,
    discount: "-30%",
    rating: 4.5,
    ratingMax: 5,
  },
  {
    id: "vertical-striped-shirt",
    name: "Vertical Striped Shirt",
    image: "/images/product-6.png",
    price: 212,
    originalPrice: 232,
    discount: "-20%",
    rating: 5.0,
    ratingMax: 5,
  },
  {
    id: "courage-graphic-tshirt",
    name: "Courage Graphic T-shirt",
    image: "/images/product-7.png",
    price: 145,
    rating: 4.0,
    ratingMax: 5,
  },
  {
    id: "loose-fit-bermuda-shorts",
    name: "Loose Fit Bermuda Shorts",
    image: "/images/product-8.png",
    price: 80,
    rating: 3.0,
    ratingMax: 5,
  },
];

interface ProductGridProps {
  categoryName: string;
}

export default function ProductGrid({ categoryName }: ProductGridProps) {
  const currentSlug = categoryName.toLowerCase();

  return (
    <div className="flex-1 w-full font-satoshi">
      {/* Top Bar: Title, Count & Filter Button on SAME line */}
      <div className="flex items-center justify-between gap-2 mb-5 sm:mb-6">
        {/* Left Side: Title + Count */}
        <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <h1 className="text-2xl sm:text-3xl font-bold capitalize text-black font-integral leading-none">
            {categoryName}
          </h1>
          <span className="text-xs sm:text-sm text-black/60 font-satoshi whitespace-nowrap">
            Showing 1-10 of 100 Products
          </span>
        </div>

        {/* Right Side: Sort (Desktop) & Filter Link (Mobile) */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-black">
            <span className="text-black/60">Sort by:</span>
            <button type="button" className="font-semibold flex items-center gap-1 cursor-pointer">
              Most Popular <ChevronDown size={14} />
            </button>
          </div>

          {/* Mobile Filter Button -> Links to the separate /filters page */}
          <Link
            href={`/category/${currentSlug}/filters`}
            className="bg-[#F0F0F0] p-2.5 rounded-full flex items-center justify-center text-black hover:bg-black/10 transition-colors lg:hidden shrink-0 cursor-pointer"
            aria-label="Open filters page"
          >
            <SlidersHorizontal size={18} />
          </Link>
        </div>
      </div>

      {/* Products Grid: 6 items on mobile, 9 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
        {categoryProducts.map((product, index) => (
          <Link
            key={product.id}
            href={`/shop/product/${product.id}`}
            className={`group flex-col ${index >= 6 ? "hidden lg:flex" : "flex"}`}
          >
            {/* Image Container */}
            <div className="bg-[#F0EEED] rounded-[20px] aspect-square relative overflow-hidden mb-3 sm:mb-4 flex items-center justify-center p-4">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover object-center group-hover:scale-105 transition duration-300"
              />
            </div>

            {/* Product Title */}
            <h3 className="font-satoshi font-bold text-sm sm:text-lg text-black mb-1 sm:mb-2 truncate">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-1.5 mb-1 sm:mb-2">
              <div className="flex text-[#FFC633]">
                {Array.from({ length: Math.floor(product.rating) }, (_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
                {product.rating % 1 !== 0 && (
                  <div className="relative">
                    <Star size={14} fill="transparent" className="text-transparent" />
                    <div className="absolute inset-0 overflow-hidden w-[50%] text-[#FFC633]">
                      <Star size={14} fill="currentColor" />
                    </div>
                  </div>
                )}
              </div>
              <span className="text-xs sm:text-sm font-satoshi text-black font-medium">
                {product.rating.toFixed(1)}/
                <span className="text-black/60">{product.ratingMax}</span>
              </span>
            </div>

            {/* Price & Discounts */}
            <div className="flex items-center space-x-2 sm:space-x-3 font-satoshi flex-wrap">
              <span className="text-base sm:text-xl font-bold text-black">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-base sm:text-xl font-bold text-black/40 line-through">
                  ${product.originalPrice}
                </span>
              )}
              {product.discount && (
                <span className="bg-[#FF3333]/10 text-[#FF3333] text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full">
                  {product.discount}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Star, ChevronDown, SlidersHorizontal } from "lucide-react";

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

export default function ProductGrid({
  categoryName,
  products,
  totalCount,
}: ProductGridProps) {
  const currentSlug = categoryName.toLowerCase();

  return (
    <div className="flex-1 w-full font-satoshi">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 mb-5 sm:mb-6">
        <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <h1 className="text-2xl sm:text-3xl font-bold capitalize text-black font-integral leading-none">
            {categoryName}
          </h1>
          <span className="text-xs sm:text-sm text-black/60 font-satoshi whitespace-nowrap">
            Showing 1-{products.length} of {totalCount || products.length} Products
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-black">
            <span className="text-black/60">Sort by:</span>
            <button type="button" className="font-semibold flex items-center gap-1 cursor-pointer">
              Most Popular <ChevronDown size={14} />
            </button>
          </div>

          <Link
            href={`/category/${currentSlug}/filters`}
            className="bg-[#F0F0F0] p-2.5 rounded-full flex items-center justify-center text-black hover:bg-black/10 transition-colors lg:hidden shrink-0 cursor-pointer"
            aria-label="Open filters page"
          >
            <SlidersHorizontal size={18} />
          </Link>
        </div>
      </div>

      {/* Products Grid */}
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
                {product.discountPercent && product.discountPercent > 0 && (
                  <span className="bg-[#FF3333]/10 text-[#FF3333] text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full">
                    -{product.discountPercent}%
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

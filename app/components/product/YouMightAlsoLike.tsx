import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface Product {
  id: string;
  slug?: string;
  name: string;
  images: { url: string }[];
  price: number | string | { toString(): string };
  originalPrice?: number | string | { toString(): string } | null;
  discountPercent?: number;
  averageRating: number;
}

export default function YouMightAlsoLike({ products }: { products: Product[] }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 py-12 sm:py-16">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center uppercase tracking-tight text-black mb-8 sm:mb-12 font-integral leading-[1.1] sm:leading-tight">
        YOU MIGHT <br className="sm:hidden" /> ALSO LIKE
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.slice(0, 4).map((product, index) => {
          const image = product.images?.[0]?.url || "/images/product-1.png";
          const price = Number(product.price);
          const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;

          return (
            <Link
              key={product.id}
              href={`/shop/product/${product.slug || product.id}`}
              className={`group flex-col ${index >= 2 ? "hidden lg:flex" : "flex"}`}
            >
              <div className="bg-[#F0EEED] rounded-[20px] aspect-square relative overflow-hidden mb-4 flex items-center justify-center p-4">
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition duration-300"
                />
              </div>

              <h3 className="font-satoshi font-bold text-base sm:text-lg lg:text-[20px] text-black leading-tight mb-1.5 sm:mb-2 truncate">
                {product.name}
              </h3>

              <div className="flex items-center space-x-1.5 mb-2">
                <div className="flex text-[#FFC633]">
                  {Array.from({ length: Math.floor(product.averageRating) }, (_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-satoshi text-black font-medium">
                  {product.averageRating.toFixed(1)}/
                  <span className="text-black/60">5</span>
                </span>
              </div>

              <div className="flex items-center space-x-3 font-satoshi">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-black">
                  ${price}
                </span>
                {originalPrice && (
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-black/40 line-through">
                    ${originalPrice}
                  </span>
                )}
                {product.discountPercent !== undefined && product.discountPercent > 0 ? (
                  <span className="bg-[#FF3333]/10 text-[#FF3333] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    -{product.discountPercent}%
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

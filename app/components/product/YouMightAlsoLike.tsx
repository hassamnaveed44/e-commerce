import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface RelatedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  rating: number;
  ratingMax: number;
}

const relatedProducts: RelatedProduct[] = [
  {
    id: "polo-contrast-trims",
    name: "Polo with Contrast Trims",
    image: "/products/product4.png",
    price: 212,
    originalPrice: 242,
    discount: "-20%",
    rating: 4.0,
    ratingMax: 5,
  },
  {
    id: "gradient-graphic-tshirt",
    name: "Gradient Graphic T-shirt",
    image: "/products/product5.png",
    price: 145,
    rating: 3.5,
    ratingMax: 5,
  },
  {
    id: "polo-tipping-details",
    name: "Polo with Tipping Details",
    image: "/products/product6.png",
    price: 180,
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
    rating: 5.0,
    ratingMax: 5,
  },
];

export default function YouMightAlsoLike() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 py-12 sm:py-16">
      {/* Section Title: 2 lines on mobile, 1 line on desktop */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center uppercase tracking-tight text-black mb-8 sm:mb-12 font-integral leading-[1.1] sm:leading-tight">
        YOU MIGHT <br className="sm:hidden" /> ALSO LIKE
      </h2>

      {/* Products Grid (2 on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {relatedProducts.map((product, index) => (
          <Link
            key={product.id}
            href={`/shop/product/${product.id}`}
            className={`group flex-col ${index >= 2 ? "hidden lg:flex" : "flex"}`}
          >
            {/* Product Image Box */}
            <div className="bg-[#F0EEED] rounded-[20px] aspect-square relative overflow-hidden mb-4 flex items-center justify-center p-4">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover object-center group-hover:scale-105 transition duration-300"
              />
            </div>

            {/* Product Name */}
            <h3 className="font-satoshi font-bold text-base sm:text-lg lg:text-[20px] text-black leading-tight mb-1.5 sm:mb-2 truncate">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-1.5 mb-2">
              <div className="flex text-[#FFC633]">
                {Array.from({ length: Math.floor(product.rating) }, (_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
                {product.rating % 1 !== 0 && (
                  <div className="relative">
                    <Star size={16} fill="transparent" className="text-transparent" />
                    <div className="absolute inset-0 overflow-hidden w-[50%] text-[#FFC633]">
                      <Star size={16} fill="currentColor" />
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
            <div className="flex items-center space-x-3 font-satoshi">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-black">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-base sm:text-lg lg:text-xl font-bold text-black/40 line-through">
                  ${product.originalPrice}
                </span>
              )}
              {product.discount && (
                <span className="bg-[#FF3333]/10 text-[#FF3333] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {product.discount}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

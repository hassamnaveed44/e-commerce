import Link from "next/link";
import Image from "next/image";

interface Product {
  id: number | string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  rating: number;
}

interface ProductSectionProps {
  title: string;
  products: Product[];
  id?: string;
}

export default function ProductSection({ title, products, id }: ProductSectionProps) {
  return (
    <section id={id} className="py-12 md:py-16 bg-white border-b border-black/10 scroll-mt-16 md:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10">
        
        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center uppercase tracking-tight mb-8 md:mb-12 font-integral text-black">
          {title}
        </h2>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className={`flex-col group font-satoshi ${index >= 2 ? "hidden lg:flex" : "flex"}`}
            >
              {/* Product Card Image Container */}
              <Link href={`/products/${product.id}`} className="block">
                <div className="bg-[#F0EEED] rounded-[20px] aspect-square relative overflow-hidden mb-4 flex items-center justify-center p-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition duration-300"
                  />
                </div>
              </Link>

              {/* Product Title */}
              <Link href={`/products/${product.id}`}>
                <h3 className="font-bold text-base sm:text-lg text-black truncate mb-1 hover:underline">
                  {product.name}
                </h3>
              </Link>

              {/* Rating Section - Uses CSS clip-path or partial fill for fractional stars */}
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex text-[#FFC633] text-sm font-black">
                  {Array.from({ length: 5 }, (_, i) => {
                    const starIndex = i + 1;
                    const fullStars = Math.floor(product.rating);
                    const fractionalPart = product.rating % 1;

                    if (starIndex <= fullStars) {
                      return <span key={i}>★</span>;
                    } else if (starIndex === fullStars + 1 && fractionalPart > 0) {
                      return (
                        <span key={i} className="relative inline-block text-black/20">
                          <span>★</span>
                          <span 
                            className="absolute top-0 left-0 overflow-hidden text-[#FFC633]"
                            style={{ width: `${fractionalPart * 100}%` }}
                          >
                            ★
                          </span>
                        </span>
                      );
                    } else {
                      return <span key={i} className="text-black/20">★</span>;
                    }
                  })}
                </div>
                <span className="text-xs sm:text-sm text-black/60">
                  {product.rating}/<span className="text-black/40">5</span>
                </span>
              </div>

              {/* Price Section */}
              <div className="flex items-center gap-3 font-bold text-lg sm:text-xl text-black mt-auto">
                <span>${product.price}</span>
                {product.originalPrice && (
                  <span className="text-black/40 line-through text-base sm:text-lg font-bold">
                    ${product.originalPrice}
                  </span>
                )}
                {product.discount && (
                  <span className="bg-[#FF3333]/10 text-[#FF3333] text-xs font-medium px-2 py-0.5 rounded-full">
                    {product.discount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10 md:mt-12">
          <Link
            href={id === "top-selling" ? "/#top-selling" : "/#new-arrivals"}
            className="inline-block w-full sm:w-auto text-center border border-black/15 text-black px-16 py-4 rounded-full font-medium hover:bg-black hover:text-white transition shadow-sm font-satoshi"
          >
            View All
          </Link>
        </div>

      </div>
    </section>
  );
}

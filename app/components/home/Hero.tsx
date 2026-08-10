import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-[#F2F0F1] pt-10 md:pt-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 flex flex-col lg:flex-row items-start justify-between">
        
        {/* Left Content Column */}
        <div className="lg:w-[577px] flex flex-col items-start pb-12 lg:pb-20 z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold tracking-tight uppercase leading-[1] mb-6 text-black font-integral">
            FIND CLOTHES THAT MATCHES YOUR STYLE
          </h1>
          <p className="text-black/60 text-sm sm:text-base mb-8 max-w-lg font-satoshi">
            Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
          </p>
          <Link
            href="#"
            className="w-full sm:w-auto text-center bg-black text-white px-16 py-4 rounded-full font-medium hover:bg-black/80 transition shadow-md font-satoshi mb-12"
          >
            Shop Now
          </Link>

          {/* Stats Section with Vertical Dividers */}
          <div className="grid grid-cols-3 gap-6 w-full font-satoshi">
            <div>
              <h3 className="text-2xl sm:text-4xl font-bold text-black font-integral">200+</h3>
              <p className="text-xs sm:text-sm text-black/60">International Brands</p>
            </div>
            <div className="border-l border-black/15 pl-6">
              <h3 className="text-2xl sm:text-4xl font-bold text-black font-integral">2,000+</h3>
              <p className="text-xs sm:text-sm text-black/60">High-Quality Products</p>
            </div>
            <div className="border-l border-black/15 pl-6">
              <h3 className="text-2xl sm:text-4xl font-bold text-black font-integral">30,000+</h3>
              <p className="text-xs sm:text-sm text-black/60">Happy Customers</p>
            </div>
          </div>
        </div>

        {/* Right Image Container (top-aligned to match Figma: image starts at hero top, no bottom anchoring) */}
        <div className="lg:w-1/2 w-full flex justify-center lg:justify-end relative">
          <div className="relative w-full max-w-[500px] lg:max-w-[600px] h-[380px] sm:h-[450px] lg:h-[500px]">
            <Image
              src="/images/e-commercehero.png"
              alt="Hero Fashion Models"
              fill
              priority
              className="object-contain object-top"
            />
            {/* Decorative Vector Stars */}
            <div className="absolute top-2 right-10 lg:right-16 text-black text-4xl select-none pointer-events-none animate-pulse">
              ✦
            </div>
            <div className="absolute top-1/2 left-0 text-black text-2xl select-none pointer-events-none animate-pulse">
              ✦
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
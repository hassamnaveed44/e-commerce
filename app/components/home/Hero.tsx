import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-[#F2F0F1] pt-10 md:pt-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto sm:px-6 xl:px-10 flex flex-col lg:flex-row items-start justify-between">

        {/* Left Content Column */}
        <div className="px-4 sm:px-0 lg:w-[577px] flex flex-col items-start pb-8 lg:pb-20 z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold tracking-tight uppercase leading-[1] mb-6 text-black font-integral">
            FIND CLOTHES THAT MATCHES YOUR STYLE
          </h1>
          <p className="text-black/60 text-sm sm:text-base mb-8 max-w-lg font-satoshi">
            Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
          </p>
          <Link
            href="#"
            className="w-full sm:w-auto text-center bg-black text-white px-16 py-4 rounded-full font-medium hover:bg-black/80 transition shadow-md font-satoshi mb-10 lg:mb-12"
          >
            Shop Now
          </Link>

          {/* Stats Section */}
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-center sm:grid sm:grid-cols-3 sm:gap-6 sm:text-left sm:justify-normal w-full font-satoshi">
            <div className="w-[40%] sm:w-auto">
              <h3 className="text-2xl sm:text-4xl font-bold text-black font-integral">200+</h3>
              <p className="text-xs sm:text-sm text-black/60">International Brands</p>
            </div>
            <div className="w-[40%] sm:w-auto sm:border-l sm:border-black/15 sm:pl-6">
              <h3 className="text-2xl sm:text-4xl font-bold text-black font-integral">2,000+</h3>
              <p className="text-xs sm:text-sm text-black/60">High-Quality Products</p>
            </div>
            <div className="w-[40%] sm:w-auto sm:border-l sm:border-black/15 sm:pl-6">
              <h3 className="text-2xl sm:text-4xl font-bold text-black font-integral">30,000+</h3>
              <p className="text-xs sm:text-sm text-black/60">Happy Customers</p>
            </div>
          </div>
        </div>

        {/* Right Image Container — simple fixed heights at every breakpoint,
            no aspect-ratio utility (that was conflicting with the fixed
            lg:h value and causing the mismatched box/gap you saw). */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
          <div className="relative w-full h-[380px] sm:h-[450px] lg:w-[600px] lg:h-[560px]">
            <Image
              src="/images/mainhero.jpg"
              alt="Hero Fashion Models"
              fill
              priority
              className="object-contain object-top lg:object-right"
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
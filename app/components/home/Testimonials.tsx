"use client";

import { useRef } from "react";

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  review: string;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    review: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
    verified: true,
  },
  {
    id: 2,
    name: "Alex K.",
    rating: 5,
    review: "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
    verified: true,
  },
  {
    id: 3,
    name: "James L.",
    rating: 5,
    review: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.",
    verified: true,
  },
  {
    id: 4,
    name: "Moose W.",
    rating: 5,
    review: "The shipping was fast and the quality is immaculate. Absolutely love shopping here!",
    verified: true,
  },
];

export default function TestimonialsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector("div")?.clientWidth || 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -(cardWidth + 20) : cardWidth + 20,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 md:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 mb-8 md:mb-12 flex items-end justify-between">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight font-integral text-black">
          OUR HAPPY CUSTOMERS
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-60 transition text-black text-xl"
            aria-label="Previous Slide"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-60 transition text-black text-xl"
            aria-label="Next Slide"
          >
            →
          </button>
        </div>
      </div>

      {/* Carousel Container with fade/blur edges on both left and right sides */}
      <div className="relative w-full">
        {/* Left Fade Overlay */}
        <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 hidden sm:block" />
        
        {/* Right Fade Overlay */}
        <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />

        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide px-4 sm:px-6 xl:px-10 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="snap-center shrink-0 w-[350px] sm:w-[400px] bg-white border border-black/10 rounded-[20px] p-6 sm:p-8 flex flex-col justify-between shadow-sm font-satoshi"
            >
              <div>
                {/* Rating */}
                <div className="flex text-[#FFC633] text-lg mb-3">
                  {"★".repeat(item.rating)}
                </div>
                {/* Name & Verification */}
                <div className="flex items-center gap-1.5 mb-2">
                  <h3 className="font-bold text-lg text-black">{item.name}</h3>
                  {item.verified && (
                    <span className="text-white bg-[#01AB31] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
                {/* Review */}
                <p className="text-black/60 text-sm sm:text-base leading-relaxed">
                  &ldquo;{item.review}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
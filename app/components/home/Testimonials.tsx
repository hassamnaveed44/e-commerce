"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

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
    name: "Samantha D.",
    rating: 5,
    review:
      "I'm thoroughly impressed by the variety and quality of the apparel. Everything fits seamlessly and feels like bespoke tailoring. Shop.co never disappoints!",
    verified: true,
  },
  {
    id: 2,
    name: "Sarah M.",
    rating: 5,
    review:
      "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
    verified: true,
  },
  {
    id: 3,
    name: "Alex K.",
    rating: 5,
    review:
      "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
    verified: true,
  },
  {
    id: 4,
    name: "James L.",
    rating: 5,
    review:
      "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.",
    verified: true,
  },
  {
    id: 5,
    name: "Moose W.",
    rating: 5,
    review:
      "The shipping was fast and the quality is immaculate. Absolutely love shopping here! Customer support is top notch as well.",
    verified: true,
  },
];

export default function TestimonialsSection() {
  // Index 1 = Sarah M. as the first clear card in view (Samantha D. is at index 0 on the left)
  const [currentIndex, setCurrentIndex] = useState(1);

  // Maximum index allows sliding to Alex K., James L., Moose W.
  const maxIndex = testimonials.length - 3; // 5 - 3 = 2

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : maxIndex));
  };

  // Card width: 370px allows ~140px-160px of blurred cards to peek in with readable text shapes
  const CARD_WIDTH = 370;
  const GAP = 20;
  const STEP = CARD_WIDTH + GAP;

  return (
    <section className="py-12 md:py-20 bg-white overflow-hidden font-satoshi">
      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 mb-8 md:mb-10 flex items-end justify-between">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight font-integral text-black">
          OUR HAPPY CUSTOMERS
        </h2>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-black transition-colors ${
              currentIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-black/5 cursor-pointer opacity-100"
            }`}
            aria-label="Previous Slide"
          >
            <ArrowLeft size={22} className="stroke-[2]" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-black transition-colors ${
              currentIndex === maxIndex
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-black/5 cursor-pointer opacity-100"
            }`}
            aria-label="Next Slide"
          >
            <ArrowRight size={22} className="stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Centered Overflow Carousel Track */}
      <div className="w-full relative overflow-hidden">
        <div
          className="flex gap-5 transition-transform duration-500 ease-out"
          style={{
            // Centers the 3 active cards and symmetrically exposes ~140px-160px of the outer blurred cards
            transform: `translateX(calc(50% - ${(currentIndex + 1.5) * STEP - GAP / 2}px))`,
          }}
        >
          {testimonials.map((item, index) => {
            // The 3 center cards starting from currentIndex are clear; left & right outer cards are blurred
            const isClear =
              index >= currentIndex && index < currentIndex + 3;

            return (
              <div
                key={item.id}
                style={{ width: `${CARD_WIDTH}px` }}
                className={`shrink-0 min-h-[240px] bg-white border border-black/10 rounded-[20px] p-6 sm:p-8 flex flex-col justify-between font-satoshi transition-all duration-500 ${
                  isClear
                    ? "opacity-100 filter-none shadow-xs"
                    : "opacity-45 blur-[1.5px] select-none pointer-events-none"
                }`}
              >
                <div>
                  {/* 5 Yellow Stars */}
                  <div className="flex items-center gap-1 text-[#FFC633] text-lg mb-3 select-none">
                    {"★".repeat(item.rating)}
                  </div>

                  {/* Customer Name & Verified Badge */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <h3 className="font-bold text-base sm:text-lg text-black">
                      {item.name}
                    </h3>
                    {item.verified && (
                      <span className="text-white bg-[#01AB31] rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                        <Check size={11} strokeWidth={3.5} />
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-black/60 text-xs sm:text-sm md:text-base leading-relaxed">
                    &ldquo;{item.review}&rdquo;
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { Star, SlidersHorizontal, ChevronDown, CheckCircle2, MoreHorizontal } from "lucide-react";

interface Review {
  name: string;
  rating: number;
  date: string;
  comment: string;
}

const reviews: Review[] = [
  {
    name: "Samantha D.",
    rating: 4.5,
    date: "August 14, 2023",
    comment:
      "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt.",
  },
  {
    name: "Alex M.",
    rating: 4,
    date: "August 15, 2023",
    comment:
      "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.",
  },
  {
    name: "Ethan R.",
    rating: 4,
    date: "August 16, 2023",
    comment:
      "This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer's touch in every aspect of this shirt.",
  },
  {
    name: "Olivia P.",
    rating: 4,
    date: "August 17, 2023",
    comment:
      "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It's evident that the designer poured their creativity into making this shirt stand out.",
  },
  {
    name: "Liam K.",
    rating: 4,
    date: "August 18, 2023",
    comment:
      "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill. It's like wearing a piece of art that reflects my passion for both design and fashion.",
  },
  {
    name: "Ava H.",
    rating: 4.5,
    date: "August 19, 2023",
    comment:
      "I'm not just wearing a t-shirt; I'm wearing a piece of design philosophy. The intricate details and thoughtful layout of the design make this shirt a conversation starter.",
  },
];

export default function ReviewsList() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 py-4 font-satoshi">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-black flex items-center gap-1.5 sm:gap-2">
          All Reviews <span className="text-sm sm:text-base font-normal text-black/60">(451)</span>
        </h2>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button 
            type="button"
            aria-label="Filter reviews"
            className="bg-[#F0F0F0] p-2.5 sm:p-3 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={18} className="text-black" />
          </button>
          <button 
            type="button"
            className="hidden sm:flex bg-[#F0F0F0] px-4 py-3 rounded-full text-sm font-medium text-black items-center gap-2 hover:bg-black/10 transition-colors cursor-pointer"
          >
            Latest <ChevronDown size={16} />
          </button>
          <button 
            type="button"
            className="bg-black text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium hover:bg-black/80 transition-colors cursor-pointer whitespace-nowrap"
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-28 sm:mb-10">
        {reviews.map((review, index) => {
          const fullStars = Math.floor(review.rating);
          const hasHalfStar = review.rating % 1 !== 0;

          return (
            <div
              key={index}
              className={`border border-black/10 rounded-[20px] p-6 sm:p-8 flex-col justify-between bg-white ${
                index >= 2 ? "hidden md:flex" : "flex"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  {/* Rating Stars: Renders exactly the number of yellow stars without extra faded stars */}
                  <div className="flex items-center text-[#FFC633]">
                    {Array.from({ length: fullStars }, (_, i) => (
                      <Star key={i} size={18} fill="currentColor" />
                    ))}
                    {hasHalfStar && (
                      <div className="relative">
                        <Star size={18} fill="transparent" className="text-transparent" />
                        <div className="absolute inset-0 overflow-hidden w-[50%] text-[#FFC633]">
                          <Star size={18} fill="currentColor" />
                        </div>
                      </div>
                    )}
                  </div>
                  <button type="button" aria-label="Review options" className="text-black/40 hover:text-black">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="font-bold text-base sm:text-lg text-black">{review.name}</span>
                  <CheckCircle2 size={16} className="text-[#01AB31] fill-[#01AB31] text-white" />
                </div>

                <p className="text-black/60 text-sm leading-relaxed mb-5">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              <span className="text-black/60 text-xs sm:text-sm font-medium">
                Posted on {review.date}
              </span>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center pb-2">
        <button 
          type="button"
          className="border border-black/10 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-medium text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
        >
          Load More Reviews
        </button>
      </div>
    </div>
  );
}

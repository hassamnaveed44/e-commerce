"use client";

import { useState } from "react";
import Image from "next/image";

const mainImage = "/products/producthero.png";
const thumbnails = [
  "/products/product1.png",
  "/products/product2.png",
  "/products/product3.png",
];

export default function ProductImages() {
  const [selectedImage, setSelectedImage] = useState(mainImage);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3.5 items-start w-full">
      {/* 3 Thumbnails vertically stacked with equal total height */}
      <div className="flex lg:flex-col gap-3.5 w-full lg:w-[152px] justify-between shrink-0">
        {thumbnails.map((img, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedImage(img)}
            className={`relative bg-[#F0EEED] rounded-[20px] overflow-hidden w-full lg:w-[152px] h-[106px] sm:h-[120px] lg:h-[167px] transition-all duration-200 cursor-pointer ${
              selectedImage === img
                ? "border border-black"
                : "border border-transparent hover:border-black/20"
            }`}
          >
            <Image
              src={img}
              alt={`Product thumbnail ${index + 1}`}
              fill
              className="object-cover object-center"
            />
          </button>
        ))}
      </div>

      {/* Main Large Preview Card */}
      <div className="relative bg-[#F0EEED] rounded-[20px] overflow-hidden w-full lg:flex-1 h-[340px] sm:h-[420px] lg:h-[530px] flex items-center justify-center">
        <Image
          src={selectedImage}
          alt="Selected product view"
          fill
          priority
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}

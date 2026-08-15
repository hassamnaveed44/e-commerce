"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImagesProps {
  images: { url: string }[];
  productName: string;
}

export default function ProductImages({ images, productName }: ProductImagesProps) {
  const imageList = images && images.length > 0
    ? images.map((img) => img.url)
    : ["/images/product-1.png"];

  const [selectedImage, setSelectedImage] = useState(imageList[0]);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3.5 items-start w-full">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-3.5 w-full lg:w-[152px] justify-start shrink-0 overflow-x-auto">
        {imageList.map((img, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedImage(img)}
            className={`relative bg-[#F0EEED] rounded-[20px] overflow-hidden w-[100px] sm:w-[120px] lg:w-[152px] h-[106px] sm:h-[120px] lg:h-[167px] transition-all duration-200 cursor-pointer shrink-0 ${
              selectedImage === img
                ? "border-2 border-black"
                : "border border-transparent hover:border-black/20"
            }`}
          >
            <Image
              src={img}
              alt={`${productName} thumbnail ${index + 1}`}
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
          alt={productName}
          fill
          priority
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";

export default function OrderSummary() {
  const [promoCode, setPromoCode] = useState("");

  const subtotal = 565;
  const discount = 113; // 20%
  const deliveryFee = 15;
  const total = subtotal - discount + deliveryFee;

  return (
    <div className="border border-black/10 rounded-[20px] p-5 sm:p-6 bg-white font-satoshi shadow-xs">
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-black mb-5 sm:mb-6 font-satoshi">
        Order Summary
      </h2>

      {/* Summary Rows */}
      <div className="space-y-4 text-black/60 text-base mb-5">
        <div className="flex justify-between items-center">
          <span>Subtotal</span>
          <span className="font-bold text-black">${subtotal}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Discount (-20%)</span>
          <span className="font-bold text-[#FF3333]">-${discount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Delivery Fee</span>
          <span className="font-bold text-black">${deliveryFee}</span>
        </div>
      </div>

      <hr className="border-t border-black/10 mb-5" />

      {/* Total Row */}
      <div className="flex justify-between items-center text-lg font-bold text-black mb-6">
        <span>Total</span>
        <span className="text-2xl font-bold text-black">${total}</span>
      </div>

      {/* Promo Code Input & Apply Button */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Tag size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
          <input
            type="text"
            placeholder="Add promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="w-full bg-[#F0F0F0] rounded-full pl-10 pr-4 py-3 text-sm text-black placeholder:text-black/40 outline-none"
          />
        </div>
        <button 
          type="button"
          className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-black/80 transition-colors cursor-pointer shrink-0"
        >
          Apply
        </button>
      </div>

      {/* Checkout Link Button */}
      <Link 
        href="/checkout"
        className="w-full bg-black text-white rounded-full py-4 font-medium hover:bg-black/80 transition-colors flex items-center justify-center gap-2 text-base font-satoshi cursor-pointer shadow-sm"
      >
        <span>Go to Checkout</span>
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}

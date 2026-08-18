"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag, ArrowRight, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function OrderSummary() {
  const {
    subtotal,
    discountAmount,
    deliveryFee,
    totalPrice,
    promoCode,
    promoDiscountPercent,
    promoLabel,
    applyPromoCode,
    removePromoCode,
    cartItems,
    isHydrated,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const success = applyPromoCode(inputCode);
    if (success) {
      setPromoMessage("Promo code applied successfully!");
      setInputCode("");
    } else {
      setPromoMessage("Invalid promo code. Try SHOP20 or REF10");
    }
  };

  const isCartEmpty = !isHydrated || cartItems.length === 0;

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
          <span className="font-bold text-black">${subtotal.toFixed(2)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between items-center">
            <span>Discount (-{promoDiscountPercent}%)</span>
            <span className="font-bold text-[#FF3333]">-${discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span>Delivery Fee</span>
          <span className="font-bold text-black">
            {deliveryFee === 0 && subtotal > 0 ? (
              <span className="text-emerald-600">FREE</span>
            ) : (
              `$${deliveryFee}`
            )}
          </span>
        </div>
      </div>

      <hr className="border-t border-black/10 mb-5" />

      {/* Total Row */}
      <div className="flex justify-between items-center text-lg font-bold text-black mb-6">
        <span>Total</span>
        <span className="text-2xl font-bold text-black">${totalPrice.toFixed(2)}</span>
      </div>

      {/* Active Promo Celebration Pill or Manual Promo Code Input */}
      {promoDiscountPercent > 0 ? (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <Tag size={15} className="text-emerald-600 shrink-0" />
            <span className="truncate">
              {promoLabel || `Code ${promoCode} Applied (-${promoDiscountPercent}%)`}
            </span>
          </div>
          <button
            type="button"
            onClick={removePromoCode}
            className="text-emerald-700 hover:text-rose-600 hover:underline text-[11px] font-bold shrink-0 cursor-pointer"
            title="Remove Promo Code"
          >
            Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleApplyPromo} className="flex items-center gap-3 mb-3">
          <div className="relative flex-1">
            <Tag size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              placeholder="Add promo code (e.g. SHOP20)"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-[#F0F0F0] rounded-full pl-10 pr-4 py-3 text-sm text-black placeholder:text-black/40 outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-black/80 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            Apply
          </button>
        </form>
      )}

      {promoMessage && (
        <p
          className={`text-xs mb-4 font-medium ${
            promoDiscountPercent > 0 ? "text-emerald-600" : "text-[#FF3333]"
          }`}
        >
          {promoMessage}
        </p>
      )}

      {/* Checkout Link Button */}
      <Link
        href={isCartEmpty ? "#" : "/checkout"}
        className={`w-full rounded-full py-4 font-medium transition-colors flex items-center justify-center gap-2 text-base font-satoshi shadow-sm ${isCartEmpty
            ? "bg-black/20 text-white cursor-not-allowed pointer-events-none"
            : "bg-black text-white hover:bg-black/80 cursor-pointer"
          }`}
      >
        <span>Go to Checkout</span>
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}

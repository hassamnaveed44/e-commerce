"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartItemsList() {
  const { cartItems, updateQuantity, removeItem, isLoading, isHydrated } = useCart();

  if (!isHydrated || (isLoading && cartItems.length === 0)) {
    return (
      <div className="border border-black/10 rounded-[20px] p-8 bg-white text-center font-satoshi animate-pulse">
        <p className="text-black/40">Loading your cart items...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="border border-black/10 rounded-[20px] p-8 sm:p-12 bg-white flex flex-col items-center justify-center text-center font-satoshi">
        <div className="w-16 h-16 bg-[#F0F0F0] rounded-full flex items-center justify-center mb-4 text-black/40">
          <ShoppingBag size={32} />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">Your cart is currently empty</h3>
        <p className="text-sm text-black/60 mb-6 max-w-md">
          Explore our latest collection and find styles that match your personality.
        </p>
        <Link
          href="/"
          className="bg-black text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-black/80 transition cursor-pointer"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-black/10 rounded-[20px] p-4 sm:p-6 bg-white flex flex-col divide-y divide-black/10">
      {cartItems.map((item) => (
        <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 sm:gap-6 items-center">
          {/* Product Image */}
          <Link
            href={`/shop/product/${item.slug || item.productId}`}
            className="relative bg-[#F0EEED] rounded-[16px] w-20 h-20 sm:w-28 sm:h-28 overflow-hidden shrink-0 block group"
          >
            <Image
              src={item.image || "/images/product-1.png"}
              alt={item.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition duration-300"
            />
          </Link>

          {/* Product Details */}
          <div className="flex-1 flex flex-col justify-between h-full font-satoshi">
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href={`/shop/product/${item.slug || item.productId}`}
                  className="font-bold text-base sm:text-lg text-black mb-1 hover:underline line-clamp-1 block"
                >
                  {item.name}
                </Link>
                {/* Size */}
                <p className="text-xs sm:text-sm text-black mb-0.5">
                  Size: <span className="text-black/60">{item.size}</span>
                </p>
                {/* Color */}
                <p className="text-xs sm:text-sm text-black flex items-center gap-1.5">
                  Color: <span className="text-black/60">{item.colorName}</span>
                  {item.colorHex && (
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: item.colorHex }}
                    />
                  )}
                </p>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-[#FF3333] hover:opacity-75 transition-opacity p-1 cursor-pointer"
                aria-label="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Price and Quantity Controls */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-2xl font-bold text-black">
                  ${item.price}
                </span>
                {item.originalPrice && (
                  <span className="text-sm sm:text-base font-bold text-black/40 line-through">
                    ${item.originalPrice}
                  </span>
                )}
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center justify-between bg-[#F0F0F0] rounded-full px-3 py-1.5 w-[100px] sm:w-[120px]">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, -1)}
                  className="text-black hover:opacity-60 transition-opacity cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="font-medium text-sm sm:text-base text-black select-none">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, 1)}
                  disabled={item.quantity >= item.stockQuantity}
                  className="text-black hover:opacity-60 transition-opacity cursor-pointer disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

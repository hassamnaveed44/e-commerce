"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  size: string;
  color: string;
  price: number;
  image: string;
  quantity: number;
}

const initialCartItems: CartItem[] = [
  {
    id: "1",
    name: "Gradient Graphic T-shirt",
    size: "Large",
    color: "White",
    price: 145,
    image: "/cart/cart1.png",
    quantity: 1,
  },
  {
    id: "2",
    name: "Checkered Shirt",
    size: "Medium",
    color: "Red",
    price: 180,
    image: "/cart/cart2.png",
    quantity: 1,
  },
  {
    id: "3",
    name: "Skinny Fit Jeans",
    size: "Large",
    color: "Blue",
    price: 240,
    image: "/cart/cart3.png",
    quantity: 1,
  },
];

export default function CartItemsList() {
  const [items, setItems] = useState<CartItem[]>(initialCartItems);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="border border-black/10 rounded-[20px] p-4 sm:p-6 bg-white flex flex-col divide-y divide-black/10">
      {items.length === 0 ? (
        <p className="text-center text-black/60 py-8 font-satoshi">Your cart is empty.</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 sm:gap-6 items-center">
            {/* Product Image */}
            <div className="relative bg-[#F0EEED] rounded-[16px] w-20 h-20 sm:w-28 sm:h-28 overflow-hidden shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover object-center"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1 flex flex-col justify-between h-full font-satoshi">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-black mb-1">
                    {item.name}
                  </h3>
                  {/* Size: Label in Black, Value in Gray */}
                  <p className="text-xs sm:text-sm text-black mb-0.5">
                    Size: <span className="text-black/60">{item.size}</span>
                  </p>
                  {/* Color: Label in Black, Value in Gray */}
                  <p className="text-xs sm:text-sm text-black">
                    Color: <span className="text-black/60">{item.color}</span>
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

              {/* Price and Counter */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg sm:text-2xl font-bold text-black">
                  ${item.price}
                </span>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between bg-[#F0F0F0] rounded-full px-3 py-1.5 w-[100px] sm:w-[120px]">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, -1)}
                    className="text-black hover:opacity-60 transition-opacity cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-medium text-sm sm:text-base text-black">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)}
                    className="text-black hover:opacity-60 transition-opacity cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

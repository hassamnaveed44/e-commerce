"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Truck, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock checkout items
  const items = [
    { id: 1, name: "Gradient Graphic T-shirt", size: "Large", color: "White", price: 145, image: "/images/product-1.png", quantity: 1 },
    { id: 2, name: "Checkered Shirt", size: "Medium", color: "Red", price: 180, image: "/images/product-3.png", quantity: 1 },
  ];

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = Math.round(subtotal * 0.2);
  const deliveryFee = shippingMethod === "express" ? 25 : 15;
  const total = subtotal - discount + deliveryFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/order-confirmation");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white font-satoshi py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-black/60 mb-6 sm:mb-8">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-black transition">Cart</Link>
          <span>/</span>
          <span className="text-black font-medium">Checkout</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-sans text-black mb-8">
          Checkout
        </h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Shipping & Payment Info */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Contact & Shipping Address */}
            <div className="border border-black/10 rounded-[20px] p-5 sm:p-7 bg-white">
              <h2 className="text-xl font-bold text-black mb-5">1. Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1.5">First Name</label>
                  <input required type="text" placeholder="Alex" className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1.5">Last Name</label>
                  <input required type="text" placeholder="Morgan" className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-black/70 mb-1.5">Street Address</label>
                  <input required type="text" placeholder="123 Fashion Ave, Suite 400" className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1.5">City</label>
                  <input required type="text" placeholder="New York" className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1.5">Postal Code</label>
                  <input required type="text" placeholder="10001" className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-black/70 mb-1.5">Phone Number</label>
                  <input required type="tel" placeholder="+1 (555) 019-2834" className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none" />
                </div>
              </div>
            </div>

            {/* 2. Delivery Method */}
            <div className="border border-black/10 rounded-[20px] p-5 sm:p-7 bg-white">
              <h2 className="text-xl font-bold text-black mb-5">2. Delivery Option</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => setShippingMethod("standard")}
                  className={`flex items-start gap-3 p-4 rounded-[16px] border cursor-pointer transition ${
                    shippingMethod === "standard" ? "border-black bg-[#F0F0F0]/50" : "border-black/10"
                  }`}
                >
                  <Truck className="shrink-0 mt-0.5 text-black" size={20} />
                  <div className="flex-1">
                    <div className="flex justify-between font-bold text-sm text-black">
                      <span>Standard Delivery</span>
                      <span>$15</span>
                    </div>
                    <p className="text-xs text-black/60 mt-1">Estimated 3-5 Business Days</p>
                  </div>
                </label>

                <label
                  onClick={() => setShippingMethod("express")}
                  className={`flex items-start gap-3 p-4 rounded-[16px] border cursor-pointer transition ${
                    shippingMethod === "express" ? "border-black bg-[#F0F0F0]/50" : "border-black/10"
                  }`}
                >
                  <Truck className="shrink-0 mt-0.5 text-black" size={20} />
                  <div className="flex-1">
                    <div className="flex justify-between font-bold text-sm text-black">
                      <span>Express Shipping</span>
                      <span>$25</span>
                    </div>
                    <p className="text-xs text-black/60 mt-1">Estimated 1-2 Business Days</p>
                  </div>
                </label>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="border border-black/10 rounded-[20px] p-5 sm:p-7 bg-white">
              <h2 className="text-xl font-bold text-black mb-5">3. Payment Method</h2>
              
              <div className="space-y-3 mb-6">
                <label
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-3 p-4 rounded-[16px] border cursor-pointer transition ${
                    paymentMethod === "card" ? "border-black bg-[#F0F0F0]/50" : "border-black/10"
                  }`}
                >
                  <CreditCard size={20} className="text-black" />
                  <span className="text-sm font-medium text-black">Credit / Debit Card (Stripe Secured)</span>
                </label>
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center gap-3 p-4 rounded-[16px] border cursor-pointer transition ${
                    paymentMethod === "cod" ? "border-black bg-[#F0F0F0]/50" : "border-black/10"
                  }`}
                >
                  <ShieldCheck size={20} className="text-black" />
                  <span className="text-sm font-medium text-black">Cash on Delivery</span>
                </label>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4 pt-2 border-t border-black/10">
                  <div>
                    <label className="block text-xs font-medium text-black/70 mb-1.5">Card Number</label>
                    <input required type="text" placeholder="4242 •••• •••• 4242" className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-black/70 mb-1.5">Expiry Date</label>
                      <input required type="text" placeholder="MM / YY" className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-black/70 mb-1.5">CVC / CVV</label>
                      <input required type="text" placeholder="123" className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="border border-black/10 rounded-[20px] p-5 sm:p-7 bg-white sticky top-28">
              <h2 className="text-xl font-bold text-black mb-5">Order Review</h2>
              
              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-2">
                    <div className="relative w-16 h-16 rounded-[12px] bg-[#F0EEED] overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-black leading-tight">{item.name}</h4>
                      <p className="text-xs text-black/60 mt-0.5">Size: {item.size} | Color: {item.color}</p>
                      <span className="text-xs text-black/60">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-sm text-black">${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <hr className="border-t border-black/10 mb-5" />

              {/* Cost Rows */}
              <div className="space-y-3 text-sm text-black/60 mb-5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount (-20%)</span>
                  <span className="font-bold text-[#FF3333]">-${discount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-black">${deliveryFee}</span>
                </div>
                <hr className="border-t border-black/10 my-3" />
                <div className="flex justify-between text-base font-bold text-black">
                  <span>Total</span>
                  <span className="text-xl">${total}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white rounded-full py-4 font-medium hover:bg-black/80 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Processing Order..." : `Pay $${total} & Place Order`}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}

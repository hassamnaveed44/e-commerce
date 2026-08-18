"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Truck, Banknote, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@clerk/nextjs";

// Hydration-safe client check
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const isClient = useIsClient();
  const { user } = useUser();
  const { cartItems, subtotal, discountAmount, promoCode, promoDiscountPercent, clearCart, isLoading } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD">("COD");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const effectiveFirstName = firstName || user?.firstName || "";
  const effectiveLastName = lastName || user?.lastName || "";
  const effectiveEmail = email || user?.primaryEmailAddress?.emailAddress || "";

  const deliveryFee = shippingMethod === "express" ? 25 : subtotal >= 100 ? 0 : 15;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty. Please add items before checking out.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: `${effectiveFirstName.trim()} ${effectiveLastName.trim()}`.trim(),
        email: effectiveEmail.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        paymentMethod,
        shippingMethod,
        promoCode: promoCode || undefined,
        items: cartItems.map((i) => ({
          variantId: i.variantId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      };

      // Route to Stripe checkout for CARD payments, or internal orders API for COD
      const endpoint = paymentMethod === "CARD" ? "/api/checkout/stripe" : "/api/orders";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to process order.");
        setIsSubmitting(false);
        return;
      }

      // Clear local cart
      clearCart();

      // If Card payment, redirect to Stripe Hosted Checkout URL
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      // If COD, redirect to Order Confirmation page
      router.push(`/order-confirmation?orderId=${data.orderId}`);
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      const msg = err instanceof Error ? err.message : "A network error occurred. Please try again.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  // Wait for client mount to prevent any SSR vs LocalStorage hydration mismatch
  if (!isClient || isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-satoshi">
        <Loader2 size={32} className="animate-spin text-black" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-white font-satoshi flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-black mb-3">Your cart is empty</h2>
        <p className="text-black/60 mb-6">Add items to your cart before proceeding to checkout.</p>
        <Link
          href="/"
          className="bg-black text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-black/80 transition cursor-pointer"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-satoshi py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10">
        {/* Breadcrumb */}
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

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle size={20} className="shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Shipping & Payment */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Shipping Address */}
            <div className="border border-black/10 rounded-[20px] p-5 sm:p-7 bg-white">
              <h2 className="text-xl font-bold text-black mb-5">1. Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1.5">First Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Alex"
                    value={effectiveFirstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1.5">Last Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Morgan"
                    value={effectiveLastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-black/70 mb-1.5">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="alex@example.com"
                    value={effectiveEmail}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-black/70 mb-1.5">Street Address</label>
                  <input
                    required
                    type="text"
                    placeholder="123 Fashion Ave, Suite 400"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1.5">City</label>
                  <input
                    required
                    type="text"
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1.5">Postal Code</label>
                  <input
                    required
                    type="text"
                    placeholder="10001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-black/70 mb-1.5">Phone Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Option */}
            <div className="border border-black/10 rounded-[18px] p-4 sm:p-5 bg-white">
              <h2 className="text-base sm:text-lg font-bold text-black mb-3">2. Delivery Option</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setShippingMethod("standard")}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer text-left transition ${
                    shippingMethod === "standard" ? "border-black bg-[#F0F0F0]/60 ring-1 ring-black" : "border-black/10 hover:border-black/30"
                  }`}
                >
                  <Truck className="shrink-0 text-black" size={18} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-black">
                      <span>Standard Delivery</span>
                      <span className="font-extrabold">{subtotal >= 100 ? "FREE" : "$15"}</span>
                    </div>
                    <p className="text-[11px] text-black/60 mt-0.5">3-5 business days</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod("express")}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer text-left transition ${
                    shippingMethod === "express" ? "border-black bg-[#F0F0F0]/60 ring-1 ring-black" : "border-black/10 hover:border-black/30"
                  }`}
                >
                  <Truck className="shrink-0 text-black" size={18} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-black">
                      <span>Express Shipping</span>
                      <span className="font-extrabold">$25</span>
                    </div>
                    <p className="text-[11px] text-black/60 mt-0.5">1-2 business days</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="border border-black/10 rounded-[18px] p-4 sm:p-5 bg-white">
              <h2 className="text-base sm:text-lg font-bold text-black mb-3">3. Payment Method</h2>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border cursor-pointer transition ${
                    paymentMethod === "COD" ? "border-black bg-[#F0F0F0]/60 ring-1 ring-black" : "border-black/10 hover:border-black/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote size={19} className="text-black shrink-0" />
                    <div className="text-left">
                      <p className="font-bold text-xs sm:text-sm text-black">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-black/60">Pay with cash upon delivery at your doorstep</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "COD" ? "border-black" : "border-black/30"}`}>
                    {paymentMethod === "COD" && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border cursor-pointer transition ${
                    paymentMethod === "CARD" ? "border-black bg-[#F0F0F0]/60 ring-1 ring-black" : "border-black/10 hover:border-black/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={19} className="text-black shrink-0" />
                    <div className="text-left">
                      <p className="font-bold text-xs sm:text-sm text-black">Credit / Debit Card</p>
                      <p className="text-[11px] text-black/60">Secure checkout powered by Stripe</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "CARD" ? "border-black" : "border-black/30"}`}>
                    {paymentMethod === "CARD" && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="border border-black/10 rounded-[20px] p-5 sm:p-7 bg-white sticky top-28 space-y-6">
              <h2 className="text-xl font-bold text-black">Order Summary</h2>

              {/* Items List */}
              <div className="divide-y divide-black/10 max-h-80 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4">
                    <div className="relative w-16 h-16 bg-[#F0EEED] rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={item.image || "/images/product-1.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-black truncate">{item.name}</h4>
                      <p className="text-xs text-black/60">
                        {item.size} • {item.colorName} • Qty: {item.quantity}
                      </p>
                      <p className="font-bold text-sm text-black mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-t border-black/10" />

              {/* Price Calculation */}
              <div className="space-y-3 text-sm text-black/60">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#FF3333]">
                    <span>Discount (-{promoDiscountPercent}%)</span>
                    <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-black">
                    {deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : `$${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-black pt-2 border-t border-black/10">
                  <span>Total</span>
                  <span className="text-xl">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white rounded-full py-4 font-medium hover:bg-black/80 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : paymentMethod === "CARD" ? (
                  `Pay with Card • $${total.toFixed(2)}`
                ) : (
                  `Place Order • $${total.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

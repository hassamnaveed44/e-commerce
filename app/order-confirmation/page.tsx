"use client";

import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

export default function OrderConfirmationPage() {
  const orderNumber = "ORD-892341";

  return (
    <div className="min-h-[80vh] bg-white font-satoshi py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full text-center space-y-6">
        
        {/* Animated Check Icon */}
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 size={44} />
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-sans text-black">
            Order Confirmed!
          </h1>
          <p className="text-black/60 text-sm sm:text-base mt-2">
            Thank you for your purchase. We have received your order and are currently processing it.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#F0F0F0]/60 border border-black/10 rounded-[20px] p-6 text-left space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-black/60">Order Number:</span>
            <span className="font-bold text-black">{orderNumber}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-black/60">Estimated Delivery:</span>
            <span className="font-bold text-black">3 - 5 Business Days</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-black/60">Payment Status:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Paid (Stripe)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/account"
            className="flex-1 bg-white border border-black/15 text-black rounded-full py-3.5 text-sm font-medium hover:bg-black/5 transition flex items-center justify-center gap-2"
          >
            <Package size={18} />
            <span>View Order History</span>
          </Link>
          <Link
            href="/"
            className="flex-1 bg-black text-white rounded-full py-3.5 text-sm font-medium hover:bg-black/80 transition flex items-center justify-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Package, ArrowRight, Loader2, MapPin, CreditCard } from "lucide-react";

interface OrderData {
  id: string;
  orderNumber: string;
  orderStatus: string;
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  createdAt: string;
  shippingAddress: {
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
  };
  payment: {
    paymentMethod: string;
    status: string;
    amountPaid: number;
  } | null;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    image: string;
  }[];
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      if (!orderId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          if (isMounted) setIsLoading(false);
          return;
        }
        const data = await res.json();
        if (isMounted && data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Order fetch error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-black" />
      </div>
    );
  }

  const orderNumber = order?.orderNumber || "ORD-RECENT";

  return (
    <div className="min-h-[80vh] bg-white font-satoshi py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-6">
        {/* Animated Check Icon */}
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 size={44} />
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-sans text-black">
            Order Confirmed!
          </h1>
          <p className="text-black/60 text-sm sm:text-base mt-2">
            Thank you for your purchase! We have received your order and are currently processing it.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#F9F9F9] border border-black/10 rounded-[24px] p-6 sm:p-8 text-left space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-black/10">
            <div>
              <p className="text-xs text-black/60">Order Number</p>
              <p className="font-bold text-base sm:text-lg text-black">{orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-black/60">Status</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 capitalize">
                {order?.orderStatus?.toLowerCase() || "Processing"}
              </span>
            </div>
          </div>

          {/* Itemized list */}
          {order?.items && order.items.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-black/60">
                Purchased Items ({order.items.length})
              </p>
              <div className="divide-y divide-black/5 max-h-60 overflow-y-auto">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center gap-3">
                    <div className="relative w-12 h-12 bg-[#F0EEED] rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-black truncate">{item.productName}</p>
                      <p className="text-xs text-black/60">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm text-black">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Address & Payment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-black/10 text-sm">
            {order?.shippingAddress && (
              <div className="p-4 bg-white rounded-xl border border-black/5 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-black">
                  <MapPin size={16} />
                  <span>Delivery Address</span>
                </div>
                <p className="text-black/60 text-xs">{order.shippingAddress.streetAddress}</p>
                <p className="text-black/60 text-xs">
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p className="text-black/60 text-xs">{order.shippingAddress.phoneNumber}</p>
              </div>
            )}

            <div className="p-4 bg-white rounded-xl border border-black/5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-black">
                <CreditCard size={16} />
                <span>Payment</span>
              </div>
              <p className="text-black/80 font-medium">
                {order?.payment?.paymentMethod === "COD" ? "Cash on Delivery" : "Card Payment"}
              </p>
              <p className="text-black/60 text-xs">
                Total Paid/Due: <span className="font-bold text-black">${order?.totalAmount?.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/account"
            className="flex-1 bg-white border border-black/15 text-black rounded-full py-3.5 text-sm font-medium hover:bg-black/5 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Package size={18} />
            <span>View Order History</span>
          </Link>
          <Link
            href="/"
            className="flex-1 bg-black text-white rounded-full py-3.5 text-sm font-medium hover:bg-black/80 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-black" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}

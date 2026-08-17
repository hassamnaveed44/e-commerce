"use client";

import { useState } from "react";
import {
  X,
  Printer,
  Mail,
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  Phone,
  Calendar,
  Clock,
  Loader2,
  Tag,
} from "lucide-react";

export interface ReceiptOrder {
  id: string; // Order Number e.g. ORD-123456-7890
  orderId?: string; // DB UUID
  date: string;
  time?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus?: string;
  transactionId?: string;
  shippingAddress: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    formatted?: string;
  };
  items: {
    id?: string;
    name: string;
    size?: string;
    color?: string;
    qty: number;
    price: number;
    image?: string;
  }[];
}

interface OrderReceiptModalProps {
  order: ReceiptOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderReceiptModal({ order, isOpen, onClose }: OrderReceiptModalProps) {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleResendEmail = async () => {
    if (!order.orderId && !order.id) return;
    setIsSendingEmail(true);
    setEmailStatus(null);

    try {
      const targetId = order.orderId || order.id;
      const res = await fetch(`/api/orders/${targetId}/resend-email`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus("Invoice sent to your email!");
      } else {
        setEmailStatus(data.message || "Failed to send email");
      }
    } catch {
      setEmailStatus("Error sending email");
    } finally {
      setIsSendingEmail(false);
      setTimeout(() => setEmailStatus(null), 4000);
    }
  };

  const formattedAddress =
    order.shippingAddress?.formatted ||
    [
      order.shippingAddress?.street,
      order.shippingAddress?.city,
      order.shippingAddress?.state,
      order.shippingAddress?.postalCode,
      order.shippingAddress?.country || "United States",
    ]
      .filter(Boolean)
      .join(", ");

  const isCod =
    order.paymentMethod?.toLowerCase().includes("cash") ||
    order.paymentMethod === "COD";

  const isPaid =
    !isCod &&
    (order.status === "PROCESSING" ||
      order.status === "DELIVERED" ||
      order.paymentStatus === "SUCCESSFUL");

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto font-satoshi"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Print Specific Styling */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-order-slip,
          #printable-order-slip * {
            visibility: visible !important;
          }
          #printable-order-slip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Container */}
      <div
        id="printable-order-slip"
        className="w-full max-w-2xl bg-white text-black rounded-2xl sm:rounded-3xl shadow-2xl border border-black/10 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 text-left"
      >
        {/* Header Bar */}
        <div className="bg-black text-white p-5 sm:p-6 flex items-start justify-between relative shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black font-integral tracking-tight">SHOP.CO</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">
                Official Invoice
              </span>
            </div>
            <p className="text-xs text-white/70 mt-1">
              Order #{order.id} • Issued on {order.date} {order.time ? `at ${order.time}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="no-print w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Status & Payment Overview Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Order Status</p>
                <p className="text-sm font-bold text-gray-900 capitalize">
                  {order.status.replace(/_/g, " ").toLowerCase()}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Payment Method</p>
              <p className="text-xs font-bold text-gray-900">
                {order.paymentMethod} {isPaid ? "(Paid)" : isCod ? "(Cash Due on Delivery)" : "(Pending)"}
              </p>
              {order.transactionId && (
                <p className="text-[10px] text-gray-400 font-mono">ID: {order.transactionId.slice(-10)}</p>
              )}
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Customer Info */}
            <div className="p-3.5 rounded-xl border border-gray-100 bg-white space-y-1.5">
              <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Customer Details</p>
              <p className="font-bold text-sm text-gray-900">{order.customerName}</p>
              <p className="text-gray-600 flex items-center gap-1.5">
                <Mail size={12} className="text-gray-400" />
                <span>{order.customerEmail}</span>
              </p>
              {order.customerPhone && (
                <p className="text-gray-600 flex items-center gap-1.5">
                  <Phone size={12} className="text-gray-400" />
                  <span>{order.customerPhone}</span>
                </p>
              )}
            </div>

            {/* Shipping Address */}
            <div className="p-3.5 rounded-xl border border-gray-100 bg-white space-y-1.5">
              <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Shipping Destination</p>
              <p className="text-gray-700 leading-relaxed flex items-start gap-1.5">
                <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                <span>{formattedAddress || "Standard Shipping Address"}</span>
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold pl-4">Standard Delivery (3-5 Days)</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <p className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2.5">
              Purchased Items ({order.items?.length || 0})
            </p>
            <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs">
              <div className="bg-gray-50 p-2.5 grid grid-cols-12 font-bold text-gray-500 uppercase text-[10px]">
                <span className="col-span-7">Item Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-right">Price</span>
              </div>

              {order.items?.map((item, idx) => (
                <div key={idx} className="p-3 grid grid-cols-12 items-center text-gray-800">
                  <div className="col-span-7 pr-2">
                    <p className="font-bold text-xs text-gray-900">{item.name}</p>
                    {(item.size || item.color) && (
                      <p className="text-[11px] text-gray-500">
                        Variant: {[item.size, item.color].filter(Boolean).join(" / ")}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 text-center font-semibold text-gray-600">x{item.qty}</div>
                  <div className="col-span-3 text-right font-bold text-gray-900">
                    ${(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">${order.subtotal.toFixed(2)}</span>
            </div>

            {order.discount && order.discount > 0 ? (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  <span>Discount / Promo Savings</span>
                </span>
                <span className="font-bold">-${order.discount.toFixed(2)}</span>
              </div>
            ) : null}

            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-900">
                {order.deliveryFee === 0 ? "FREE" : `$${order.deliveryFee.toFixed(2)}`}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm sm:text-base font-extrabold text-gray-900">
              <span>Total Amount Paid</span>
              <span className="text-lg sm:text-xl font-black">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Email Toast Feedback */}
          {emailStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold text-center animate-in fade-in">
              {emailStatus}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="no-print p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-gray-400">All prices in USD. Thank you for shopping with SHOP.CO!</p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={isSendingEmail}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {isSendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              <span>Email Receipt</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-black text-white hover:bg-black/80 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

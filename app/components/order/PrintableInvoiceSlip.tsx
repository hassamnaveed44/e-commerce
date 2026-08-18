"use client";

import { useState } from "react";
import { Printer, Mail, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface InvoiceOrderData {
  id: string; // Database ID or Order Number
  orderNumber: string;
  createdAt: string;
  orderStatus: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  customer: {
    name: string;
    email: string;
    phone?: string | null;
  };
  shippingAddress: {
    fullName?: string;
    streetAddress: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phoneNumber?: string | null;
  } | null;
  items: {
    id?: string;
    productName: string;
    productImage?: string;
    size?: string;
    colorName?: string;
    colorHex?: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
  }[];
}

interface PrintableInvoiceSlipProps {
  order: InvoiceOrderData;
  onClose?: () => void;
  isModal?: boolean;
}

export default function PrintableInvoiceSlip({
  order,
  onClose,
}: PrintableInvoiceSlipProps) {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleResendEmail = async () => {
    if (!order.id) return;
    setIsSendingEmail(true);
    setEmailStatus(null);

    try {
      const res = await fetch(`/api/orders/${order.id}/resend-email`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus("Invoice sent to customer email!");
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

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isCod =
    order.paymentMethod?.toLowerCase().includes("cash") || order.paymentMethod === "COD";

  const fulfillmentType = order.deliveryFee > 0 ? "Express Courier" : "Standard Delivery";

  const discountAmount = Math.max(0, order.subtotal + order.deliveryFee - order.totalAmount);

  return (
    <div
      id="official-invoice-modal-overlay"
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-satoshi"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {/* 🖨️ Bulletproof Print Stylesheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm;
          }
          html,
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide the whole page except this overlay & slip */
          body > * {
            visibility: hidden !important;
          }
          #official-invoice-modal-overlay,
          #official-invoice-modal-overlay * {
            visibility: visible !important;
          }
          #official-invoice-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          #official-invoice-slip {
            position: relative !important;
            width: 100% !important;
            max-width: 540px !important;
            margin: 0 auto !important;
            padding: 24px 28px !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 16px !important;
            background-color: #ffffff !important;
            box-shadow: none !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-box-bg {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* 📄 Invoice Slip Container (Screenshot 4 design) */}
      <div
        id="official-invoice-slip"
        className="w-full max-w-[520px] bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-7 my-auto text-left relative overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
      >
        {/* On-Screen Action Header (Hidden on Print) */}
        <div className="no-print flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-black text-white hover:bg-black/80 rounded-xl text-xs font-bold gap-1.5 h-8 px-3 cursor-pointer shadow-xs"
            >
              <Printer size={13} />
              <span>Print / Save as PDF</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isSendingEmail}
              onClick={handleResendEmail}
              className="rounded-xl text-xs font-semibold gap-1.5 h-8 px-3 cursor-pointer border-slate-200"
            >
              {isSendingEmail ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Mail size={13} />
              )}
              <span>Email Customer</span>
            </Button>

            {emailStatus && (
              <span className="text-[11px] font-semibold text-emerald-600 animate-in fade-in">
                ✓ {emailStatus}
              </span>
            )}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              title="Close"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* 1️⃣ Centered Brand Header (Exact match to Screenshot 4) */}
        <div className="text-center pb-4 mb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black font-integral tracking-tight text-slate-950 uppercase">
            SHOP.CO
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Official Digital Tax Invoice & Order Slip
          </p>
        </div>

        {/* 2️⃣ Meta Details Grid (2 Columns, 4 Items) */}
        <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 mb-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Order Reference</span>
            <span className="font-bold text-slate-950 text-xs font-mono tracking-tight">
              #{order.orderNumber}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Date Issued</span>
            <span className="font-bold text-slate-950 text-xs">{formattedDate}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Billed To</span>
            <span className="font-bold text-slate-950 text-xs truncate block">
              {order.customer.name}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block text-[11px]">Fulfillment Type</span>
            <span className="font-bold text-slate-950 text-xs truncate block">
              {fulfillmentType}
            </span>
          </div>
        </div>

        {/* 3️⃣ Shipping Destination Box */}
        <div className="print-box-bg bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Shipping Destination
          </span>
          {order.shippingAddress ? (
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {order.shippingAddress.streetAddress}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.state && order.shippingAddress.state !== "N/A"
                ? `${order.shippingAddress.state}, `
                : ""}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              {order.customer.phone ? ` · Tel: ${order.customer.phone}` : ""}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">No physical delivery address recorded.</p>
          )}
        </div>

        {/* 4️⃣ Ordered Products Section */}
        <div className="mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
            ORDERED PRODUCTS ({order.items.length})
          </span>

          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="print-box-bg bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.productImage && (
                    <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center relative">
                      {/* Standard img tag guarantees crisp print output in all browsers */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{item.productName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.size ? `Size: ${item.size}` : ""}
                      {item.size && item.colorName ? " · " : ""}
                      {item.colorName ? `Color: ${item.colorName}` : ""}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-xs text-slate-900 font-mono">
                    ${(item.totalPrice || item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5️⃣ Financial Breakdown & Totals */}
        <div className="border-t border-slate-200 pt-3 space-y-1.5 mb-4">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Subtotal</span>
            <span className="font-mono font-medium">${order.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-xs text-slate-600">
            <span>Estimated Shipping</span>
            <span className="font-mono font-medium">
              {order.deliveryFee > 0 ? `$${order.deliveryFee.toFixed(2)}` : "$0.00"}
            </span>
          </div>

          {discountAmount > 0.01 && (
            <div className="flex justify-between text-xs text-emerald-600 font-medium">
              <span>Promo / Discount</span>
              <span className="font-mono">-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t border-dashed border-slate-300 pt-2.5 mt-2 flex justify-between items-center">
            <span className="text-sm font-black text-slate-950 uppercase tracking-tight">
              Total Due
            </span>
            <span className="text-base font-black text-indigo-600 font-mono">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 6️⃣ Footer Note */}
        <div className="text-center border-t border-slate-100 pt-3">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Thank you for shopping with <strong>SHOP.CO</strong>! For support, contact{" "}
            <strong>support@shop.co</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

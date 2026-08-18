"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Edit2,
  Check,
  Truck,
  Package,
  Clock,
  CreditCard,
  Building,
  RefreshCw,
  X,
  MapPin,
  Mail,
  User,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItemProduct {
  id: string;
  productVariantId: string;
  productId: string | null;
  productName: string;
  productSlug: string | null;
  productImage: string;
  size: string;
  colorName: string;
  colorHex: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

interface OrderDetailData {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  orderStatus: "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED_REFUSED";
  paymentMethod: "CARD" | "COD";
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  customer: {
    id: string | null;
    name: string;
    email: string;
    phone: string | null;
  };
  shippingAddress: {
    fullName?: string;
    streetAddress: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phoneNumber?: string;
  } | null;
  payment: {
    id: string;
    status: "PENDING" | "SUCCESSFUL" | "FAILED" | "REFUNDED";
    amountPaid: number;
    transactionId?: string | null;
    paymentMethod: string;
  } | null;
  itemsCount: number;
  items: OrderItemProduct[];
}

export default function OrderDetailView({ orderId }: { orderId?: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("PROCESSING");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      if (orderId) {
        const res = await fetch(`/api/admin/orders/${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          setNewStatus(data.order.orderStatus);
          setIsLoading(false);
          return;
        }
      }

      // If no orderId or not found, fetch latest order from list
      const allRes = await fetch(`/api/admin/orders`);
      const allData = await allRes.json();
      if (allData.success && allData.orders?.length > 0) {
        const found = orderId
          ? allData.orders.find(
              (o: any) => o.id === orderId || o.orderNumber === orderId
            ) || allData.orders[0]
          : allData.orders[0];
        setOrder(found);
        setNewStatus(found.orderStatus);
      }
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder((prev) => (prev ? { ...prev, orderStatus: newStatus as any } : null));
        setIsEditModalOpen(false);
        showToast(`Order updated to ${newStatus}!`);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-2 text-slate-400">
        <RefreshCw size={22} className="animate-spin text-slate-700 dark:text-slate-300" />
        <span className="text-xs">Loading order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          No order records found in your database.
        </p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold"
        >
          <ArrowLeft size={14} />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  // Delivery Steps Logic
  const statusSteps = [
    { key: "PROCESSING", label: "Processing", icon: Check },
    { key: "SHIPPED", label: "Shipped", icon: Truck },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
    { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
  ];

  let currentStepIdx = 0;
  if (order.orderStatus === "PENDING_PAYMENT" || order.orderStatus === "PROCESSING") {
    currentStepIdx = 0;
  } else if (order.orderStatus === "SHIPPED") {
    currentStepIdx = 1;
  } else if (order.orderStatus === "DELIVERED") {
    currentStepIdx = 3;
  }

  const formattedDate = new Date(order.createdAt).toISOString().split("T")[0];
  const formattedLongDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const fullAddress = order.shippingAddress
    ? `${order.shippingAddress.streetAddress}, ${order.shippingAddress.city}, ${order.shippingAddress.state || ""} ${order.shippingAddress.postalCode}`
    : "123 Main St, Anytown, AN 12345";

  return (
    <div className="space-y-6 pb-20 font-satoshi text-slate-900 dark:text-slate-100 max-w-6xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1️⃣ Top Actions Bar (Screenshot 1 Match) */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/orders"
          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 transition shadow-2xs"
          title="Back to Orders"
        >
          <ArrowLeft size={16} />
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Printer size={14} className="text-slate-500 dark:text-slate-400" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-slate-200 px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* 2️⃣ Top Grid: Order Info & Order Summary (Screenshot 1 Match) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Left Card: Order ORD-XXXXX & Customer Info (Col Span 6 or 7) */}
        <div className="md:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-6 shadow-xs space-y-5">
          {/* Order Header */}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Order {order.orderNumber}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-400 font-normal mt-1">
              Placed on {formattedDate}
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Customer Information
            </h3>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-medium text-slate-800 dark:text-slate-200">{order.customer.name}</p>
              <p>{order.customer.email}</p>
              <p className="text-slate-500 dark:text-slate-400">{fullAddress}</p>
            </div>
          </div>

          {/* Payment Method Sub-Box (Screenshot Match) */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200 block">
                Payment Method
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <CreditCard size={14} className="text-slate-400" />
                <span>
                  {order.paymentMethod === "CARD"
                    ? "Visa ending in **** 1234"
                    : "Cash on Delivery (COD)"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 transition cursor-pointer shadow-2xs"
              title="Edit Payment"
            >
              <Edit2 size={12} />
            </button>
          </div>
        </div>

        {/* Right Card: Order Summary (Col Span 6 or 5) */}
        <div className="md:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-5">
              Order Summary
            </h2>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                  ${order.deliveryFee.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Total
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 3️⃣ Delivery Status (Step Tracker - Screenshot 2 Match) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-6 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Delivery Status
        </h2>

        {/* Horizontal Stepper Progress */}
        <div className="relative pt-2 pb-2">
          {/* Progress Connecting Line */}
          <div className="absolute top-7 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-300"
              style={{
                width: `${(currentStepIdx / (statusSteps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* 4 Step Nodes */}
          <div className="relative z-10 flex items-center justify-between">
            {statusSteps.map((step, idx) => {
              const isCompletedOrCurrent = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const IconComp = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompletedOrCurrent
                        ? "bg-emerald-500 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <IconComp size={16} />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCompletedOrCurrent
                        ? "text-slate-900 dark:text-slate-100"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Pill Subtext */}
        <div className="pt-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              {order.orderStatus}
            </span>
            <span>on {formattedLongDate}</span>
          </span>
        </div>
      </div>

      {/* 4️⃣ Order Items Table (Screenshot 2 Match) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Order Items
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-2 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold text-center w-24">Quantity</th>
                <th className="py-3 px-4 font-semibold text-right w-28">Price</th>
                <th className="py-3 px-4 font-semibold text-right w-28">Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    {/* Product thumbnail + title (Clickable link to Product Detail) */}
                    <td className="py-3.5 px-2">
                      <Link
                        href={
                          item.productId
                            ? `/admin/products/${item.productId}`
                            : item.productSlug
                            ? `/admin/products/${item.productSlug}`
                            : `/admin/products`
                        }
                        className="flex items-center gap-3 group/item hover:opacity-90 transition"
                        title="View Product Details"
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/90 dark:border-slate-700 shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.productImage || "/images/product-1.png"}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover/item:underline block">
                            {item.productName}
                          </span>
                          {(item.size || item.colorName) && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-400">
                              Size: {item.size} • Color: {item.colorName}
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                      {item.quantity}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200 font-mono">
                      ${item.unitPrice.toFixed(2)}
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
                      ${item.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    No items found for this order.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🟢 Edit Status Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div className="w-full max-w-sm bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm">
                Update Order Status
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-semibold block text-slate-700 dark:text-slate-300">
                Order Delivery Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none font-semibold cursor-pointer"
              >
                <option value="PENDING_PAYMENT">Pending Payment</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="RETURNED_REFUSED">Returned</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-semibold"
              >
                {isUpdating ? "Saving..." : "Save Status"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

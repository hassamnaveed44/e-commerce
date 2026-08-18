"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Truck,
  Package,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  MapPin,
  User,
  Calendar,
  DollarSign,
  ChevronDown,
  Printer,
  ExternalLink,
  Mail,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PrintableInvoiceSlip from "@/app/components/order/PrintableInvoiceSlip";

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

interface OrderData {
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
    fullName: string;
    streetAddress: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
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

interface OrdersOverview {
  totalOrders: number;
  totalRevenue: number;
  pendingPaymentCount: number;
  processingCount: number;
  shippedCount: number;
  deliveredCount: number;
  cancelledCount: number;
}

const ORDER_STATUS_CONFIG = {
  PENDING_PAYMENT: {
    label: "Pending",
    color: "bg-amber-100 text-amber-900 border-amber-300",
    dot: "bg-amber-500",
    next: ["PROCESSING", "CANCELLED"],
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-sky-100 text-sky-900 border-sky-300",
    dot: "bg-sky-500",
    next: ["SHIPPED", "CANCELLED"],
  },
  SHIPPED: {
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-900 border-indigo-300",
    dot: "bg-indigo-500",
    next: ["DELIVERED", "RETURNED_REFUSED"],
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-900 border-emerald-300",
    dot: "bg-emerald-500",
    next: [],
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-rose-100 text-rose-900 border-rose-300",
    dot: "bg-rose-500",
    next: [],
  },
  RETURNED_REFUSED: {
    label: "Returned",
    color: "bg-gray-200 text-gray-800 border-gray-300",
    dot: "bg-gray-500",
    next: [],
  },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [overview, setOverview] = useState<OrdersOverview>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingPaymentCount: 0,
    processingCount: 0,
    shippedCount: 0,
    deliveredCount: 0,
    cancelledCount: 0,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOption, setSortOption] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTestEmail = async () => {
    const targetEmail = window.prompt("Enter an email address to send a live test notification:", "hassamnaveed44@gmail.com");
    if (!targetEmail) return;

    setIsTestingEmail(true);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Success: Test email sent to ${targetEmail}!\nCheck your inbox/spam folder.`);
        showToast(`Test email sent to ${targetEmail}`);
      } else {
        alert(`❌ Email Error:\n${data.error || data.message || "Failed to send test email"}`);
      }
    } catch (err: any) {
      alert(`Network error testing email: ${err?.message || err}`);
    } finally {
      setIsTestingEmail(false);
    }
  };

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (sortOption !== "newest") params.set("sort", sortOption);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
        setOverview(
          data.overview || {
            totalOrders: 0,
            totalRevenue: 0,
            pendingPaymentCount: 0,
            processingCount: 0,
            shippedCount: 0,
            deliveredCount: 0,
            cancelledCount: 0,
          }
        );

        // Update selected order if open
        if (selectedOrder) {
          const fresh = (data.orders || []).find((o: OrderData) => o.id === selectedOrder.id);
          if (fresh) setSelectedOrder(fresh);
        }
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, sortOption]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, orderStatus: newStatus as any } : o
          )
        );

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus as any } : null));
        }

        showToast(`Order status updated to ${newStatus}`);
        fetchOrders(true);
      } else {
        alert(data.error || "Failed to update order status");
      }
    } catch (err) {
      console.error("Update status error:", err);
      alert("An error occurred while updating status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q) ||
      o.shippingAddress?.city.toLowerCase().includes(q) ||
      o.shippingAddress?.streetAddress.toLowerCase().includes(q) ||
      o.items.some((item) => item.productName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 font-satoshi">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
            Order Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Process fulfillment, inspect item breakdown, and update shipment state transitions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleTestEmail}
            disabled={isTestingEmail}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Send a live test order confirmation email to verify SMTP delivery"
          >
            <Mail className={`h-3.5 w-3.5 text-blue-500 ${isTestingEmail ? "animate-bounce" : ""}`} />
            <span>{isTestingEmail ? "Testing SMTP..." : "Test Email Service"}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Orders"}</span>
          </button>
        </div>
      </div>

      {/* 1️⃣ KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Orders */}
        <Card
          onClick={() => setStatusFilter("ALL")}
          className={`p-4 bg-card border-border shadow-xs cursor-pointer transition ${
            statusFilter === "ALL" ? "ring-2 ring-black dark:ring-white border-black" : "hover:border-black/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Orders</span>
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-foreground">
              <ShoppingBag size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold font-sans text-foreground">
              {overview.totalOrders}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
              ${overview.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })} volume
            </p>
          </div>
        </Card>

        {/* Processing */}
        <Card
          onClick={() => setStatusFilter("PROCESSING")}
          className={`p-4 bg-card border-border shadow-xs cursor-pointer transition ${
            statusFilter === "PROCESSING" ? "ring-2 ring-sky-500 border-sky-500" : "hover:border-sky-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Processing</span>
            <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300 flex items-center justify-center">
              <Package size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className={`text-xl font-bold font-sans ${overview.processingCount > 0 ? "text-sky-600" : "text-foreground"}`}>
              {overview.processingCount}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Ready for packing & shipping
            </p>
          </div>
        </Card>

        {/* Shipped */}
        <Card
          onClick={() => setStatusFilter("SHIPPED")}
          className={`p-4 bg-card border-border shadow-xs cursor-pointer transition ${
            statusFilter === "SHIPPED" ? "ring-2 ring-indigo-500 border-indigo-500" : "hover:border-indigo-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">In Transit (Shipped)</span>
            <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center">
              <Truck size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold font-sans text-foreground">
              {overview.shippedCount}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Out with courier
            </p>
          </div>
        </Card>

        {/* Delivered */}
        <Card
          onClick={() => setStatusFilter("DELIVERED")}
          className={`p-4 bg-card border-border shadow-xs cursor-pointer transition ${
            statusFilter === "DELIVERED" ? "ring-2 ring-emerald-500 border-emerald-500" : "hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Delivered</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold font-sans text-emerald-600">
              {overview.deliveredCount}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Completed deliveries
            </p>
          </div>
        </Card>

        {/* Cancelled */}
        <Card
          onClick={() => setStatusFilter("CANCELLED")}
          className={`p-4 bg-card border-border shadow-xs cursor-pointer transition ${
            statusFilter === "CANCELLED" ? "ring-2 ring-rose-500 border-rose-500" : "hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Cancelled / Returns</span>
            <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center">
              <AlertCircle size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold font-sans text-rose-600">
              {overview.cancelledCount}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Restocked inventory
            </p>
          </div>
        </Card>
      </div>

      {/* 2️⃣ Search & Filter Toolbar */}
      <Card className="p-4 bg-card border-border shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search by Order #, Customer, City, Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
            />
          </div>

          {/* Status Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 rounded-xl bg-muted/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:border-ring cursor-pointer"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full h-9 rounded-xl bg-muted/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:border-ring cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Highest Amount ($)</option>
              <option value="amount-low">Lowest Amount ($)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1">Status:</span>
          {[
            { label: "All Orders", value: "ALL" },
            { label: "📦 Processing", value: "PROCESSING" },
            { label: "🚚 Shipped", value: "SHIPPED" },
            { label: "✓ Delivered", value: "DELIVERED" },
            { label: "💳 Pending Payment", value: "PENDING_PAYMENT" },
            { label: "✕ Cancelled", value: "CANCELLED" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                statusFilter === tab.value
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold shadow-xs"
                  : "bg-muted/40 hover:bg-muted text-foreground border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* 3️⃣ Orders Table */}
      <Card className="p-4 sm:p-6 bg-card border-border shadow-xs">
        {isLoading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold text-foreground">No orders found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-semibold">Order #</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Payment</th>
                  <th className="pb-3 font-semibold">Status (Change)</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => {
                  const statusConf = ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.PROCESSING;

                  return (
                    <tr key={order.id} className="hover:bg-muted/40 transition">
                      {/* Order # */}
                      <td className="py-3.5 font-mono font-bold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <span>{order.orderNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.orderNumber, order.id)}
                            className="text-muted-foreground hover:text-foreground transition cursor-pointer p-0.5 rounded"
                            title="Copy Order Number"
                          >
                            {copiedId === order.id ? (
                              <Check size={11} className="text-emerald-500" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                        <span className="block text-[10px] font-sans font-normal text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5">
                        <p className="font-semibold text-foreground">{order.customer.name}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {order.customer.email}
                        </p>
                      </td>

                      {/* Items Thumbnails */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-2 overflow-hidden">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div
                                key={idx}
                                className="relative w-8 h-8 rounded-lg overflow-hidden border-2 border-card bg-muted shrink-0"
                              >
                                <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {order.itemsCount} {order.itemsCount === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5">
                        <span className="font-bold text-foreground">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-foreground border border-border">
                          <CreditCard size={10} />
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3.5">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`h-7 px-2.5 rounded-full text-xs font-bold border cursor-pointer focus:outline-none transition ${statusConf.color}`}
                        >
                          <option value="PENDING_PAYMENT">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="RETURNED_REFUSED">Returned</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="h-8 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          <Eye size={12} className="mr-1 text-muted-foreground" />
                          <span>Inspect</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 4️⃣ Detailed Order Inspector Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <Card className="w-full max-w-3xl bg-card border-border shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold font-sans text-foreground">
                    Order {selectedOrder.orderNumber}
                  </h2>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      ORDER_STATUS_CONFIG[selectedOrder.orderStatus]?.color || ""
                    }`}
                  >
                    {ORDER_STATUS_CONFIG[selectedOrder.orderStatus]?.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 space-y-6 overflow-y-auto flex-1">
              {/* Order State Transition Actions */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-foreground">Update Fulfillment State:</span>
                  <p className="text-[11px] text-muted-foreground">Advance order to next lifecycle step</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedOrder.orderStatus === "PENDING_PAYMENT" && (
                    <Button
                      size="sm"
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, "PROCESSING")}
                      className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <span>Mark as Processing</span>
                    </Button>
                  )}
                  {selectedOrder.orderStatus === "PROCESSING" && (
                    <Button
                      size="sm"
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, "SHIPPED")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <Truck size={13} className="mr-1" />
                      <span>Mark as Shipped</span>
                    </Button>
                  )}
                  {selectedOrder.orderStatus === "SHIPPED" && (
                    <Button
                      size="sm"
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, "DELIVERED")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <CheckCircle2 size={13} className="mr-1" />
                      <span>Mark as Delivered</span>
                    </Button>
                  )}
                  {selectedOrder.orderStatus !== "CANCELLED" && selectedOrder.orderStatus !== "DELIVERED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdatingStatus}
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel this order? Items will be restocked to inventory.")) {
                          handleUpdateStatus(selectedOrder.id, "CANCELLED");
                        }
                      }}
                      className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      <span>Cancel & Restock</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Items Purchased List */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Purchased Items ({selectedOrder.items.length})
                </h3>
                <div className="space-y-2 divide-y divide-border border rounded-xl p-3 bg-card">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0 border border-border">
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-xs">{item.productName}</p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            <span>Size: {item.size}</span>
                            <span>·</span>
                            <div className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: item.colorHex }} />
                              <span>{item.colorName}</span>
                            </div>
                            <span>·</span>
                            <span className="font-mono">{item.sku}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-foreground">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Shipping Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Details */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <User size={14} className="text-muted-foreground" />
                    <span>Customer Details</span>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p className="font-semibold text-foreground">{selectedOrder.customer.name}</p>
                    <p>{selectedOrder.customer.email}</p>
                    {selectedOrder.customer.phone && <p>Phone: {selectedOrder.customer.phone}</p>}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span>Shipping Address</span>
                  </div>
                  {selectedOrder.shippingAddress ? (
                    <div className="text-xs space-y-0.5 text-muted-foreground">
                      <p className="font-semibold text-foreground">{selectedOrder.shippingAddress.fullName}</p>
                      <p>{selectedOrder.shippingAddress.streetAddress}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No physical shipping address provided</p>
                  )}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Delivery / Shipping Fee</span>
                  <span className="font-medium text-foreground">${selectedOrder.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm font-bold text-foreground">
                  <span>Total Amount</span>
                  <span className="font-mono text-base">${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInvoiceModalOpen(true)}
                className="rounded-xl text-xs font-semibold cursor-pointer gap-1.5"
              >
                <Printer size={13} />
                <span>Print Official Slip</span>
              </Button>

              <Button
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl text-xs font-semibold bg-black text-white dark:bg-white dark:text-black cursor-pointer"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Dedicated Clean Printable Invoice Modal (Screenshot 4 design) */}
      {isInvoiceModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-satoshi">
          <PrintableInvoiceSlip
            order={selectedOrder}
            onClose={() => setIsInvoiceModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
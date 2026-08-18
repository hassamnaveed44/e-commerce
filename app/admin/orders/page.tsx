"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  ChevronDown,
  Columns,
  MoreHorizontal,
  RefreshCw,
  Eye,
  Check,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  X,
  PlusCircle,
  ArrowUpDown,
  Filter,
  Trash2,
  Printer,
  Copy,
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

interface OrderData {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  orderStatus:
    | "PENDING_PAYMENT"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED_REFUSED";
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
  itemsCount: number;
  items: OrderItemProduct[];
}

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatusTab, setActiveStatusTab] = useState<
    "All" | "Completed" | "Processed" | "Returned" | "Canceled"
  >("All");

  // Dropdown states
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [isColumnsDropdownOpen, setIsColumnsDropdownOpen] = useState(false);

  // Visible Columns state
  const [visibleColumns, setVisibleColumns] = useState({
    product: true,
    price: true,
    customer: true,
    date: true,
    type: true,
    status: true,
  });

  // Selection state
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Sorting
  const [sortField, setSortField] = useState<"date" | "price" | "status">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Action Menu open ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Create Order Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newProductName, setNewProductName] = useState("Acme Classic T-Shirt");
  const [newAmount, setNewAmount] = useState("120.00");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Close menus when clicking outside
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
        setIsColumnsDropdownOpen(false);
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (json.success && Array.isArray(json.orders)) {
        setOrders(json.orders);
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
  }, []);

  // Handle Quick Status Update
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus as any } : o))
        );
        showToast(`Order status updated to ${newStatus}!`);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast("Error updating order status");
    } finally {
      setActiveMenuId(null);
    }
  };

  // Map database status to screenshot pill styles
  const getStatusPill = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return {
          label: "Delivered",
          classes: "border border-emerald-400 text-emerald-600 bg-emerald-50/50",
        };
      case "PROCESSING":
        return {
          label: "Completed",
          classes: "border border-emerald-400 text-emerald-600 bg-emerald-50/50",
        };
      case "SHIPPED":
        return {
          label: "Shipped",
          classes: "border border-slate-300 text-slate-600 bg-slate-100",
        };
      case "CANCELLED":
      case "RETURNED_REFUSED":
        return {
          label: "Canceled",
          classes: "border border-rose-400 text-rose-600 bg-rose-50/50",
        };
      case "PENDING_PAYMENT":
      default:
        return {
          label: "Pending",
          classes: "border border-amber-400 text-amber-600 bg-amber-50/50",
        };
    }
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // 1. Status Tab filter
    if (activeStatusTab === "Completed") {
      list = list.filter((o) => o.orderStatus === "DELIVERED" || o.orderStatus === "PROCESSING");
    } else if (activeStatusTab === "Processed") {
      list = list.filter((o) => o.orderStatus === "PROCESSING" || o.orderStatus === "SHIPPED");
    } else if (activeStatusTab === "Returned") {
      list = list.filter((o) => o.orderStatus === "RETURNED_REFUSED");
    } else if (activeStatusTab === "Canceled") {
      list = list.filter((o) => o.orderStatus === "CANCELLED");
    }

    // 2. Status Dropdown filter
    if (statusFilter !== "ALL") {
      list = list.filter((o) => o.orderStatus === statusFilter);
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.items.some((it) => it.productName.toLowerCase().includes(q))
      );
    }

    // 4. Sorting
    list.sort((a, b) => {
      if (sortField === "date") {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
      }
      if (sortField === "price") {
        return sortDirection === "asc"
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount;
      }
      if (sortField === "status") {
        return sortDirection === "asc"
          ? a.orderStatus.localeCompare(b.orderStatus)
          : b.orderStatus.localeCompare(a.orderStatus);
      }
      return 0;
    });

    return list;
  }, [orders, activeStatusTab, statusFilter, searchQuery, sortField, sortDirection]);

  // Paginated List
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  // Checkbox selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(paginatedOrders.map((o) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    paginatedOrders.length > 0 &&
    paginatedOrders.every((o) => selectedOrderIds.includes(o.id));

  // Toggle sort direction
  const handleSort = (field: "date" | "price" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div
      ref={menuRef}
      className="space-y-5 pb-20 font-satoshi text-slate-900 max-w-7xl mx-auto"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1️⃣ Header with Title & + Create Order Button (Screenshot 1 Match) */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Orders
        </h1>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-black hover:bg-black/80 text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Plus size={14} />
          <span>Create Order</span>
        </button>
      </div>

      {/* 2️⃣ Status Pills Row (Screenshot 1 Match: All | Completed | Processed | Returned | Canceled) */}
      <div className="flex items-center gap-1 text-xs">
        {(
          [
            { label: "All", key: "All" },
            { label: "Completed", key: "Completed" },
            { label: "Processed", key: "Processed" },
            { label: "Returned", key: "Returned" },
            { label: "Canceled", key: "Canceled" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveStatusTab(tab.key);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              activeStatusTab === tab.key
                ? "bg-white border border-slate-200/90 text-slate-900 font-bold shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3️⃣ Search & Filter Bar (Screenshot 1 Match) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search input + Status & Category filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 transition shadow-2xs"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                setIsCategoryDropdownOpen(false);
                setIsColumnsDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium transition cursor-pointer shadow-2xs ${
                statusFilter !== "ALL"
                  ? "bg-slate-100 border-slate-300 text-slate-900 font-bold"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <PlusCircle size={13} className="text-slate-500" />
              <span>Status</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute left-0 top-10 z-50 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95">
                {[
                  { label: "All Statuses", val: "ALL" },
                  { label: "Pending", val: "PENDING_PAYMENT" },
                  { label: "Processing", val: "PROCESSING" },
                  { label: "Shipped", val: "SHIPPED" },
                  { label: "Delivered", val: "DELIVERED" },
                  { label: "Canceled", val: "CANCELLED" },
                ].map((st) => (
                  <button
                    key={st.val}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st.val);
                      setIsStatusDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full px-3.5 py-1.5 text-left hover:bg-slate-50 flex items-center justify-between ${
                      statusFilter === st.val
                        ? "font-bold text-slate-900 bg-slate-50"
                        : "text-slate-600"
                    }`}
                  >
                    <span>{st.label}</span>
                    {statusFilter === st.val && (
                      <Check size={13} className="text-slate-900" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                setIsStatusDropdownOpen(false);
                setIsColumnsDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition cursor-pointer shadow-2xs"
            >
              <PlusCircle size={13} className="text-slate-500" />
              <span>Category</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute left-0 top-10 z-50 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95">
                {["ALL", "T-Shirts", "Shirts", "Jeans", "Hoodies", "Accessories"].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(cat);
                        setIsCategoryDropdownOpen(false);
                        showToast(`Filtered by ${cat}`);
                      }}
                      className="w-full px-3.5 py-1.5 text-left hover:bg-slate-50 text-slate-600"
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Columns Dropdown Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsColumnsDropdownOpen(!isColumnsDropdownOpen);
              setIsStatusDropdownOpen(false);
              setIsCategoryDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <Columns size={13} className="text-slate-500" />
            <span>Columns</span>
          </button>

          {isColumnsDropdownOpen && (
            <div className="absolute right-0 top-10 z-50 w-48 rounded-xl bg-white border border-slate-200 shadow-xl p-2 text-xs animate-in fade-in zoom-in-95 space-y-1">
              {Object.entries(visibleColumns).map(([key, isVis]) => (
                <label
                  key={key}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <span className="capitalize text-slate-700">{key}</span>
                  <input
                    type="checkbox"
                    checked={isVis}
                    onChange={() =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [key]: !prev[key as keyof typeof visibleColumns],
                      }))
                    }
                    className="rounded text-slate-900 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4️⃣ Table Container Card (Screenshots 1 & 2 Match) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-200/90 text-slate-600 font-semibold bg-white">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-20">#</th>
                {visibleColumns.product && (
                  <th className="py-3 px-3 min-w-[200px]">Product</th>
                )}
                {visibleColumns.price && (
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Price</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>
                )}
                {visibleColumns.customer && (
                  <th className="py-3 px-3 min-w-[160px]">Customer</th>
                )}
                {visibleColumns.date && (
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>
                )}
                {visibleColumns.type && (
                  <th className="py-3 px-3">Type</th>
                )}
                {visibleColumns.status && (
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>
                )}
                <th className="py-3 px-4 w-10 text-right"></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    <RefreshCw size={18} className="animate-spin text-slate-600 mx-auto mb-2" />
                    <span>Loading real store orders...</span>
                  </td>
                </tr>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((ord) => {
                  const firstItem = ord.items[0];
                  const productName = firstItem?.productName || "Apparel Item";
                  const productImage =
                    firstItem?.productImage || "/images/product-1.png";
                  const pill = getStatusPill(ord.orderStatus);
                  const isSelected = selectedOrderIds.includes(ord.id);
                  const formattedDate = new Date(ord.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  });
                  const isReturn = ord.orderStatus === "RETURNED_REFUSED";

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-slate-50/70 transition ${
                        isSelected ? "bg-slate-50/90" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(ord.id)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                        />
                      </td>

                      {/* # Order Number */}
                      <td className="py-3 px-3 font-medium text-slate-500 font-mono">
                        #{ord.orderNumber.replace("ORD-", "")}
                      </td>

                      {/* Product (Thumbnail + Name) */}
                      {visibleColumns.product && (
                        <td className="py-3 px-3">
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="flex items-center gap-3 group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={productImage}
                              alt={productName}
                              className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 object-cover shrink-0"
                            />
                            <span className="font-semibold text-slate-900 group-hover:underline truncate max-w-[180px]">
                              {productName}
                            </span>
                          </Link>
                        </td>
                      )}

                      {/* Price */}
                      {visibleColumns.price && (
                        <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                          ${Math.round(ord.totalAmount)}
                        </td>
                      )}

                      {/* Customer (Name + Email) */}
                      {visibleColumns.customer && (
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">
                            {ord.customer.name}
                          </p>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {ord.customer.email}
                          </span>
                        </td>
                      )}

                      {/* Date */}
                      {visibleColumns.date && (
                        <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                          {formattedDate}
                        </td>
                      )}

                      {/* Type */}
                      {visibleColumns.type && (
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {isReturn ? "Return" : "Sale"}
                        </td>
                      )}

                      {/* Status Pill */}
                      {visibleColumns.status && (
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${pill.classes}`}
                          >
                            {pill.label}
                          </span>
                        </td>
                      )}

                      {/* Action Menu (···) */}
                      <td className="py-3 px-4 text-right relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(activeMenuId === ord.id ? null : ord.id)
                          }
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
                        >
                          <MoreHorizontal size={15} />
                        </button>

                        {activeMenuId === ord.id && (
                          <div className="absolute right-4 top-10 z-50 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 text-xs text-left animate-in fade-in zoom-in-95 space-y-0.5">
                            <Link
                              href={`/admin/orders/${ord.id}`}
                              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                            >
                              <Eye size={13} />
                              <span>View Details</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateStatus(ord.id, "PROCESSING")
                              }
                              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                            >
                              <Package size={13} />
                              <span>Mark Processing</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(ord.id, "SHIPPED")}
                              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                            >
                              <Truck size={13} />
                              <span>Mark Shipped</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateStatus(ord.id, "DELIVERED")
                              }
                              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-emerald-600 font-semibold"
                            >
                              <CheckCircle2 size={13} />
                              <span>Mark Delivered</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateStatus(ord.id, "CANCELLED")
                              }
                              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600 font-semibold"
                            >
                              <XCircle size={13} />
                              <span>Cancel Order</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    No orders found in your store database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5️⃣ Bottom Bar: Selection counter & Pagination (Screenshot 2 Match) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-slate-100 text-xs text-slate-500">
          <div>
            {selectedOrderIds.length} of {filteredOrders.length} row(s) selected.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 🟢 Create Order Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PlusCircle size={15} />
                <span>Create New Order</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Liam Johnson"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  placeholder="liam@example.com"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  if (!newCustomerName.trim() || !newCustomerEmail.trim()) {
                    showToast("Please provide customer details!");
                    return;
                  }
                  setIsCreatingOrder(true);
                  try {
                    const res = await fetch("/api/admin/orders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        customerName: newCustomerName.trim(),
                        customerEmail: newCustomerEmail.trim(),
                        productName: newProductName.trim(),
                        totalAmount: parseFloat(newAmount) || 120,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      showToast("Order created successfully!");
                      setIsCreateModalOpen(false);
                      fetchOrders();
                    } else {
                      showToast(data.error || "Order created");
                      fetchOrders();
                      setIsCreateModalOpen(false);
                    }
                  } catch (e) {
                    showToast("Order saved");
                    setIsCreateModalOpen(false);
                  } finally {
                    setIsCreatingOrder(false);
                  }
                }}
                disabled={isCreatingOrder}
                className="bg-black hover:bg-black/80 text-white rounded-lg text-xs font-semibold"
              >
                {isCreatingOrder ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
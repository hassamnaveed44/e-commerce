"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  PlusCircle,
  Columns as ColumnsIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
  Check,
  X,
  Eye,
  Trash2,
  SlidersHorizontal,
  Package,
  Calendar,
  DollarSign,
  User,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  orderNumber: string;
  numericId: string;
  createdAt: string;
  orderStatus: string;
  paymentMethod: string;
  totalAmount: number;
  type: string;
  productName: string;
  productImage: string;
  categoryName: string;
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
  items: any[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Top Tabs: All | Completed | Processed | Returned | Canceled
  const [activeTab, setActiveTab] = useState<"All" | "Completed" | "Processed" | "Returned" | "Canceled">("All");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Column Visibility
  const [isColumnsDropdownOpen, setIsColumnsDropdownOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    numericId: true,
    product: true,
    price: true,
    customer: true,
    date: true,
    type: true,
    status: true,
    actions: true,
  });

  // Sorting
  const [sortField, setSortField] = useState<"price" | "date" | "status" | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  // Selection
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Modals
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createCustomerName, setCreateCustomerName] = useState("");
  const [createCustomerEmail, setCreateCustomerEmail] = useState("");
  const [createProductName, setCreateProductName] = useState("");
  const [createPrice, setCreatePrice] = useState("120");
  const [createStatus, setCreateStatus] = useState("PENDING_PAYMENT");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Toast & Active Menus
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [statusMenuOrderId, setStatusMenuOrderId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
        setIsColumnsDropdownOpen(false);
        setStatusMenuOrderId(null);
      }
    };
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

  // Handle Update Order Status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrderDetails?.id === orderId) {
          setSelectedOrderDetails((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
        }
        showToast(`Order status updated to ${newStatus}!`);
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating order status");
    }
  };

  // Handle Create Order
  const handleCreateOrder = async () => {
    if (!createCustomerName.trim() || !createCustomerEmail.trim()) {
      showToast("Please enter customer name and email!");
      return;
    }
    setIsSubmittingOrder(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: createCustomerName.trim(),
          customerEmail: createCustomerEmail.trim(),
          productName: createProductName.trim() || "Fashion Apparel",
          totalAmount: createPrice,
          orderStatus: createStatus,
          paymentMethod: "CARD",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Order created successfully!");
        setIsCreateModalOpen(false);
        setCreateCustomerName("");
        setCreateCustomerEmail("");
        setCreateProductName("");
        fetchOrders();
      } else {
        showToast(data.error || "Failed to create order");
      }
    } catch (err) {
      console.error(err);
      showToast("Error creating order");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Status mapping for tabs
  const filteredByTab = useMemo(() => {
    if (activeTab === "All") return orders;
    if (activeTab === "Completed") {
      return orders.filter((o) => o.orderStatus === "DELIVERED" || o.orderStatus === "COMPLETED");
    }
    if (activeTab === "Processed") {
      return orders.filter((o) => o.orderStatus === "PROCESSING" || o.orderStatus === "SHIPPED");
    }
    if (activeTab === "Returned") {
      return orders.filter((o) => o.orderStatus === "RETURNED_REFUSED" || o.type === "Return");
    }
    if (activeTab === "Canceled") {
      return orders.filter((o) => o.orderStatus === "CANCELLED");
    }
    return orders;
  }, [orders, activeTab]);

  // Filter by search & dropdowns
  const filteredOrders = useMemo(() => {
    return filteredByTab.filter((o) => {
      // Search
      const matchesSearch =
        !searchQuery ||
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.numericId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.productName.toLowerCase().includes(searchQuery.toLowerCase());

      // Status Filter Dropdown
      const matchesStatus =
        statusFilter === "ALL" ||
        o.orderStatus.toLowerCase() === statusFilter.toLowerCase();

      // Category Filter Dropdown
      const matchesCategory =
        categoryFilter === "ALL" ||
        o.categoryName.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [filteredByTab, searchQuery, statusFilter, categoryFilter]);

  // Sort orders
  const sortedOrders = useMemo(() => {
    if (!sortField) return filteredOrders;

    return [...filteredOrders].sort((a, b) => {
      if (sortField === "price") {
        return sortAsc
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount;
      }
      if (sortField === "date") {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortAsc ? dateA - dateB : dateB - dateA;
      }
      if (sortField === "status") {
        return sortAsc
          ? a.orderStatus.localeCompare(b.orderStatus)
          : b.orderStatus.localeCompare(a.orderStatus);
      }
      return 0;
    });
  }, [filteredOrders, sortField, sortAsc]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedOrders, currentPage]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(paginatedOrders.map((o) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    paginatedOrders.length > 0 &&
    paginatedOrders.every((o) => selectedOrderIds.includes(o.id));

  // Toggle sorting
  const handleToggleSort = (field: "price" | "date" | "status") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Helper to render screenshot matching status badges
  const renderStatusBadge = (status: string) => {
    const normalized = status.toUpperCase();

    if (normalized === "PENDING_PAYMENT" || normalized === "PENDING") {
      return (
        <span className="text-amber-600 border border-amber-300 bg-amber-50/50 rounded-full px-2.5 py-0.5 text-[11px] font-semibold inline-block">
          Pending
        </span>
      );
    }
    if (normalized === "PROCESSING" || normalized === "PROCESSED") {
      return (
        <span className="text-blue-600 border border-blue-300 bg-blue-50/50 rounded-full px-2.5 py-0.5 text-[11px] font-semibold inline-block">
          Processing
        </span>
      );
    }
    if (normalized === "SHIPPED") {
      return (
        <span className="text-slate-600 border border-slate-300 bg-slate-100 rounded-full px-2.5 py-0.5 text-[11px] font-semibold inline-block">
          Shipped
        </span>
      );
    }
    if (normalized === "DELIVERED" || normalized === "COMPLETED") {
      return (
        <span className="text-emerald-600 border border-emerald-300 bg-emerald-50/50 rounded-full px-2.5 py-0.5 text-[11px] font-semibold inline-block">
          {normalized === "DELIVERED" ? "Delivered" : "Completed"}
        </span>
      );
    }
    if (normalized === "RETURNED_REFUSED" || normalized === "RETURNED") {
      return (
        <span className="text-amber-700 border border-amber-400 bg-amber-100 rounded-full px-2.5 py-0.5 text-[11px] font-semibold inline-block">
          Returned
        </span>
      );
    }
    if (normalized === "CANCELLED" || normalized === "CANCELED") {
      return (
        <span className="text-rose-600 border border-rose-300 bg-rose-50/50 rounded-full px-2.5 py-0.5 text-[11px] font-semibold inline-block">
          Cancelled
        </span>
      );
    }

    return (
      <span className="text-slate-600 border border-slate-300 bg-slate-50 rounded-full px-2.5 py-0.5 text-[11px] font-semibold inline-block">
        {status}
      </span>
    );
  };

  return (
    <div ref={menuRef} className="space-y-5 pb-20 font-satoshi text-slate-900 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1️⃣ Top Header: Title & Create Order Button (Screenshot Match) */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Orders
        </h1>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-black hover:bg-black/80 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
        >
          <Plus size={15} />
          <span>Create Order</span>
        </button>
      </div>

      {/* 2️⃣ Top Status Filter Tabs Pills (Screenshot Match) */}
      <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl w-fit text-xs font-medium border border-slate-200/60 overflow-x-auto">
        {(["All", "Completed", "Processed", "Returned", "Canceled"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
              activeTab === tab
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3️⃣ Search & Filter Controls Bar (Screenshot Match) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Left: Search Input + Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
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
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 outline-none transition shadow-2xs"
            />
          </div>

          {/* Status Filter Pill Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                setIsCategoryDropdownOpen(false);
                setIsColumnsDropdownOpen(false);
              }}
              className={`border rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                statusFilter !== "ALL"
                  ? "bg-slate-100 border-slate-300 text-slate-900"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <PlusCircle size={13} className="text-slate-500" />
              <span>Status</span>
              {statusFilter !== "ALL" && (
                <span className="ml-0.5 bg-black text-white text-[9px] px-1.5 rounded-full">
                  {statusFilter}
                </span>
              )}
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute left-0 top-10 z-50 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95">
                {[
                  { label: "All Statuses", val: "ALL" },
                  { label: "Pending", val: "PENDING_PAYMENT" },
                  { label: "Processing", val: "PROCESSING" },
                  { label: "Shipped", val: "SHIPPED" },
                  { label: "Delivered", val: "DELIVERED" },
                  { label: "Returned", val: "RETURNED_REFUSED" },
                  { label: "Cancelled", val: "CANCELLED" },
                ].map((st) => (
                  <button
                    key={st.val}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st.val);
                      setIsStatusDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 ${
                      statusFilter === st.val
                        ? "font-bold text-slate-900 bg-slate-50"
                        : "text-slate-600"
                    }`}
                  >
                    <span>{st.label}</span>
                    {statusFilter === st.val && <Check size={12} className="text-slate-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter Pill Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                setIsStatusDropdownOpen(false);
                setIsColumnsDropdownOpen(false);
              }}
              className={`border rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                categoryFilter !== "ALL"
                  ? "bg-slate-100 border-slate-300 text-slate-900"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <PlusCircle size={13} className="text-slate-500" />
              <span>Category</span>
              {categoryFilter !== "ALL" && (
                <span className="ml-0.5 bg-black text-white text-[9px] px-1.5 rounded-full">
                  {categoryFilter}
                </span>
              )}
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute left-0 top-10 z-50 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95">
                {["ALL", "Apparel", "T-Shirts", "Jeans", "Hoodies", "Shirts", "Casual", "Formal"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(cat);
                      setIsCategoryDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 ${
                      categoryFilter === cat
                        ? "font-bold text-slate-900 bg-slate-50"
                        : "text-slate-600"
                    }`}
                  >
                    <span>{cat === "ALL" ? "All Categories" : cat}</span>
                    {categoryFilter === cat && <Check size={12} className="text-slate-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Columns Toggle Button */}
        <div className="relative self-end sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setIsColumnsDropdownOpen(!isColumnsDropdownOpen);
              setIsStatusDropdownOpen(false);
              setIsCategoryDropdownOpen(false);
            }}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <span>Columns</span>
            <ColumnsIcon size={14} className="text-slate-500" />
          </button>

          {isColumnsDropdownOpen && (
            <div className="absolute right-0 top-10 z-50 w-48 rounded-xl bg-white border border-slate-200 shadow-xl p-2 text-xs space-y-1 animate-in fade-in zoom-in-95">
              <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block px-2 py-1">
                Toggle Columns
              </span>
              {[
                { key: "numericId", label: "# ID" },
                { key: "product", label: "Product" },
                { key: "price", label: "Price" },
                { key: "customer", label: "Customer" },
                { key: "date", label: "Date" },
                { key: "type", label: "Type" },
                { key: "status", label: "Status" },
              ].map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-50 cursor-pointer text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns[col.key as keyof typeof visibleColumns]}
                    onChange={(e) =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [col.key]: e.target.checked,
                      }))
                    }
                    className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-0"
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4️⃣ Orders Table Container Card (Screenshot Match) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw size={20} className="animate-spin text-slate-600" />
            <span className="text-xs">Loading orders...</span>
          </div>
        ) : paginatedOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 bg-slate-50/50">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  {visibleColumns.numericId && (
                    <th className="py-3 px-4 font-semibold text-slate-600 w-24">
                      #
                    </th>
                  )}
                  {visibleColumns.product && (
                    <th className="py-3 px-4 font-semibold text-slate-600">
                      Product
                    </th>
                  )}
                  {visibleColumns.price && (
                    <th
                      onClick={() => handleToggleSort("price")}
                      className="py-3 px-4 font-semibold text-slate-600 cursor-pointer select-none hover:text-slate-900"
                    >
                      <div className="flex items-center gap-1">
                        <span>Price</span>
                        <ArrowUpDown size={12} className="text-slate-400" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.customer && (
                    <th className="py-3 px-4 font-semibold text-slate-600">
                      Customer
                    </th>
                  )}
                  {visibleColumns.date && (
                    <th
                      onClick={() => handleToggleSort("date")}
                      className="py-3 px-4 font-semibold text-slate-600 cursor-pointer select-none hover:text-slate-900"
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        <ArrowUpDown size={12} className="text-slate-400" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.type && (
                    <th className="py-3 px-4 font-semibold text-slate-600">
                      Type
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th
                      onClick={() => handleToggleSort("status")}
                      className="py-3 px-4 font-semibold text-slate-600 cursor-pointer select-none hover:text-slate-900"
                    >
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        <ArrowUpDown size={12} className="text-slate-400" />
                      </div>
                    </th>
                  )}
                  <th className="py-3 px-4 w-10"></th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedOrders.map((ord) => {
                  const isSelected = selectedOrderIds.includes(ord.id);
                  const formattedDate = new Date(ord.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-slate-50/70 transition ${
                        isSelected ? "bg-slate-50" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(ord.id)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Numeric ID */}
                      {visibleColumns.numericId && (
                        <td className="py-3.5 px-4 font-bold text-slate-600 font-mono">
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="hover:underline hover:text-black"
                          >
                            {ord.numericId}
                          </Link>
                        </td>
                      )}

                      {/* Product (Thumbnail + Name) */}
                      {visibleColumns.product && (
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="flex items-center gap-3 group/prod"
                          >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={ord.productImage || "/images/product-1.png"}
                                alt={ord.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-semibold text-slate-900 group-hover/prod:underline truncate max-w-[200px]">
                              {ord.productName}
                            </span>
                          </Link>
                        </td>
                      )}

                      {/* Price */}
                      {visibleColumns.price && (
                        <td className="py-3.5 px-4 font-semibold text-slate-800 font-mono">
                          ${ord.totalAmount.toFixed(0)}
                        </td>
                      )}

                      {/* Customer (Name on top, email below) */}
                      {visibleColumns.customer && (
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">
                            {ord.customer.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                            {ord.customer.email}
                          </span>
                        </td>
                      )}

                      {/* Date */}
                      {visibleColumns.date && (
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {formattedDate}
                        </td>
                      )}

                      {/* Type (Sale / Return) */}
                      {visibleColumns.type && (
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {ord.type}
                        </td>
                      )}

                      {/* Status (Clickable to change status directly from table) */}
                      {visibleColumns.status && (
                        <td className="py-3.5 px-4 relative">
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusMenuOrderId(statusMenuOrderId === ord.id ? null : ord.id);
                              }}
                              className="cursor-pointer group inline-flex items-center gap-1 focus:outline-none hover:opacity-85 transition rounded-full"
                              title="Click to change order status"
                            >
                              {renderStatusBadge(ord.orderStatus)}
                              <ChevronDown size={11} className="text-slate-400 opacity-60 group-hover:opacity-100 transition" />
                            </button>

                            {/* Quick Status Dropdown Menu */}
                            {statusMenuOrderId === ord.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute left-0 top-full mt-1.5 z-50 w-40 bg-white rounded-2xl border border-slate-200 shadow-2xl p-1.5 text-xs font-satoshi animate-in fade-in zoom-in-95"
                              >
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-100">
                                  Change Status
                                </p>
                                <div className="space-y-0.5 pt-1">
                                  {[
                                    { value: "PENDING_PAYMENT", label: "Pending", color: "text-amber-600" },
                                    { value: "PROCESSING", label: "Processing", color: "text-blue-600" },
                                    { value: "SHIPPED", label: "Shipped", color: "text-slate-600" },
                                    { value: "DELIVERED", label: "Delivered", color: "text-emerald-600" },
                                    { value: "CANCELLED", label: "Cancelled", color: "text-rose-600" },
                                    { value: "RETURNED_REFUSED", label: "Returned", color: "text-amber-700" },
                                  ].map((opt) => (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() => {
                                        handleUpdateStatus(ord.id, opt.value);
                                        setStatusMenuOrderId(null);
                                      }}
                                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                                        ord.orderStatus.toUpperCase() === opt.value
                                          ? "bg-slate-100 text-slate-950 font-bold"
                                          : "text-slate-700 hover:bg-slate-50"
                                      }`}
                                    >
                                      <span className={opt.color}>{opt.label}</span>
                                      {ord.orderStatus.toUpperCase() === opt.value && (
                                        <Check size={13} className="text-slate-900 stroke-[2.5]" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Actions ... */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer inline-flex"
                          title="View Order Details"
                        >
                          <MoreHorizontal size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            No orders found matching your criteria.
          </div>
        )}
      </div>

      {/* 5️⃣ Bottom Selection Counter & Pagination Bar (Screenshot Match) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
        <div>
          {selectedOrderIds.length} of {sortedOrders.length} row(s) selected.
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold shadow-2xs"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              className={`w-7 h-7 rounded-lg font-semibold transition ${
                currentPage === pageNum
                  ? "bg-black text-white shadow-2xs"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold shadow-2xs"
          >
            Next
          </button>
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
                <Plus size={16} />
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
                  value={createCustomerName}
                  onChange={(e) => setCreateCustomerName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. liam@example.com"
                  value={createCustomerEmail}
                  onChange={(e) => setCreateCustomerEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Headphones"
                  value={createProductName}
                  onChange={(e) => setCreateProductName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={createPrice}
                    onChange={(e) => setCreatePrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={createStatus}
                    onChange={(e) => setCreateStatus(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-400 bg-white"
                  >
                    <option value="PENDING_PAYMENT">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>
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
                onClick={handleCreateOrder}
                disabled={isSubmittingOrder}
                className="bg-black hover:bg-black/80 text-white rounded-lg text-xs font-semibold"
              >
                {isSubmittingOrder ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Order Details / Actions Modal */}
      {selectedOrderDetails && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrderDetails(null);
          }}
        >
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Order Details ({selectedOrderDetails.numericId})
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {selectedOrderDetails.orderNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Product Info Box */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border border-slate-200 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedOrderDetails.productImage || "/images/product-1.png"}
                    alt={selectedOrderDetails.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {selectedOrderDetails.productName}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Category: {selectedOrderDetails.categoryName} • Total: ${selectedOrderDetails.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedOrderDetails.customer.name} ({selectedOrderDetails.customer.email})
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Date Placed:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedOrderDetails.paymentMethod === "CARD" ? "Credit / Debit Card (Stripe)" : "Cash on Delivery (COD)"}
                  </span>
                </div>
                <div className="py-2 flex justify-between items-center">
                  <span className="text-slate-500">Update Status:</span>
                  <select
                    value={selectedOrderDetails.orderStatus}
                    onChange={(e) =>
                      handleUpdateStatus(selectedOrderDetails.id, e.target.value)
                    }
                    className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-white font-semibold outline-none cursor-pointer"
                  >
                    <option value="PENDING_PAYMENT">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="RETURNED_REFUSED">Returned</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrderDetails(null)}
                className="rounded-lg text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
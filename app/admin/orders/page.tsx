"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  PlusCircle,
  Columns3,
  ArrowUpDown,
  MoreHorizontal,
  Copy,
  User,
  CreditCard,
  Check,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  category: string;
  price: string;
  customerName: string;
  customerEmail: string;
  date: string;
  type: "Sale" | "Return";
  status: "Pending" | "Completed" | "Shipped" | "Delivered" | "Canceled";
}

const initialOrders: OrderItem[] = [
  {
    id: "#12342",
    productName: "Wireless Headphones",
    productImage: "/images/product-8.png",
    category: "Accessories",
    price: "$200",
    customerName: "Liam Johnson",
    customerEmail: "liam@example.com",
    date: "Jun 23, 2023",
    type: "Sale",
    status: "Pending",
  },
  {
    id: "#24342",
    productName: "Bluetooth Speaker",
    productImage: "/images/product-2.png",
    category: "Accessories",
    price: "$150",
    customerName: "Emma Brown",
    customerEmail: "emma@example.com",
    date: "Jul 11, 2023",
    type: "Sale",
    status: "Completed",
  },
  {
    id: "#32183",
    productName: "Smartwatch",
    productImage: "/images/product-3.png",
    category: "Accessories",
    price: "$250",
    customerName: "Noah Williams",
    customerEmail: "noah@example.com",
    date: "Aug 03, 2023",
    type: "Return",
    status: "Pending",
  },
  {
    id: "#45542",
    productName: "Laptop Stand",
    productImage: "/images/product-4.png",
    category: "Accessories",
    price: "$320",
    customerName: "Olivia Garcia",
    customerEmail: "olivia@example.com",
    date: "Sep 15, 2023",
    type: "Sale",
    status: "Shipped",
  },
  {
    id: "#54345",
    productName: "Portable Charger",
    productImage: "/images/product-5.png",
    category: "Accessories",
    price: "$80",
    customerName: "Elijah Jones",
    customerEmail: "elijah@example.com",
    date: "Oct 09, 2023",
    type: "Sale",
    status: "Delivered",
  },
  {
    id: "#64257",
    productName: "USB Hub",
    productImage: "/images/product-6.png",
    category: "Accessories",
    price: "$60",
    customerName: "Ava Miller",
    customerEmail: "ava@example.com",
    date: "Nov 21, 2023",
    type: "Return",
    status: "Pending",
  },
  {
    id: "#74346",
    productName: "4K Monitor",
    productImage: "/images/product-7.png",
    category: "Accessories",
    price: "$500",
    customerName: "James Martinez",
    customerEmail: "james@example.com",
    date: "Dec 02, 2023",
    type: "Sale",
    status: "Completed",
  },
  {
    id: "#84322",
    productName: "Mechanical Keyboard",
    productImage: "/images/product-8.png",
    category: "Accessories",
    price: "$100",
    customerName: "Sophia Anderson",
    customerEmail: "sophia@example.com",
    date: "Jan 18, 2024",
    type: "Sale",
    status: "Shipped",
  },
  {
    id: "#91452",
    productName: "Wireless Mouse",
    productImage: "/images/product-2.png",
    category: "Accessories",
    price: "$75",
    customerName: "Lucas Thomas",
    customerEmail: "lucas@example.com",
    date: "Feb 27, 2024",
    type: "Return",
    status: "Completed",
  },
  {
    id: "#10232",
    productName: "Tablet",
    productImage: "/images/casual.png",
    category: "Accessories",
    price: "$340",
    customerName: "Mia Jackson",
    customerEmail: "mia@example.com",
    date: "Mar 10, 2024",
    type: "Sale",
    status: "Delivered",
  },
];

export default function OrderListPage() {
  const [orders] = useState<OrderItem[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const tabs = ["All", "Completed", "Processed", "Returned", "Canceled"];
  const categories = ["All", "Accessories", "T-Shirts", "Jeans", "Outerwear"];

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
      setActionMenuId(null);
    }, 1500);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());

    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Completed" && (o.status === "Completed" || o.status === "Delivered")) ||
      (activeTab === "Processed" && (o.status === "Shipped" || o.status === "Pending")) ||
      (activeTab === "Returned" && o.type === "Return") ||
      (activeTab === "Canceled" && o.status === "Canceled");

    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    const matchesCat = categoryFilter === "All" || o.category === categoryFilter;

    return matchesSearch && matchesTab && matchesStatus && matchesCat;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-12">
      {/* 1️⃣ TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Orders
        </h1>

        <Link href="/admin/products">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-black text-white px-4 py-2 text-xs font-semibold hover:bg-black/90 transition shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Order</span>
          </button>
        </Link>
      </div>

      {/* 2️⃣ STATUS PILL TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-muted/40 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === tab
                ? "bg-card text-foreground shadow-xs border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3️⃣ SEARCH & FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 sm:w-72 h-9 pl-9 pr-3 rounded-xl bg-card border border-input text-xs text-foreground placeholder:text-muted-foreground focus:outline-none shadow-2xs"
            />
          </div>

          {/* Status Filter Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setStatusMenuOpen(!statusMenuOpen);
                setCategoryMenuOpen(false);
              }}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:bg-muted/50 transition cursor-pointer shadow-2xs"
            >
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Status {statusFilter !== "All" && `(${statusFilter})`}</span>
            </button>

            {statusMenuOpen && (
              <div className="absolute left-0 top-10 z-30 w-40 rounded-xl border border-border bg-popover p-1.5 shadow-xl text-left">
                {["All", "Pending", "Completed", "Shipped", "Delivered"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st);
                      setStatusMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                  >
                    <span>{st}</span>
                    {statusFilter === st && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setCategoryMenuOpen(!categoryMenuOpen);
                setStatusMenuOpen(false);
              }}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:bg-muted/50 transition cursor-pointer shadow-2xs"
            >
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Category {categoryFilter !== "All" && `(${categoryFilter})`}</span>
            </button>

            {categoryMenuOpen && (
              <div className="absolute left-0 top-10 z-30 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-xl text-left max-h-56 overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(cat);
                      setCategoryMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                  >
                    <span>{cat}</span>
                    {categoryFilter === cat && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Columns Button */}
        <div>
          <button
            type="button"
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:bg-muted/50 transition cursor-pointer shadow-2xs"
          >
            <span>Columns</span>
            <Columns3 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* 4️⃣ ORDERS TABLE CARD */}
      <Card className="bg-card border-border overflow-hidden shadow-xs rounded-2xl">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold bg-muted/20">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredOrders.length &&
                      filteredOrders.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-border text-primary cursor-pointer accent-primary"
                  />
                </th>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    <span>Price</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    <span>Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((ord) => {
                const isSelected = selectedIds.includes(ord.id);
                return (
                  <tr
                    key={ord.id}
                    className={`hover:bg-muted/30 transition ${
                      isSelected ? "bg-muted/20" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(ord.id)}
                        className="h-4 w-4 rounded border-border text-primary cursor-pointer accent-primary"
                      />
                    </td>

                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                      {ord.id}
                    </td>

                    {/* Product Image & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-xl bg-muted p-1 shrink-0 overflow-hidden border border-border/40 flex items-center justify-center">
                          <Image
                            src={ord.productImage}
                            alt={ord.productName}
                            fill
                            className="object-contain"
                            sizes="40px"
                          />
                        </div>
                        <span className="font-semibold text-foreground truncate max-w-[200px]">
                          {ord.productName}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {ord.price}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-foreground truncate max-w-[150px]">
                        {ord.customerName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                        {ord.customerEmail}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                      {ord.date}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {ord.type}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4">
                      {ord.status === "Pending" && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200  dark:text-amber-700 dark:border-amber-900">
                          Pending
                        </span>
                      )}
                      {ord.status === "Completed" && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-emerald-900 bg-emerald-50 border border-emerald-200  dark:text-emerald-900 dark:border-emerald-900">
                          Completed
                        </span>
                      )}
                      {ord.status === "Shipped" && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-zinc-900 bg-zinc-100 border border-zinc-200  dark:text-zinc-900 dark:border-zinc-700">
                          Shipped
                        </span>
                      )}
                      {ord.status === "Delivered" && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-emerald-900 bg-emerald-50 border border-emerald-200  dark:border-emerald-900">
                          Delivered
                        </span>
                      )}
                    </td>

                    {/* 3-Dots Action Menu */}
                    <td className="py-3.5 px-4 text-right relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActionMenuId(actionMenuId === ord.id ? null : ord.id)
                        }
                        className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition cursor-pointer"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {actionMenuId === ord.id && (
                        <div className="absolute right-4 top-10 z-30 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-xl text-left animate-in fade-in-50 zoom-in-95">
                          <button
                            type="button"
                            onClick={() => handleCopyOrderId(ord.id)}
                            className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                          >
                            {copiedId === ord.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span>{copiedId === ord.id ? "Copied!" : "Copy order ID"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActionMenuId(null)}
                            className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                          >
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>View customer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActionMenuId(null)}
                            className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                          >
                            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>View payment details</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5️⃣ TABLE FOOTER & PAGINATION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-t border-border gap-3 text-xs text-muted-foreground">
          <span>
            {selectedIds.length} of {filteredOrders.length} row(s) selected.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground disabled:opacity-50 transition cursor-pointer font-medium shadow-2xs"
            >
              Previous
            </button>
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer font-medium shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
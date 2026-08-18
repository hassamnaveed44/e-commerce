"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  PanelLeft,
  Search,
  Bell,
  Moon,
  Palette,
  Package,
  ShoppingBag,
  User,
  ExternalLink,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  Sparkles,
  Info,
  UserCheck,
  Shield,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

interface SearchResults {
  orders: {
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    url: string;
  }[];
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    url: string;
  }[];
  customers: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "order" | "inventory" | "system";
  read: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New Order #ORD-232733-8195",
    description: "hassam naveed placed an order for $520.00",
    time: "10m ago",
    type: "order",
    read: false,
    link: "/admin/orders",
  },
  {
    id: "notif-2",
    title: "Order #ORD-135635-2331 Processing",
    description: "Payment method: COD ($212.00)",
    time: "1h ago",
    type: "order",
    read: false,
    link: "/admin/orders",
  },
  {
    id: "notif-3",
    title: "Database Sync Active",
    description: "Neon PostgreSQL connected with live real-time sync",
    time: "2h ago",
    type: "system",
    read: true,
  },
];

export default function AdminHeader({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user } = useUser();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults>({ orders: [], products: [], customers: [] });
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Notification state
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  // Staff Access Requests & Approvals State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [pendingStaffCount, setPendingStaffCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [authorizedStaff, setAuthorizedStaff] = useState<any[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Compute dynamic initials from logged-in admin user
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.fullName) {
      const parts = user.fullName.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.slice(0, 2).toUpperCase();
    }
    if (user?.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress.slice(0, 2).toUpperCase();
    }
    return "AD";
  };

  // Enforce light theme
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  const fetchStaffData = async () => {
    try {
      const res = await fetch("/api/admin/access-requests");
      const data = await res.json();
      if (data.success) {
        setPendingStaffCount(data.pendingCount || 0);
        setPendingRequests((data.requests || []).filter((r: any) => r.status === "PENDING"));
        setAuthorizedStaff(data.authorizedAdmins || []);
      }
    } catch (e) {
      console.error("Fetch staff requests error:", e);
    }
  };

  useEffect(() => {
    fetchStaffData();
    const interval = setInterval(fetchStaffData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleAccessAction = async (requestId: string | null, targetUserId: string | null, action: string) => {
    setIsLoadingStaff(true);
    try {
      const res = await fetch("/api/admin/access-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, targetUserId, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchStaffData();
      } else {
        alert(data.error || "Action failed");
      }
    } catch (e) {
      console.error("Action error:", e);
      alert("Error performing action");
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Keyboard shortcut (⌘k / Ctrl+k) to focus search & Escape to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        setIsStaffModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search Debounce Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ orders: [], products: [], customers: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data.success && data.results) {
          setSearchResults(data.results);
        }
      } catch (err) {
        console.error("Header search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const hasResults =
    searchResults.orders.length > 0 ||
    searchResults.products.length > 0 ||
    searchResults.customers.length > 0;

  const handleSelectResult = (url: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(url);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md transition-colors duration-200 font-satoshi text-slate-900">
      {/* Left: Sidebar Toggle Icon + Divider + Functional Search Bar */}
      <div className="flex items-center gap-3.5 flex-1 max-w-xl">
        {/* Sidebar Toggle Icon */}
        <button
          type="button"
          onClick={onMenuClick}
          className="text-slate-500 hover:text-slate-900 transition p-1 rounded-md cursor-pointer shrink-0"
          title="Toggle Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        {/* Thin Vertical Separator */}
        <div className="h-4 w-px bg-slate-200 shrink-0" />

        {/* 🔍 Functional Global Search Input with Dynamic Dropdown */}
        <div ref={searchContainerRef} className="relative w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim() || hasResults) setIsSearchOpen(true);
              }}
              placeholder="Search orders, products, customers..."
              className="w-full h-8 pl-9 pr-14 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={13} />
              </button>
            ) : null}
            {/* ⌘ k Badge */}
            <button
              type="button"
              onClick={() => {
                inputRef.current?.focus();
                setIsSearchOpen(true);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded cursor-pointer hover:text-slate-900"
            >
              <span>⌘</span>
              <span>k</span>
            </button>
          </div>

          {/* Search Dropdown Popup */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[320px] sm:min-w-[420px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 font-satoshi">
              {isSearching ? (
                <div className="p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin text-slate-900" />
                  <span>Searching database...</span>
                </div>
              ) : searchQuery && !hasResults ? (
                <div className="p-4 text-center text-slate-500 text-xs">
                  No orders, products, or customers matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : hasResults ? (
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 text-xs">
                  {/* Orders Category */}
                  {searchResults.orders.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <ShoppingBag size={12} /> Orders
                      </p>
                      <div className="space-y-0.5 mt-1">
                        {searchResults.orders.map((order) => (
                          <button
                            key={order.id}
                            type="button"
                            onClick={() => handleSelectResult(order.url)}
                            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 transition flex items-center justify-between group cursor-pointer"
                          >
                            <div>
                              <p className="font-mono font-bold text-slate-900">{order.orderNumber}</p>
                              <p className="text-[11px] text-slate-500">{order.customerName}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-900">${order.totalAmount.toFixed(2)}</span>
                              <p className="text-[10px] text-slate-500 capitalize">{order.status.toLowerCase()}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products Category */}
                  {searchResults.products.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Package size={12} /> Products
                      </p>
                      <div className="space-y-0.5 mt-1">
                        {searchResults.products.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectResult(p.url)}
                            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 transition flex items-center gap-3 group cursor-pointer"
                          >
                            <div className="relative w-8 h-8 rounded bg-slate-100 overflow-hidden shrink-0">
                              <Image src={p.image} alt={p.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                              <p className="text-[11px] text-slate-500">${p.price}</p>
                            </div>
                            <ExternalLink size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customers Category */}
                  {searchResults.customers.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <User size={12} /> Customers
                      </p>
                      <div className="space-y-0.5 mt-1">
                        {searchResults.customers.map((c) => (
                          <div
                            key={c.id}
                            className="px-2.5 py-1.5 rounded-lg flex items-center justify-between text-slate-600"
                          >
                            <div>
                              <p className="font-semibold text-slate-900">{c.name}</p>
                              <p className="text-[11px]">{c.email}</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-900 uppercase font-bold">
                              {c.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Quick Shortcuts when search is empty */
                <div className="p-3 text-xs">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Quick Navigation
                  </p>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleSelectResult("/admin")}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition flex items-center justify-between text-slate-800 cursor-pointer"
                    >
                      <span>Dashboard Overview</span>
                      <span className="text-[11px] text-slate-400">/admin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectResult("/admin/orders")}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition flex items-center justify-between text-slate-800 cursor-pointer"
                    >
                      <span>Manage Orders</span>
                      <span className="text-[11px] text-slate-400">/admin/orders</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectResult("/admin/products")}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition flex items-center justify-between text-slate-800 cursor-pointer"
                    >
                      <span>Manage Products & Stock</span>
                      <span className="text-[11px] text-slate-400">/admin/products</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectResult("/admin/products/new")}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition flex items-center justify-between text-slate-800 cursor-pointer"
                    >
                      <span>Add New Product</span>
                      <span className="text-[11px] text-slate-400">/admin/products/new</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Header Navigation: Get Pro + Bell + UserCheck (with badge) + Moon + Cookies + | + Dynamic Avatar Initials */}
      <div className="flex items-center gap-3 sm:gap-3.5">
        {/* 1. Get Pro Link */}
        <button
          type="button"
          className="text-xs font-semibold text-purple-600 hover:opacity-80 transition cursor-pointer"
        >
          Get Pro
        </button>

        {/* 2. 🔔 Notification Bell with Red Dot */}
        <div ref={notifContainerRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative text-slate-600 hover:text-slate-950 transition cursor-pointer p-1 rounded-md"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Notifications</h3>
                  <p className="text-[10px] text-slate-500">
                    {unreadCount} unread store alerts
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs flex items-start gap-2.5 hover:bg-slate-50 transition cursor-pointer ${
                      !n.read ? "bg-sky-50/40" : ""
                    }`}
                    onClick={() => {
                      if (n.link) router.push(n.link);
                    }}
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                      {n.type === "order" ? (
                        <ShoppingBag size={12} />
                      ) : n.type === "inventory" ? (
                        <Package size={12} />
                      ) : (
                        <Sparkles size={12} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 text-xs truncate">{n.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {n.description}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                ))}
              </div>

              <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
                <Link
                  href="/admin/orders"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[11px] font-semibold text-slate-800 hover:underline"
                >
                  View all order activity →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 3. 👥 Dynamic Clickable User Access Requests Icon with Counter Badge (Screenshot Match) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsStaffModalOpen(true)}
            className="text-slate-600 hover:text-slate-950 transition cursor-pointer p-1 rounded-md relative flex items-center justify-center"
            title="Admin Dashboard Access Requests & Staff Approvals"
          >
            <UserCheck className="h-4 w-4" />
            {pendingStaffCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {pendingStaffCount}
              </span>
            )}
          </button>
        </div>

        {/* 4. 🌙 Moon Static Icon (Screenshot Match) */}
        <div
          className="text-slate-600 hover:text-slate-900 transition p-1 rounded-md cursor-pointer"
          title="Appearance Mode"
        >
          <Moon className="h-4 w-4" />
        </div>

        {/* 5. 🎨 Palette / Cookies Static Icon (Screenshot Match) */}
        <div
          className="text-slate-600 hover:text-slate-900 transition p-1 rounded-md cursor-pointer hidden sm:block"
          title="Color Theme"
        >
          <Palette className="h-4 w-4" />
        </div>

        {/* 6. Vertical Separator Line */}
        <div className="h-4 w-px bg-slate-200 shrink-0" />

        {/* 7. Dynamic User Avatar showing First Letters / Initials (Screenshot Match) */}
        <div
          className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-800 tracking-tight shadow-2xs select-none hover:bg-slate-200 transition cursor-pointer"
          title={user?.fullName || user?.primaryEmailAddress?.emailAddress || "Admin Profile"}
        >
          {getInitials()}
        </div>
      </div>

      {/* 👥 Staff Access Requests & Approvals Modal (Exact Match to Screenshot 2) */}
      {isStaffModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsStaffModalOpen(false);
          }}
        >
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 text-slate-900 space-y-6 max-h-[90vh] overflow-y-auto font-satoshi animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-950">
                    Authorized Staff & Access Requests
                  </h3>
                  {pendingStaffCount > 0 && (
                    <span className="bg-[#7F1D1D] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {pendingStaffCount} Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-normal mt-1">
                  Authorize store staff with 1 click without ever opening Clerk dashboard
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* PENDING ACCESS REQUESTS Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                PENDING ACCESS REQUESTS ({pendingRequests.length})
              </h4>

              {pendingRequests.length === 0 ? (
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-1">
                  <CheckCircle2 size={20} className="text-emerald-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No pending access requests</p>
                  <p className="text-[11px] text-slate-400">All staff requests have been approved or processed.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-[#C2B5A5] bg-[#EFE9E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-900">
                          <span>{req.user?.name || req.userEmail.split("@")[0] || "seomaster"}</span>
                          <span className="text-slate-500 font-normal text-xs ml-1.5">
                            ({req.userEmail})
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 italic">
                          &ldquo;{req.reason || "Requesting staff access to manage store"}&rdquo;
                        </p>
                        <p className="text-[11px] text-slate-500 pt-0.5">
                          Requested on {new Date(req.createdAt).toLocaleDateString("en-US")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={isLoadingStaff}
                          onClick={() => handleAccessAction(req.id, req.userId, "APPROVE")}
                          className="bg-white text-slate-900 hover:bg-slate-50 font-bold text-xs px-4 py-2 rounded-full border border-slate-200 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Check size={14} className="stroke-[2.5]" />
                          <span>Approve as Admin</span>
                        </button>
                        <button
                          type="button"
                          disabled={isLoadingStaff}
                          onClick={() => handleAccessAction(req.id, req.userId, "REJECT")}
                          className="bg-slate-200/70 hover:bg-slate-300 text-slate-700 font-medium text-xs px-4 py-2 rounded-full border border-slate-300 transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CURRENT ACTIVE ADMINS Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                CURRENT ACTIVE ADMINS ({authorizedStaff.length > 0 ? authorizedStaff.length : 1})
              </h4>

              <div className="space-y-2.5">
                {authorizedStaff.length > 0 ? (
                  authorizedStaff.map((staff, idx) => (
                    <div
                      key={staff.id || idx}
                      className="p-4 rounded-2xl border border-slate-900 bg-white flex items-center justify-between shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-950">
                            {staff.name || "hassam naveed"}
                          </span>
                          <span className="bg-[#064E3B] text-[#A7F3D0] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            ADMIN
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {staff.email || "hassamnaveed44@gmail.com"}
                        </p>
                      </div>

                      <span className="text-xs text-slate-600 font-medium">
                        {idx === 0 ? "Primary Owner" : "Staff Admin"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl border border-slate-900 bg-white flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-950">
                          {user?.fullName || "hassam naveed"}
                        </span>
                        <span className="bg-[#064E3B] text-[#A7F3D0] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          ADMIN
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {user?.primaryEmailAddress?.emailAddress || "hassamnaveed44@gmail.com"}
                      </p>
                    </div>

                    <span className="text-xs text-slate-600 font-medium">
                      Primary Owner
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                All changes take effect immediately in database
              </span>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs px-6 py-2 shadow-2xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

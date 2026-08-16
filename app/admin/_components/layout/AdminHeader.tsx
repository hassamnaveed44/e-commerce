"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  PanelLeft,
  Search,
  Bell,
  Sun,
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
} from "lucide-react";

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

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("theme-change", callback);
  };
}

function getThemeSnapshot() {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot() {
  return "light";
}

export default function AdminHeader({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot);
  const isDark = theme === "dark";

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

  // Palette Customizer state
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteContainerRef = useRef<HTMLDivElement>(null);

  // Staff Access Requests & Approvals State
  const [mounted, setMounted] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [pendingStaffCount, setPendingStaffCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [authorizedStaff, setAuthorizedStaff] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
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
    const interval = setInterval(fetchStaffData, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const handleAccessAction = async (requestId: string | null, targetUserId: string | null, action: string) => {
    try {
      const res = await fetch("/api/admin/access-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, targetUserId, action }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchStaffData();
      } else {
        alert(data.error || "Action failed");
      }
    } catch (e) {
      console.error("Action error:", e);
      alert("Error performing action");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("theme-change"));
  };

  const setThemeMode = (mode: "light" | "dark") => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("theme-change"));
  };

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
        setIsPaletteOpen(false);
        setIsStaffModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener for all popups
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (paletteContainerRef.current && !paletteContainerRef.current.contains(e.target as Node)) {
        setIsPaletteOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query
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
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const hasResults =
    searchResults.orders.length > 0 || searchResults.products.length > 0 || searchResults.customers.length > 0;

  const handleSelectResult = (url: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(url);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.link) {
      setIsNotifOpen(false);
      router.push(item.link);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-card/95 px-4 sm:px-6 backdrop-blur-md transition-colors duration-200 font-satoshi">
      {/* Left: Sidebar Toggle Icon + Divider + Functional Search Bar */}
      <div className="flex items-center gap-3.5 flex-1 max-w-xl">
        {/* Sidebar Toggle Icon */}
        <button
          type="button"
          onClick={onMenuClick}
          className="text-muted-foreground hover:text-foreground transition p-1 rounded-md cursor-pointer shrink-0"
          title="Toggle Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        {/* Thin Vertical Separator */}
        <div className="h-4 w-px bg-border shrink-0" />

        {/* 🔍 Functional Global Search Input with Dynamic Dropdown */}
        <div ref={searchContainerRef} className="relative w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim() || hasResults) setIsSearchOpen(true);
              }}
              placeholder="Search orders, products, customers..."
              className="w-full h-8 pl-9 pr-14 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded cursor-pointer hover:text-foreground"
            >
              <span>⌘</span>
              <span>k</span>
            </button>
          </div>

          {/* Search Dropdown Popup */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[320px] sm:min-w-[420px] bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 font-satoshi">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  <span>Searching database...</span>
                </div>
              ) : searchQuery && !hasResults ? (
                <div className="p-4 text-center text-muted-foreground text-xs">
                  No orders, products, or customers matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : hasResults ? (
                <div className="max-h-[380px] overflow-y-auto divide-y divide-border text-xs">
                  {/* Orders Category */}
                  {searchResults.orders.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                        <ShoppingBag size={12} /> Orders
                      </p>
                      <div className="space-y-0.5 mt-1">
                        {searchResults.orders.map((order) => (
                          <button
                            key={order.id}
                            type="button"
                            onClick={() => handleSelectResult(order.url)}
                            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-muted transition flex items-center justify-between group cursor-pointer"
                          >
                            <div>
                              <p className="font-mono font-bold text-foreground">{order.orderNumber}</p>
                              <p className="text-[11px] text-muted-foreground">{order.customerName}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-foreground">${order.totalAmount.toFixed(2)}</span>
                              <p className="text-[10px] text-muted-foreground capitalize">{order.status.toLowerCase()}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products Category */}
                  {searchResults.products.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                        <Package size={12} /> Products
                      </p>
                      <div className="space-y-0.5 mt-1">
                        {searchResults.products.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectResult(p.url)}
                            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-muted transition flex items-center gap-3 group cursor-pointer"
                          >
                            <div className="relative w-8 h-8 rounded bg-muted overflow-hidden shrink-0">
                              <Image src={p.image} alt={p.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">{p.name}</p>
                              <p className="text-[11px] text-muted-foreground">${p.price}</p>
                            </div>
                            <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customers Category */}
                  {searchResults.customers.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                        <User size={12} /> Customers
                      </p>
                      <div className="space-y-0.5 mt-1">
                        {searchResults.customers.map((c) => (
                          <div
                            key={c.id}
                            className="px-2.5 py-1.5 rounded-lg flex items-center justify-between text-muted-foreground"
                          >
                            <div>
                              <p className="font-semibold text-foreground">{c.name}</p>
                              <p className="text-[11px]">{c.email}</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-foreground uppercase font-bold">
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
                  <p className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">
                    Quick Navigation
                  </p>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleSelectResult("/admin")}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted transition flex items-center justify-between text-foreground cursor-pointer"
                    >
                      <span>Dashboard Overview</span>
                      <span className="text-[11px] text-muted-foreground">/admin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectResult("/admin/orders")}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted transition flex items-center justify-between text-foreground cursor-pointer"
                    >
                      <span>Manage Orders</span>
                      <span className="text-[11px] text-muted-foreground">/admin/orders</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectResult("/admin/products")}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted transition flex items-center justify-between text-foreground cursor-pointer"
                    >
                      <span>Manage Products & Stock</span>
                      <span className="text-[11px] text-muted-foreground">/admin/products</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectResult("/admin/products/new")}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted transition flex items-center justify-between text-foreground cursor-pointer"
                    >
                      <span>Add New Product</span>
                      <span className="text-[11px] text-muted-foreground">/admin/products/new</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Get Pro + Bell (Notifications) + Theme Toggle + Palette + Divider + User Avatar */}
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Get Pro Link */}
        <button
          type="button"
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:opacity-80 transition cursor-pointer"
        >
          Get Pro
        </button>

        {/* 🔔 Functional Notification Bell with Dropdown */}
        <div ref={notifContainerRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsPaletteOpen(false);
            }}
            className="relative text-muted-foreground hover:text-foreground transition cursor-pointer p-1 rounded-md"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute 0.5 top-0.5 right-0.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-card" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="p-3.5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-foreground">Notifications</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {unreadCount} unread store alerts
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3 text-xs transition cursor-pointer hover:bg-muted/50 flex items-start gap-2.5 ${
                      !n.read ? "bg-muted/30" : ""
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        n.type === "order"
                          ? "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                      }`}
                    >
                      {n.type === "order" ? <ShoppingBag size={13} /> : <Info size={13} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-foreground text-xs truncate">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                        {n.description}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                ))}
              </div>

              <div className="p-2.5 border-t border-border bg-muted/20 text-center">
                <Link
                  href="/admin/orders"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[11px] font-semibold text-foreground hover:underline"
                >
                  View all order activity →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 👥 Staff Access Requests & Approvals Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsStaffModalOpen(true)}
            className="text-muted-foreground hover:text-foreground transition cursor-pointer p-1 rounded-md relative"
            title="Manage Authorized Staff & Access Requests"
          >
            <UserCheck className="h-4 w-4" />
            {pendingStaffCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs animate-pulse">
                {pendingStaffCount}
              </span>
            )}
          </button>
        </div>

        {/* 🌙 / ☀️ Dark & Light Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground transition cursor-pointer p-1 rounded-md"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* 🎨 Functional Theme & Palette Customizer */}
        <div ref={paletteContainerRef} className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => {
              setIsPaletteOpen(!isPaletteOpen);
              setIsNotifOpen(false);
            }}
            className="text-muted-foreground hover:text-foreground transition cursor-pointer p-1 rounded-md"
            title="Theme Settings & Palette"
          >
            <Palette className="h-4 w-4" />
          </button>

          {/* Palette Popup */}
          {isPaletteOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl p-3.5 z-50 animate-in fade-in zoom-in-95">
              <h3 className="font-bold text-xs text-foreground mb-1">Theme Customizer</h3>
              <p className="text-[11px] text-muted-foreground mb-3">
                Customize appearance mode
              </p>

              {/* Mode Switcher */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setThemeMode("light")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                    !isDark
                      ? "border-black dark:border-white bg-muted text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Sun size={14} className="text-amber-500" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeMode("dark")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                    isDark
                      ? "border-white dark:border-white bg-muted text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Moon size={14} className="text-sky-400" />
                  <span>Dark</span>
                </button>
              </div>

              <div className="pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Synchronized with Sidebar</span>
                <Check size={12} className="text-emerald-500" />
              </div>
            </div>
          )}
        </div>

        {/* Thin Vertical Separator */}
        <div className="h-4 w-px bg-border shrink-0" />

        {/* User Profile Avatar */}
        <div
          onClick={() => setIsStaffModalOpen(true)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold font-integral shadow-sm shrink-0 cursor-pointer overflow-hidden border border-border"
          title="Admin Staff Management"
        >
          AD
        </div>
      </div>

      {/* 👥 Staff Access Requests & Approvals Modal (Mounted via Portal outside Header) */}
      {mounted &&
        isStaffModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsStaffModalOpen(false);
            }}
          >
            <div className="w-full max-w-xl my-auto bg-card border border-border shadow-2xl rounded-2xl p-5 sm:p-6 space-y-5 max-h-[85vh] flex flex-col text-left font-satoshi relative z-10 animate-in fade-in zoom-in-95">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-foreground font-sans">Authorized Staff & Access Requests</h2>
                    {pendingStaffCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        {pendingStaffCount} Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Authorize store staff with 1 click without ever opening Clerk dashboard
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Close modal"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-5 overflow-y-auto flex-1 pr-1">
                {/* Section 1: Pending Access Requests */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                    Pending Access Requests ({pendingRequests.length})
                  </h3>
                  {pendingRequests.length === 0 ? (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border text-center text-xs text-muted-foreground">
                      No pending staff access requests at the moment.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {pendingRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-foreground">{req.name || req.email}</span>
                              <span className="text-[10px] text-muted-foreground">({req.email})</span>
                            </div>
                            {req.reason && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 italic">
                                &ldquo;{req.reason}&rdquo;
                              </p>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              Requested on {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleAccessAction(req.id, req.userId, "APPROVE")}
                              className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition cursor-pointer shadow-2xs"
                            >
                              ✓ Approve as Admin
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAccessAction(req.id, req.userId, "REJECT")}
                              className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Active Authorized Staff */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                    Current Active Admins ({authorizedStaff.length})
                  </h3>
                  <div className="divide-y divide-border border rounded-xl bg-card overflow-hidden">
                    {authorizedStaff.map((staff) => (
                      <div key={staff.id} className="p-3.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{staff.fullName || staff.email.split("@")[0]}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                              ADMIN
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{staff.email}</span>
                        </div>

                        <div>
                          {staff.email === "hassamnaveed44@gmail.com" ? (
                            <span className="text-[11px] text-muted-foreground font-semibold">Primary Owner</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAccessAction(null, staff.id, "REVOKE")}
                              className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-semibold transition cursor-pointer"
                            >
                              Revoke Admin
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer with Done Button */}
              <div className="border-t border-border pt-3 flex items-center justify-between text-xs text-muted-foreground shrink-0">
                <span>All changes take effect immediately in database</span>
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 transition cursor-pointer shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}

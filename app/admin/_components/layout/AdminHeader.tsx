"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
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
  XCircle,
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

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
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
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ orders: [], products: [], customers: [] });
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    window.dispatchEvent(new Event("storage"));
  };

  // Keyboard shortcut (⌘k / Ctrl+k) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({ orders: [], products: [], customers: [] });
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data.success && data.results) {
          setResults(data.results);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const hasResults =
    results.orders.length > 0 || results.products.length > 0 || results.customers.length > 0;

  const handleSelectResult = (url: string) => {
    setIsOpen(false);
    setSearchQuery("");
    router.push(url);
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-card/95 px-4 sm:px-6 backdrop-blur-md transition-colors duration-200">
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
                if (searchQuery.trim() || hasResults) setIsOpen(true);
              }}
              placeholder="Search orders, products, customers..."
              className="w-full h-8 pl-9 pr-14 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsOpen(false);
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
                setIsOpen(true);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded cursor-pointer hover:text-foreground"
            >
              <span>⌘</span>
              <span>k</span>
            </button>
          </div>

          {/* Search Dropdown Popup */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[320px] sm:min-w-[420px] bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 font-satoshi">
              {isLoading ? (
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
                  {results.orders.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                        <ShoppingBag size={12} /> Orders
                      </p>
                      <div className="space-y-0.5 mt-1">
                        {results.orders.map((order) => (
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
                  {results.products.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                        <Package size={12} /> Products
                      </p>
                      <div className="space-y-0.5 mt-1">
                        {results.products.map((p) => (
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
                  {results.customers.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                        <User size={12} /> Customers
                      </p>
                      <div className="space-y-0.5 mt-1">
                        {results.customers.map((c) => (
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

      {/* Right: Get Pro + Bell + Theme Toggle + Palette + Divider + User Avatar */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Get Pro Link */}
        <button
          type="button"
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:opacity-80 transition cursor-pointer"
        >
          Get Pro
        </button>

        {/* Notification Bell with Red Dot */}
        <button
          type="button"
          className="relative text-muted-foreground hover:text-foreground transition cursor-pointer"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        {/* 🌙 / ☀️ Dark & Light Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground transition cursor-pointer"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Palette / Customizer Icon */}
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition cursor-pointer hidden sm:block"
          title="Customize Theme"
        >
          <Palette className="h-4 w-4" />
        </button>

        {/* Thin Vertical Separator */}
        <div className="h-4 w-px bg-border shrink-0" />

        {/* User Profile Avatar */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-integral shadow-sm shrink-0 cursor-pointer overflow-hidden border border-border">
          AD
        </div>
      </div>
    </header>
  );
}

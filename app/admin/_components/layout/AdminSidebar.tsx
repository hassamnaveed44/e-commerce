"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  CreditCard,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Clock,
  MessageSquare,
  Package,
  Sparkles,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [ecommerceOpen, setEcommerceOpen] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(true);
  const [firstProductId, setFirstProductId] = useState<string | null>(null);
  const [firstOrderId, setFirstOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFirstEntities() {
      try {
        const [pRes, oRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/orders"),
        ]);
        const pData = await pRes.json();
        const oData = await oRes.json();
        if (pData.success && Array.isArray(pData.products) && pData.products.length > 0) {
          setFirstProductId(pData.products[0].id);
        }
        if (oData.success && Array.isArray(oData.orders) && oData.orders.length > 0) {
          setFirstOrderId(oData.orders[0].id);
        }
      } catch (e) {
        console.error("Sidebar load error:", e);
      }
    }
    loadFirstEntities();
  }, []);

  // Exact Requested Sequence:
  // E-commerce: Dashboard -> Product List -> Product Detail -> Add Product -> Order List -> Order Detail -> Reviews -> Inventory
  const ecommerceSubItems = [
    { title: "Dashboard", href: "/admin", exact: true },
    { title: "Product List", href: "/admin/products", exact: true },
    {
      title: "Product Detail",
      href: firstProductId ? `/admin/products/${firstProductId}` : "/admin/products",
      isDetail: true,
    },
    { title: "Add Product", href: "/admin/products/new", exact: true },
    { title: "Order List", href: "/admin/orders", exact: true },
    {
      title: "Order Detail",
      href: firstOrderId ? `/admin/orders/${firstOrderId}` : "/admin/orders/detail",
      isOrderDetail: true,
    },
    { title: "Reviews", href: "/admin/reviews", exact: true },
    { title: "Inventory", href: "/admin/inventory", exact: true },
  ];

  const paymentSubItems = [
    { title: "Dashboard", href: "/admin/payments", exact: true },
    { title: "Transactions", href: "/admin/payments/transactions", exact: true },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-3 select-none bg-[#FAFAFA] dark:bg-[#121214] text-slate-900 dark:text-slate-100 transition-colors duration-200 font-satoshi overflow-y-auto">
      {/* Top Header & Menus */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer">
          <Link href="/admin" className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black font-integral text-sm font-black shadow-xs shrink-0">
              S.
            </div>
            <div className="flex flex-col truncate">
              <span className="font-integral text-sm font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                SHOP.CO Admin
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">Fashion Store</span>
            </div>
          </Link>
          <ChevronsUpDown className="h-4 w-4 text-slate-400 shrink-0" />
        </div>

        {/* Dashboards Section Title */}
        <p className="px-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">Dashboards</p>

        {/* Menu Navigation */}
        <div className="space-y-1">
          {/* 1. Classic Dashboard */}
          <Link
            href="/admin"
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors",
              pathname === "/admin"
                ? "bg-slate-200/70 dark:bg-slate-800 text-slate-950 dark:text-white font-bold shadow-2xs"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            )}
          >
            <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>Classic Dashboard</span>
          </Link>

          {/* 2. E-COMMERCE SECTION */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setEcommerceOpen(!ecommerceOpen)}
              className="flex w-full items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                <span>E-commerce</span>
              </div>
              {ecommerceOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>

            {ecommerceOpen && (
              <div className="mt-1 ml-4 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-0.5">
                {ecommerceSubItems.map((item) => {
                  let isActive = false;
                  if (item.exact) {
                    isActive = pathname === item.href;
                  } else if (item.isDetail) {
                    isActive =
                      pathname.startsWith("/admin/products/") &&
                      pathname !== "/admin/products/new" &&
                      pathname !== "/admin/products";
                  } else if (item.isOrderDetail) {
                    isActive =
                      pathname === "/admin/orders/detail" ||
                      (pathname.startsWith("/admin/orders/") && pathname !== "/admin/orders");
                  }

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        isActive
                          ? "bg-slate-200/80 dark:bg-slate-800 text-slate-950 dark:text-white font-bold shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                      )}
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. PAYMENT DASHBOARD SECTION */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setPaymentOpen(!paymentOpen)}
              className="flex w-full items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                <span>Payment Dashboard</span>
              </div>
              {paymentOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>

            {paymentOpen && (
              <div className="mt-1 ml-4 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-0.5">
                {paymentSubItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        isActive
                          ? "bg-slate-200/80 dark:bg-slate-800 text-slate-950 dark:text-white font-bold shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                      )}
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Promo Badge & User Profile (Screenshot 4 Match) */}
      <div className="pt-4 space-y-3">
        {/* "Unlock Everything" Card (Screenshot 4 Match) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181B] p-4 shadow-2xs space-y-2.5">
          <h4 className="font-bold text-xs text-slate-950 dark:text-white">
            Unlock Everything
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Get instant access to all premium dashboards, templates, and UI components. Pay once, use forever in unlimited projects.
          </p>
          <button
            type="button"
            className="w-full bg-black hover:bg-black/85 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0 animate-pulse" />
            <span>Get Full Access</span>
          </button>
        </div>

        {/* User Profile Footer Row (Screenshot 4 Match) */}
        <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/user-avatar.png"
              onError={(e) => {
                // Fallback avatar
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";
              }}
              alt="User Avatar"
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Toby Belhome
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                hello@tobybelhome.com
              </span>
            </div>
          </div>

          <button
            type="button"
            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sticky Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121214] z-30 md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in"
          onClick={onMobileClose}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#121214] shadow-2xl z-50 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

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
  MoreVertical,
  Layers,
  Sparkles,
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

  useEffect(() => {
    async function loadFirstProduct() {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setFirstProductId(data.products[0].id);
        }
      } catch (e) {
        console.error("Sidebar load product error:", e);
      }
    }
    loadFirstProduct();
  }, []);

  const ecommerceSubItems = [
    { title: "Dashboard", href: "/admin" },
    { title: "Product List", href: "/admin/products" },
    {
      title: "Product Detail",
      href: firstProductId ? `/admin/products/${firstProductId}` : "/admin/products",
      isDetail: true,
    },
    { title: "Inventory", href: "/admin/inventory" },
    { title: "Add Product", href: "/admin/products/new" },
    { title: "Order List", href: "/admin/orders" },
  ];

  const paymentSubItems = [
    { title: "Balances & Overview", href: "/admin/payments" },
    { title: "Transactions", href: "/admin/payments/transactions" },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-3 select-none bg-muted/40 dark:bg-card text-foreground transition-colors duration-200 font-satoshi">
      {/* Top Header & Menus */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-muted transition cursor-pointer">
          <Link href="/admin" className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black font-integral text-sm font-black shadow-sm shrink-0">
              S.
            </div>
            <div className="flex flex-col truncate">
              <span className="font-integral text-sm font-extrabold tracking-tight text-foreground truncate">
                SHOP.CO Admin
              </span>
              <span className="text-[10px] text-muted-foreground -mt-0.5">Fashion Store</span>
            </div>
          </Link>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>

        {/* Dashboards Section Title */}
        <p className="px-2 text-[11px] font-medium text-muted-foreground">Dashboards</p>

        {/* Menu Navigation */}
        <div className="space-y-2">
          {/* E-COMMERCE SECTION */}
          <div>
            <button
              type="button"
              onClick={() => setEcommerceOpen(!ecommerceOpen)}
              className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-foreground/80 hover:bg-muted transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <span>E-commerce</span>
              </div>
              {ecommerceOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>

            {ecommerceOpen && (
              <div className="mt-1 ml-4 pl-2.5 border-l border-border space-y-0.5">
                {ecommerceSubItems.map((item) => {
                  const isDetailActive =
                    item.isDetail &&
                    pathname.startsWith("/admin/products/") &&
                    pathname !== "/admin/products/new" &&
                    pathname !== "/admin/products";
                  const isActive = pathname === item.href || isDetailActive;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        isActive
                          ? "bg-muted dark:bg-muted/80 text-foreground font-bold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* PAYMENT SECTION */}
          <div>
            <button
              type="button"
              onClick={() => setPaymentOpen(!paymentOpen)}
              className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-foreground/80 hover:bg-muted transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Payment Dashboard</span>
              </div>
              {paymentOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>

            {paymentOpen && (
              <div className="mt-1 ml-4 pl-2.5 border-l border-border space-y-0.5">
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
                          ? "bg-muted dark:bg-muted/80 text-foreground font-bold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
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

      {/* Bottom Section: Theme-responsive Promo Card & Profile */}
      <div className="space-y-3 pt-2">
        {/* Unlock Everything Promo Card */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            <h4 className="font-extrabold text-xs text-foreground font-integral">
              Unlock Everything
            </h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Get instant access to all premium dashboards, templates, and UI components. Pay once, use forever.
          </p>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-black dark:bg-white text-white dark:text-black py-2.5 text-xs font-semibold hover:opacity-90 transition shadow-xs cursor-pointer"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Get Full Access</span>
          </button>
        </div>

        {/* User Profile Bar */}
        <div className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-muted transition">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black font-integral text-xs font-bold shrink-0">
              AD 
            </div>
            <div className="flex flex-col truncate">
              <span className="font-semibold text-xs text-foreground truncate">Admin User</span>
              <span className="text-[10px] text-muted-foreground truncate">admin@shop.co</span>
            </div>  
          </div>
          <button type="button" className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 100% Fixed Sticky Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-30 border-r border-border overflow-y-auto bg-muted/40 dark:bg-card transition-colors duration-200">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 w-72 shadow-2xl z-50 animate-in slide-in-from-left h-full overflow-y-auto bg-muted/40 dark:bg-card border-r border-border transition-colors duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

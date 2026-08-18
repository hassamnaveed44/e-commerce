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
  const [firstOrderId, setFirstOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [prodRes, ordRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/orders"),
        ]);
        const prodData = await prodRes.json();
        const ordData = await ordRes.json();

        if (prodData.success && Array.isArray(prodData.products) && prodData.products.length > 0) {
          setFirstProductId(prodData.products[0].id);
        }
        if (ordData.success && Array.isArray(ordData.orders) && ordData.orders.length > 0) {
          setFirstOrderId(ordData.orders[0].id);
        }
      } catch (e) {
        console.error("Sidebar load error:", e);
      }
    }
    loadInitialData();
  }, []);

  // Exact target sequence:
  // Dashboard -> Product List -> Product Detail -> Add Product -> Order List -> Order Detail -> Inventory -> Reviews
  const ecommerceSubItems = [
    { title: "Dashboard", href: "/admin" },
    { title: "Product List", href: "/admin/products" },
    {
      title: "Product Detail",
      href: firstProductId ? `/admin/products/${firstProductId}` : "/admin/products",
      isProductDetail: true,
    },
    { title: "Add Product", href: "/admin/products/new" },
    { title: "Order List", href: "/admin/orders" },
    {
      title: "Order Detail",
      href: firstOrderId ? `/admin/orders/${firstOrderId}` : "/admin/orders",
      isOrderDetail: true,
    },
    { title: "Inventory", href: "/admin/inventory" },
    { title: "Reviews", href: "/admin/reviews" },
  ];

  const paymentSubItems = [
    { title: "Balances & Overview", href: "/admin/payments" },
    { title: "Transactions", href: "/admin/payments/transactions" },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-3 select-none bg-white dark:bg-card border-r border-slate-200/80 text-foreground transition-colors duration-200 font-satoshi">
      {/* Top Header & Menus */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
          <Link href="/admin" className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black font-integral text-sm font-black shadow-xs shrink-0">
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
              className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-foreground/80 hover:bg-slate-50 transition cursor-pointer"
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
              <div className="mt-1 ml-4 pl-2.5 border-l border-slate-200 dark:border-border space-y-0.5">
                {ecommerceSubItems.map((item) => {
                  const isProductDetailActive =
                    item.isProductDetail &&
                    pathname.startsWith("/admin/products/") &&
                    pathname !== "/admin/products/new" &&
                    pathname !== "/admin/products";

                  const isOrderDetailActive =
                    item.isOrderDetail &&
                    pathname.startsWith("/admin/orders/") &&
                    pathname !== "/admin/orders";

                  const isActive =
                    pathname === item.href ||
                    isProductDetailActive ||
                    isOrderDetailActive;

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        isActive
                          ? "bg-slate-100 dark:bg-muted/80 text-foreground font-bold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-slate-50"
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
              className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-foreground/80 hover:bg-slate-50 transition cursor-pointer"
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
              <div className="mt-1 ml-4 pl-2.5 border-l border-slate-200 dark:border-border space-y-0.5">
                {paymentSubItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        isActive
                          ? "bg-slate-100 dark:bg-muted/80 text-foreground font-bold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-slate-50"
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

      {/* Bottom Promo Card & User Footer */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-border">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 dark:bg-muted/40 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Unlock Everything</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Instant access to all premium dashboards, templates, and UI components. Pay once, use forever.
          </p>
          <a
            href="https://shadcnuikit.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground hover:underline"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Get Full Access</span>
          </a>
        </div>

        <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
              HN
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-foreground truncate">Hassam Naveed</span>
              <span className="text-[10px] text-muted-foreground truncate">Store Manager</span>
            </div>
          </div>
          <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-60 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onMobileClose}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

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

  // Exact Screenshot Sequence
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
  ];

  const paymentSubItems = [
    { title: "Balances & Overview", href: "/admin/payments", exact: true },
    { title: "Transactions", href: "/admin/payments/transactions", exact: true },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-3 select-none bg-muted/40 dark:bg-card text-foreground transition-colors duration-200 font-satoshi">
      {/* Top Header & Menus */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-muted transition cursor-pointer">
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

        {/* Dashboards Section Title (Screenshot Match) */}
        <p className="px-2 text-[11px] font-semibold text-muted-foreground/80">Dashboards</p>

        {/* Menu Navigation */}
        <div className="space-y-1">
          {/* 1. Classic Dashboard (Screenshot Match) */}
          <Link
            href="/admin"
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors",
              pathname === "/admin"
                ? "bg-muted dark:bg-muted/80 text-foreground font-bold shadow-2xs"
                : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>Classic Dashboard</span>
          </Link>

          {/* 2. E-COMMERCE SECTION (Screenshot Match) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setEcommerceOpen(!ecommerceOpen)}
              className="flex w-full items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-foreground/80 hover:bg-muted transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>E-commerce</span>
              </div>
              {ecommerceOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>

            {ecommerceOpen && (
              <div className="mt-1 ml-4 pl-3 border-l border-border/80 space-y-0.5">
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

          {/* 3. PAYMENT DASHBOARD SECTION */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setPaymentOpen(!paymentOpen)}
              className="flex w-full items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-foreground/80 hover:bg-muted transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Payment Dashboard</span>
              </div>
              {paymentOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>

            {paymentOpen && (
              <div className="mt-1 ml-4 pl-3 border-l border-border/80 space-y-0.5">
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

          {/* 4. REVIEWS */}
          <Link
            href="/admin/reviews"
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors",
              pathname === "/admin/reviews"
                ? "bg-muted dark:bg-muted/80 text-foreground font-bold shadow-2xs"
                : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
            )}
          >
            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>Reviews</span>
          </Link>

          {/* 5. INVENTORY */}
          <Link
            href="/admin/inventory"
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors",
              pathname === "/admin/inventory"
                ? "bg-muted dark:bg-muted/80 text-foreground font-bold shadow-2xs"
                : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>Inventory</span>
          </Link>
        </div>
      </div>

      {/* Bottom Profile / Quick Link */}
      <div className="pt-3 border-t border-border space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>View Live Store</span>
          </span>
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">
            ↗
          </span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sticky Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-border bg-card z-30 md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in"
          onClick={onMobileClose}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 bg-card shadow-2xl z-50 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

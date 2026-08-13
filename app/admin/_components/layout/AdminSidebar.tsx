"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  ShoppingBag,
  Package,
  PlusCircle,
  ListOrdered,
  FileText,
  ChevronDown,
  ChevronRight,
  Store,
  Wallet,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({
  collapsed = false,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [ecommerceOpen, setEcommerceOpen] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(true);

  const ecommerceSubItems = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Product List", href: "/admin/products", icon: Package },
    { title: "Product Detail", href: "/admin/products/PROD-1", icon: FileText },
    { title: "Add Product", href: "/admin/products/create", icon: PlusCircle },
    { title: "Order List", href: "/admin/orders", icon: ListOrdered },
  ];

  const paymentSubItems = [
    { title: "Balances & Overview", href: "/admin/payments", icon: Wallet },
    { title: "Transactions", href: "/admin/payments/transactions", icon: ArrowLeftRight },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-4 mb-4 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-integral font-black shadow-md">
              S.
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-integral text-base font-black tracking-tight text-foreground">
                  SHOP.CO
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground -mt-1">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-3">
          {/* E-COMMERCE SECTION */}
          <div>
            <button
              type="button"
              onClick={() => setEcommerceOpen(!ecommerceOpen)}
              className="flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4" />
                {!collapsed && <span>E-Commerce</span>}
              </div>
              {!collapsed && (ecommerceOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />)}
            </button>

            {ecommerceOpen && !collapsed && (
              <div className="mt-1 ml-3 pl-3 border-l border-border space-y-1">
                {ecommerceSubItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-foreground/70 hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      <span>{item.title}</span>
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
              className="flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4" />
                {!collapsed && <span>Payments</span>}
              </div>
              {!collapsed && (paymentOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />)}
            </button>

            {paymentOpen && !collapsed && (
              <div className="mt-1 ml-3 pl-3 border-l border-border space-y-1">
                {paymentSubItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-foreground/70 hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Storefront Link */}
      <div className="pt-4 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition"
        >
          <Store className="h-4 w-4" />
          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <span>Customer Storefront</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          )}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 min-h-screen sticky top-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-card shadow-2xl z-50 animate-in slide-in-from-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

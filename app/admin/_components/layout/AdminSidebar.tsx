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
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
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

  const ecommerceSubItems = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Product List", href: "/admin/products", icon: Package },
    { title: "Product Detail", href: "/admin/products/PROD-1", icon: FileText },
    { title: "Add Product", href: "/admin/products/create", icon: PlusCircle },
    { title: "Order List", href: "/admin/orders", icon: ListOrdered },
    { title: "Order Detail", href: "/admin/orders/ORD-9481", icon: FileText },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 overflow-y-auto">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-2 py-4 mb-4 border-b border-black/10">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white font-integral text-base font-black shadow-md">
              S.
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-integral text-lg font-black tracking-tight text-black">
                  SHOP.CO
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-black/50 -mt-1">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-black/40 mb-2">
            {!collapsed ? "Dashboards & Store" : "•••"}
          </p>

          {/* E-Commerce Collapsible Group */}
          <div>
            <button
              onClick={() => setEcommerceOpen(!ecommerceOpen)}
              className="flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-black hover:bg-black/5 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-4 w-4 text-black" />
                {!collapsed && <span>E-Commerce</span>}
              </div>
              {!collapsed && (
                ecommerceOpen ? (
                  <ChevronDown className="h-4 w-4 text-black/50" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-black/50" />
                )
              )}
            </button>

            {/* Sub-items */}
            {ecommerceOpen && !collapsed && (
              <div className="mt-1 ml-4 pl-3 border-l border-black/10 space-y-1">
                {ecommerceSubItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-black text-white font-semibold shadow-xs"
                          : "text-black/70 hover:bg-black/5 hover:text-black"
                      }`}
                    >
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payments Link */}
          <Link
            href="/admin/payments"
            onClick={onMobileClose}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-1 ${
              pathname === "/admin/payments"
                ? "bg-black text-white shadow-sm font-semibold"
                : "text-black/70 hover:bg-black/5 hover:text-black"
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4" />
              {!collapsed && <span>Payments</span>}
            </div>
            {!collapsed && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0EEED] text-black font-semibold">
                Live
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Footer Storefront Link */}
      <div className="space-y-2 pt-4 border-t border-black/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-black/70 hover:bg-[#F2F0F1] hover:text-black transition"
        >
          <Store className="h-4 w-4" />
          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <span>Customer Store</span>
              <ChevronRight className="h-3.5 w-3.5 text-black/40" />
            </div>
          )}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-black/10 transition-all duration-300 min-h-screen sticky top-0 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 animate-in slide-in-from-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

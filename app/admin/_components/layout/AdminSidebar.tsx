"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  CreditCard,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
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

  const ecommerceSubItems = [
    { title: "Dashboard", href: "/admin" },
    { title: "Product List", href: "/admin/products" },
    { title: "Product Detail", href: "/admin/products/PROD-1" },
    { title: "Add Product", href: "/admin/products/create" },
    { title: "Order List", href: "/admin/orders" },
  ];

  const paymentSubItems = [
    { title: "Balances & Overview", href: "/admin/payments" },
    { title: "Transactions", href: "/admin/payments/transactions" },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-3 select-none bg-[#F4F4F5] text-[#18181B]">
      {/* Top Header & Menus */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-black/5 transition cursor-pointer">
          <Link href="/admin" className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-integral text-sm font-black shadow-sm shrink-0">
              S.
            </div>
            <div className="flex flex-col truncate">
              <span className="font-integral text-sm font-extrabold tracking-tight text-[#18181B] truncate">
                SHOP.CO Admin
              </span>
              <span className="text-[10px] text-[#71717A] -mt-0.5">Fashion Store</span>
            </div>
          </Link>
          <ChevronsUpDown className="h-4 w-4 text-[#71717A] shrink-0" />
        </div>

        {/* Dashboards Section Title */}
        <p className="px-2 text-[11px] font-medium text-[#71717A]">Dashboards</p>

        {/* Menu Navigation */}
        <div className="space-y-2">
          {/* E-COMMERCE SECTION */}
          <div>
            <button
              type="button"
              onClick={() => setEcommerceOpen(!ecommerceOpen)}
              className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#3F3F46] hover:bg-black/5 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#52525B]" />
                <span>E-commerce</span>
              </div>
              {ecommerceOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-[#71717A]" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-[#71717A]" />
              )}
            </button>

            {ecommerceOpen && (
              <div className="mt-1 ml-4 pl-2.5 border-l border-[#E4E4E7] space-y-0.5">
                {ecommerceSubItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        isActive
                          ? "bg-[#E4E4E7] text-[#18181B] font-semibold shadow-2xs"
                          : "text-[#52525B] hover:text-[#18181B] hover:bg-black/5"
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
              className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#3F3F46] hover:bg-black/5 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#52525B]" />
                <span>Payment Dashboard</span>
              </div>
              {paymentOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-[#71717A]" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-[#71717A]" />
              )}
            </button>

            {paymentOpen && (
              <div className="mt-1 ml-4 pl-2.5 border-l border-[#E4E4E7] space-y-0.5">
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
                          ? "bg-[#E4E4E7] text-[#18181B] font-semibold shadow-2xs"
                          : "text-[#52525B] hover:text-[#18181B] hover:bg-black/5"
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

      {/* Bottom Section: Pure White Promo Card & Profile */}
      <div className="space-y-3 pt-2">
        {/* Unlock Everything Promo Card (Pure White Background) */}
        <div className="rounded-2xl border border-[#E4E4E7] bg-white p-4 shadow-sm space-y-2">
          <h4 className="font-extrabold text-xs text-[#18181B] font-integral">
            Unlock Everything
          </h4>
          <p className="text-[11px] text-[#52525B] leading-relaxed">
            Get instant access to all premium dashboards, templates, and UI components. Pay once, use forever in unlimited projects.
          </p>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-black text-white py-2.5 text-xs font-semibold hover:bg-black/85 transition shadow-xs cursor-pointer"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Get Full Access</span>
          </button>
        </div>

        {/* User Profile Bar */}
        <div className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-black/5 transition">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white font-integral text-xs font-bold shrink-0">
              AD 
            </div>
            <div className="flex flex-col truncate">
              <span className="font-semibold text-xs text-[#18181B] truncate">Admin User</span>
              <span className="text-[10px] text-[#71717A] truncate">admin@shop.co</span>
            </div>  
          </div>
          <button type="button" className="text-[#71717A] hover:text-[#18181B] p-1 rounded-md cursor-pointer">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 100% Fixed Sticky Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-30 border-r border-[#E4E4E7] overflow-y-auto bg-[#F4F4F5]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 w-72 shadow-2xl z-50 animate-in slide-in-from-left h-full overflow-y-auto bg-[#F4F4F5]">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

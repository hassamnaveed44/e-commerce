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
  PieChart,
  LayoutDashboard,
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
        const [prodRes, ordRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/orders"),
        ]);
        const prodData = await prodRes.json();
        if (prodData.success && Array.isArray(prodData.products) && prodData.products.length > 0) {
          setFirstProductId(prodData.products[0].id);
        }
        const ordData = await ordRes.json();
        if (ordData.success && Array.isArray(ordData.orders) && ordData.orders.length > 0) {
          setFirstOrderId(ordData.orders[0].id);
        }
      } catch (e) {
        console.error("Sidebar load entities error:", e);
      }
    }
    loadFirstEntities();
  }, []);

  // Exact sequence matching Screenshot 1:
  // 1. Dashboard
  // 2. Product List
  // 3. Product Detail
  // 4. Add Product
  // 5. Order List
  // 6. Order Detail
  // 7. Inventory
  // 8. Reviews
  const ecommerceSubItems = [
    { title: "Dashboard", href: "/admin" },
    { title: "Product List", href: "/admin/products" },
    {
      title: "Product Detail",
      href: firstProductId ? `/admin/products/${firstProductId}` : "/admin/products",
      isDetail: true,
    },
    { title: "Add Product", href: "/admin/products/new" },
    { title: "Order List", href: "/admin/orders" },
    {
      title: "Order Detail",
      href: "/admin/orders",
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
    <div className="flex h-full flex-col justify-between p-3 select-none bg-[#F8F9FA] text-slate-900 transition-colors duration-200 font-satoshi border-r border-slate-200/90">
      {/* Top Header & Menus */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-200/50 transition cursor-pointer">
          <Link href="/admin" className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-integral text-sm font-black shadow-xs shrink-0">
              S.
            </div>
            <div className="flex flex-col truncate">
              <span className="font-integral text-sm font-extrabold tracking-tight text-slate-900 truncate">
                SHOP.CO Admin
              </span>
              <span className="text-[10px] text-slate-400 -mt-0.5">Fashion Store</span>
            </div>
          </Link>
          <ChevronsUpDown className="h-4 w-4 text-slate-400 shrink-0" />
        </div>

        {/* Dashboards Section Title */}
        <p className="px-2 text-[11px] font-medium text-slate-400">Dashboards</p>

        {/* Menu Navigation */}
        <div className="space-y-1.5">
          {/* Classic Dashboard Top Link */}
          <Link
            href="/admin"
            onClick={onMobileClose}
            className={cn(
              "flex w-full items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer",
              pathname === "/admin"
                ? "bg-slate-200/80 text-slate-900 font-bold shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <PieChart className="h-4 w-4 text-slate-500" />
            <span>Classic Dashboard</span>
          </Link>

          {/* E-COMMERCE SECTION */}
          <div>
            <button
              type="button"
              onClick={() => setEcommerceOpen(!ecommerceOpen)}
              className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-200/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-slate-500" />
                <span>E-commerce</span>
              </div>
              {ecommerceOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>

            {ecommerceOpen && (
              <div className="mt-1 ml-4 pl-2.5 border-l border-slate-200 space-y-0.5">
                {ecommerceSubItems.map((item) => {
                  const isProductDetailActive =
                    item.isDetail &&
                    pathname.startsWith("/admin/products/") &&
                    pathname !== "/admin/products/new" &&
                    pathname !== "/admin/products";

                  const isAddProductActive =
                    item.title === "Add Product" &&
                    (pathname === "/admin/products/new" || pathname === "/admin/products/create");

                  const isProductListActive =
                    item.title === "Product List" && pathname === "/admin/products";

                  const isOrderListActive =
                    item.title === "Order List" && pathname === "/admin/orders";

                  const isActive =
                    pathname === item.href ||
                    isProductDetailActive ||
                    isAddProductActive ||
                    isProductListActive ||
                    isOrderListActive;

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "block px-3 py-1.5 rounded-xl text-xs transition-colors",
                        isActive
                          ? "bg-slate-200/80 text-slate-900 font-bold shadow-2xs"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
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
              className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-200/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-500" />
                <span>Payment Dashboard</span>
              </div>
              {paymentOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>

            {paymentOpen && (
              <div className="mt-1 ml-4 pl-2.5 border-l border-slate-200 space-y-0.5">
                {paymentSubItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "block px-3 py-1.5 rounded-xl text-xs transition-colors",
                        isActive
                          ? "bg-slate-200/80 text-slate-900 font-bold shadow-2xs"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
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
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            <h4 className="font-extrabold text-xs text-slate-900 font-integral">
              Unlock Everything
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Get instant access to all premium dashboards, templates, and UI components. Pay once, use forever.
          </p>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-black text-white py-2.5 text-xs font-semibold hover:bg-black/80 transition shadow-xs cursor-pointer"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Get Full Access</span>
          </button>
        </div>

        {/* User Profile Bar */}
        <div className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-slate-200/50 transition">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white font-integral text-xs font-bold shrink-0">
              AD 
            </div>
            <div className="flex flex-col truncate">
              <span className="font-semibold text-xs text-slate-900 truncate">Admin User</span>
              <span className="text-[10px] text-slate-400 truncate">admin@shop.co</span>
            </div>  
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 100% Fixed Sticky Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-30 border-r border-slate-200/90 overflow-y-auto bg-[#F8F9FA] transition-colors duration-200">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 w-72 shadow-2xl z-50 animate-in slide-in-from-left h-full overflow-y-auto bg-[#F8F9FA] border-r border-slate-200 transition-colors duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

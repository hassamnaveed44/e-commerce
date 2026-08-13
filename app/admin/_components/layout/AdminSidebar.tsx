"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  Store,
  ChevronRight,
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

  const navItems = [
    {
      title: "E-Commerce",
      href: "/admin",
      icon: LayoutDashboard,
      badge: "Live",
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Payments",
      href: "/admin/payments",
      icon: CreditCard,
      badge: "14",
      badgeColor: "bg-[#F0EEED] text-black font-semibold",
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      disabled: true,
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: Package,
      disabled: true,
    },
    {
      title: "Customers",
      href: "/admin/customers",
      icon: Users,
      disabled: true,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      disabled: true,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
      disabled: true,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      {/* Brand Header */}
      <div>
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
            {!collapsed ? "Dashboards" : "•••"}
          </p>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div
                  key={item.title}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-black/35 cursor-not-allowed select-none"
                  title="Coming soon"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </div>
                  {!collapsed && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/5 text-black/40">
                      Soon
                    </span>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-black text-white shadow-sm font-semibold"
                    : "text-black/70 hover:bg-black/5 hover:text-black"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-black/70"}`} />
                  {!collapsed && <span>{item.title}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / Storefront link */}
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

        {!collapsed && (
          <div className="rounded-2xl bg-[#F2F0F1] p-3.5 border border-black/5">
            <div className="flex items-center gap-2 text-xs font-semibold text-black mb-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Pro Plan Active</span>
            </div>
            <p className="text-[11px] text-black/60 leading-relaxed">
              Real-time analytics & automated payment reconciliation.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-black/10 transition-all duration-300 min-h-screen sticky top-0 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 animate-in slide-in-from-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

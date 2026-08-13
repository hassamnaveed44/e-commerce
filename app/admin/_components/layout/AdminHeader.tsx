"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { Button } from "../ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname === "/admin/payments") return "Payment Dashboard";
    return "E-commerce Overview";
  };

  const notifications = [
    {
      id: 1,
      title: "New payout scheduled",
      desc: "$18,320.50 scheduled for Oct 26",
      time: "10m ago",
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
    {
      id: 2,
      title: "New high-value order",
      desc: "ORD-9476 for $310.00 completed",
      time: "45m ago",
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
    {
      id: 3,
      title: "Low stock alert",
      desc: "Sleeve Striped T-shirt has 6 items left",
      time: "2h ago",
      icon: AlertCircle,
      color: "text-amber-500",
    },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-black/10 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-black/70 hover:bg-black/5 hover:text-black md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-black/40 font-medium">Dashboard</span>
          <span className="text-black/30">/</span>
          <span className="font-semibold text-black">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right: Search, Notifications, Store link & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
          <input
            type="text"
            placeholder="Search orders, transactions (⌘K)..."
            className="h-9 w-64 lg:w-80 rounded-full border border-black/10 bg-[#F9FAFB] pl-9 pr-4 text-xs text-black placeholder:text-black/40 focus:border-black focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* View Storefront Link */}
        <Link href="/" target="_blank">
          <Button variant="outline" size="sm" className="hidden lg:flex items-center gap-1.5 text-xs">
            <span>Storefront</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-full p-2 text-black/70 hover:bg-black/5 hover:text-black transition"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-black/10 bg-white p-4 shadow-xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <h4 className="font-bold text-xs font-integral uppercase text-black">
                  Notifications
                </h4>
                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-semibold">
                  3 new
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 rounded-xl p-2 hover:bg-[#F9FAFB] transition cursor-pointer"
                    >
                      <Icon className={`h-4 w-4 mt-0.5 ${n.color}`} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-black">{n.title}</p>
                        <p className="text-[11px] text-black/60">{n.desc}</p>
                        <span className="text-[10px] text-black/40">{n.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-full p-1 hover:bg-black/5 transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-xs font-bold font-integral">
              AD
            </div>
            <span className="hidden xl:inline text-xs font-semibold text-black">
              Admin User
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-black/50 hidden xl:inline" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-black/10 bg-white p-2 shadow-xl z-50 text-xs">
              <div className="px-3 py-2 border-b border-black/5">
                <p className="font-semibold text-black">Admin User</p>
                <p className="text-[11px] text-black/50 truncate">admin@shop.co</p>
              </div>
              <div className="py-1">
                <Link
                  href="/admin"
                  className="block px-3 py-2 rounded-lg hover:bg-[#F2F0F1] text-black"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/payments"
                  className="block px-3 py-2 rounded-lg hover:bg-[#F2F0F1] text-black"
                >
                  Payments
                </Link>
              </div>
              <div className="pt-1 border-t border-black/5">
                <Link
                  href="/"
                  className="block px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-medium"
                >
                  Exit to Store
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

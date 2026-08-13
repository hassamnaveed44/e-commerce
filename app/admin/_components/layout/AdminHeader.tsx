"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ExternalLink, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onMenuClick: () => void;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getThemeSnapshot() {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot() {
  return "light";
}

export default function AdminHeader({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot);
  const isDark = theme === "dark";

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    // Notify external store listeners
    window.dispatchEvent(new Event("storage"));
  };

  const getBreadcrumbTitle = () => {
    if (pathname.startsWith("/admin/payments/transactions")) return "Payment / Transactions";
    if (pathname.startsWith("/admin/payments")) return "Payment / Balances";
    if (pathname.startsWith("/admin/products/create")) return "E-Commerce / Add Product";
    if (pathname.startsWith("/admin/products/")) return "E-Commerce / Product Detail";
    if (pathname.startsWith("/admin/products")) return "E-Commerce / Products";
    if (pathname.startsWith("/admin/orders")) return "E-Commerce / Orders";
    return "E-Commerce / Dashboard";
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium">Dashboard</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-semibold text-foreground">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      {/* Right: Search, Theme Toggle, Store link & Profile */}
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block w-64 lg:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dashboard (⌘K)..."
            className="pl-8 h-8 rounded-full bg-muted/40"
          />
        </div>

        {/* ☀️ / 🌙 Light & Dark Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 rounded-full cursor-pointer"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-foreground" />
          )}
        </Button>

        {/* View Customer Storefront */}
        <Link href="/" target="_blank">
          <Button variant="outline" size="sm" className="hidden lg:flex items-center gap-1.5 text-xs h-8">
            <span>Store</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>

        {/* Admin Profile */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-integral shadow-sm">
          AD
        </div>
      </div>
    </header>
  );
}

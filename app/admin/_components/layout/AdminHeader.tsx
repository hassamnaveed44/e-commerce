"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  const getBreadcrumbTitle = () => {
    if (pathname.startsWith("/admin/payments/transactions")) return "Payment / Transactions";
    if (pathname.startsWith("/admin/payments")) return "Payment / Overview";
    if (pathname.startsWith("/admin/products/create")) return "E-Commerce / Add Product";
    if (pathname.startsWith("/admin/products/")) return "E-Commerce / Product Detail";
    if (pathname.startsWith("/admin/products")) return "E-Commerce / Products";
    if (pathname.startsWith("/admin/orders")) return "E-Commerce / Orders";
    return "E-Commerce / Dashboard";
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 px-4 sm:px-6 backdrop-blur-md">
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

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block w-64 lg:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dashboard (⌘K)..."
            className="pl-8 h-8 rounded-full bg-muted/40"
          />
        </div>

        <Link href="/" target="_blank">
          <Button variant="outline" size="sm" className="hidden lg:flex items-center gap-1.5 text-xs h-8">
            <span>Store</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-integral shadow-sm">
          AD
        </div>
      </div>
    </header>
  );
}

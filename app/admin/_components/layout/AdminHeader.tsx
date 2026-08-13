"use client";

import { useSyncExternalStore } from "react";
import {
  PanelLeft,
  Search,
  Bell,
  Sun,
  Moon,
  Palette,
} from "lucide-react";

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

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-card/95 px-4 sm:px-6 backdrop-blur-md transition-colors duration-200">
      {/* Left: Sidebar Toggle Icon + Divider + Search Bar */}
      <div className="flex items-center gap-3.5 flex-1 max-w-xl">
        {/* Sidebar Toggle Icon */}
        <button
          type="button"
          onClick={onMenuClick}
          className="text-muted-foreground hover:text-foreground transition p-1 rounded-md cursor-pointer shrink-0"
          title="Toggle Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        {/* Thin Vertical Separator */}
        <div className="h-4 w-px bg-border shrink-0" />

        {/* 🔍 Search Input */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-8 pl-9 pr-12 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
          />
          {/* ⌘ k Badge */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[11px] font-mono text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">
            <span>⌘</span>
            <span>k</span>
          </div>
        </div>
      </div>

      {/* Right: Get Pro + Bell + Theme Toggle + Palette + Divider + User Avatar */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Get Pro Link */}
        <button
          type="button"
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:opacity-80 transition cursor-pointer"
        >
          Get Pro
        </button>

        {/* Notification Bell with Red Dot */}
        <button
          type="button"
          className="relative text-muted-foreground hover:text-foreground transition cursor-pointer"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        {/* 🌙 / ☀️ Dark & Light Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground transition cursor-pointer"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Palette / Customizer Icon */}
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition cursor-pointer hidden sm:block"
          title="Customize Theme"
        >
          <Palette className="h-4 w-4" />
        </button>

        {/* Thin Vertical Separator */}
        <div className="h-4 w-px bg-border shrink-0" />

        {/* User Profile Avatar */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-integral shadow-sm shrink-0 cursor-pointer overflow-hidden border border-border">
          AD
        </div>
      </div>
    </header>
  );
}

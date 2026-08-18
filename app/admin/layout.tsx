"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "./_components/layout/AdminSidebar";
import AdminHeader from "./_components/layout/AdminHeader";
import AdminAuthGate from "./_components/auth/AdminAuthGate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Strictly enforce light theme
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  return (
    <AdminAuthGate>
      <div className="min-h-screen w-full max-w-full overflow-x-clip bg-[#F8FAFC] text-slate-950 flex font-satoshi">
        {/* Fixed Sticky Sidebar on Desktop */}
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-clip md:pl-64 min-h-screen">
          <AdminHeader onMenuClick={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGate>
  );
}

"use client";

import { usePathname } from "next/navigation";
import TopBanner from "./TopBanner";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { CartProvider } from "@/context/CartContext";

export default function StoreWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <TopBanner />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </CartProvider>
  );
}

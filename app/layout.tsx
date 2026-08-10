import type { Metadata } from "next";
import "./globals.css";
import TopBanner from "@/app/components/common/TopBanner";
import Navbar from "@/app/components/common/Navbar";
import Footer from "@/app/components/common/Footer";

export const metadata: Metadata = {
  title: "SHOP.CO - E-commerce Website",
  description: "Find clothes that match your style",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden bg-white min-h-screen flex flex-col">
        <TopBanner />
        <Navbar />
        <main className="flex-grow">{children}</main>
         <Footer /> 
      </body>
    </html>
  );
}
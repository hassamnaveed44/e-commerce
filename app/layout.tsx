import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import StoreWrapper from "@/app/components/common/StoreWrapper";

export const metadata: Metadata = {
  title: "SHOP.CO - E-commerce & Admin Platform",
  description: "Find clothes that match your style and manage your store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="overflow-x-hidden bg-white min-h-screen flex flex-col">
          <StoreWrapper>{children}</StoreWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}

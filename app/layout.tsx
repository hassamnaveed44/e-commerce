import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import StoreWrapper from "@/app/components/common/StoreWrapper";
import UserSync from "@/app/components/auth/UserSync";

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
      <html lang="en" suppressHydrationWarning>
        <head>
          <Script
            id="theme-initializer"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var theme = localStorage.getItem('theme');
                    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body className="overflow-x-hidden bg-background text-foreground min-h-screen flex flex-col" suppressHydrationWarning>
          <UserSync />
          <StoreWrapper>{children}</StoreWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}

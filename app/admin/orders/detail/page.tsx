"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function OrderDetailFallbackPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadLatestOrder() {
      try {
        const res = await fetch("/api/admin/orders");
        const json = await res.json();
        if (json.success && Array.isArray(json.orders) && json.orders.length > 0) {
          router.replace(`/admin/orders/${json.orders[0].id}`);
        } else {
          router.replace("/admin/orders");
        }
      } catch (err) {
        console.error("Failed to route to order detail:", err);
        setError(true);
      }
    }
    loadLatestOrder();
  }, [router]);

  return (
    <div className="py-24 flex flex-col items-center justify-center gap-2 text-slate-400">
      <RefreshCw size={22} className="animate-spin text-slate-700 dark:text-slate-300" />
      <span className="text-xs">Loading order details...</span>
    </div>
  );
}

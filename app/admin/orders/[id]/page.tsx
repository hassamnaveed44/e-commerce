"use client";

import { use } from "react";
import OrderDetailView from "../_components/OrderDetailView";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return <OrderDetailView orderId={resolvedParams.id} />;
}

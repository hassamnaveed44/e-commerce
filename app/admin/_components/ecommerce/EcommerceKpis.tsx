import { DollarSign, ShoppingBag, TrendingUp, Users, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { ecommerceMetrics } from "../../_data/ecommerceData";

export default function EcommerceKpis() {
  const { totalRevenue, totalOrders, averageOrderValue, activeCustomers } = ecommerceMetrics;

  const kpis = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      change: totalRevenue.change,
      positive: totalRevenue.positive,
      icon: DollarSign,
      iconBg: "bg-black text-white",
    },
    {
      title: "Total Orders",
      value: `+${totalOrders.value.toLocaleString()}`,
      change: totalOrders.change,
      positive: totalOrders.positive,
      icon: ShoppingBag,
      iconBg: "bg-[#F0EEED] text-black",
    },
    {
      title: "Average Order Value",
      value: `$${averageOrderValue.value.toFixed(2)}`,
      change: averageOrderValue.change,
      positive: averageOrderValue.positive,
      icon: TrendingUp,
      iconBg: "bg-[#F0EEED] text-black",
    },
    {
      title: "Active Customers",
      value: `+${activeCustomers.value}`,
      change: activeCustomers.change,
      positive: activeCustomers.positive,
      icon: Users,
      iconBg: "bg-emerald-50 text-emerald-700",
      live: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-black/60">
                  {kpi.title}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpi.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl lg:text-3xl font-extrabold font-integral tracking-tight text-black">
                    {kpi.value}
                  </h3>
                  {kpi.live && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-1 text-xs">
                  <span className="flex items-center font-semibold text-emerald-600">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {kpi.change.split(" ")[0]}
                  </span>
                  <span className="text-black/50">
                    {kpi.change.substring(kpi.change.indexOf(" "))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

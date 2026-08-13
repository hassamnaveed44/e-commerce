"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { revenueData } from "../../_data/ecommerceData";
import { ArrowUpRight } from "lucide-react";

export default function RevenueChart() {
  const [period, setPeriod] = useState("monthly");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
        <div>
          <CardTitle>Sales & Revenue Overview</CardTitle>
          <CardDescription>
            Monthly performance metrics showing sales volume and gross revenue.
          </CardDescription>
        </div>

        <Tabs value={period} onValueChange={setPeriod} className="w-auto">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        {/* Quick summary stat */}
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-3xl font-extrabold font-integral text-black">
            $45,231.89
          </span>
          <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> +20.1% vs prev period
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-black/10">
          {revenueData.map((item, index) => {
            const isHovered = hoveredBar === index;

            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 whitespace-nowrap rounded-xl bg-black px-3 py-1.5 text-[11px] text-white shadow-xl animate-in fade-in zoom-in-95">
                    <p className="font-bold">${item.revenue.toLocaleString()}</p>
                    <p className="text-[10px] text-white/70">{item.sales} orders</p>
                  </div>
                )}

                {/* Animated Bar */}
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    style={{ height: item.height }}
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                      index === revenueData.length - 1
                        ? "bg-black"
                        : "bg-black/20 group-hover:bg-black/70"
                    }`}
                  />
                </div>

                {/* Month Label */}
                <span className="mt-3 text-[11px] font-medium text-black/50 group-hover:text-black">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-black/60">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-black" />
              <span>Current Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-black/20" />
              <span>Historical Trend</span>
            </div>
          </div>
          <span className="font-semibold text-black">Target: $50,000 / mo</span>
        </div>
      </CardContent>
    </Card>
  );
}

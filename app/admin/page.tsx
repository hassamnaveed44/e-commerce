"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  ArrowUpRight,
  Calendar,
  Globe,
  Compass,
  ArrowRight,
  Eye,
  Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ecommerceMetrics, revenueData, recentOrders, topProducts } from "./_data/ecommerceData";

export default function EcommerceDashboardPage() {
  const [chartPeriod, setChartPeriod] = useState("monthly");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const salesByLocation = [
    { country: "United States", percentage: 85, change: "+5.2%", positive: true, volume: "$38,450" },
    { country: "United Kingdom", percentage: 70, change: "+7.8%", positive: true, volume: "$31,660" },
    { country: "Canada", percentage: 60, change: "+3.4%", positive: true, volume: "$27,130" },
    { country: "Germany", percentage: 45, change: "-2.1%", positive: false, volume: "$20,350" },
    { country: "Australia", percentage: 38, change: "+1.2%", positive: true, volume: "$17,180" },
  ];

  const trafficSources = [
    { source: "Direct Search", visits: "24,500", percentage: "45%", color: "bg-primary" },
    { source: "Social Media (Instagram/TikTok)", visits: "16,300", percentage: "30%", color: "bg-primary/70" },
    { source: "Organic Search (Google)", visits: "8,150", percentage: "15%", color: "bg-primary/40" },
    { source: "Email & Referrals", visits: "5,450", percentage: "10%", color: "bg-primary/20" },
  ];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-integral uppercase text-foreground tracking-tight">
            E-Commerce Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time performance overview of your fashion store.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Oct 1, 2026 - Oct 31, 2026</span>
          </div>

          <Link href="/admin/products/create">
            <Button size="sm" className="gap-1.5 text-xs shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Revenue</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl lg:text-3xl font-extrabold font-integral text-foreground">$45,231.89</h3>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <span className="flex items-center font-semibold text-emerald-600">
                  <ArrowUpRight className="h-3.5 w-3.5" /> +20.1%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Orders</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl lg:text-3xl font-extrabold font-integral text-foreground">+2,350</h3>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <span className="flex items-center font-semibold text-emerald-600">
                  <ArrowUpRight className="h-3.5 w-3.5" /> +180.1%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Order Value</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl lg:text-3xl font-extrabold font-integral text-foreground">$89.45</h3>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <span className="flex items-center font-semibold text-emerald-600">
                  <ArrowUpRight className="h-3.5 w-3.5" /> +19.0%
                </span>
                <span className="text-muted-foreground">growth</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Shoppers</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl lg:text-3xl font-extrabold font-integral text-foreground">+573</h3>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <span className="text-emerald-600 font-semibold">+201</span>
                <span className="text-muted-foreground">since last hour</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Row: Revenue Chart + Sales by Location */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
            <div>
              <CardTitle>Sales & Revenue Overview</CardTitle>
              <CardDescription>Monthly transaction volume and gross margins.</CardDescription>
            </div>
            <Tabs value={chartPeriod} onValueChange={setChartPeriod} className="w-auto">
              <TabsList>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-extrabold font-integral text-foreground">$45,231.89</span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> +20.1% target reached
              </span>
            </div>

            <div className="h-60 flex items-end justify-between gap-1 sm:gap-3 pt-6 pb-2 border-b border-border">
              {revenueData.map((item, index) => {
                const isHovered = hoveredBar === index;
                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {isHovered && (
                      <div className="absolute -top-12 z-20 whitespace-nowrap rounded-xl bg-primary text-primary-foreground px-2.5 py-1 text-[10px] shadow-xl">
                        <p className="font-bold">${item.revenue.toLocaleString()}</p>
                        <p className="text-[9px] opacity-70">{item.sales} orders</p>
                      </div>
                    )}
                    <div className="w-full flex items-end justify-center h-full">
                      <div
                        style={{ height: item.height }}
                        className={`w-full max-w-[24px] rounded-t-lg transition-all duration-300 ${
                          index === revenueData.length - 1 ? "bg-primary" : "bg-primary/20 group-hover:bg-primary/70"
                        }`}
                      />
                    </div>
                    <span className="mt-2 text-[10px] sm:text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Sales by Location</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Top geographic customer revenue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {salesByLocation.map((loc) => (
              <div key={loc.country} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">{loc.country}</span>
                    <span className={`text-[10px] font-bold ${loc.positive ? "text-emerald-600" : "text-rose-600"}`}>
                      {loc.change}
                    </span>
                  </div>
                  <span className="font-bold font-integral text-foreground">{loc.volume}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div style={{ width: `${loc.percentage}%` }} className="h-full rounded-full bg-primary" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Row: Top Products & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Top Selling Apparel</CardTitle>
              <CardDescription>High-performing catalog pieces.</CardDescription>
            </div>
            <Link href="/admin/products">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl border border-border bg-card hover:border-foreground/20 transition">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{p.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <Badge variant="secondary" className="text-[9px] py-0 px-1.5">{p.category}</Badge>
                    <span>•</span>
                    <span>{p.salesCount} sold</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold font-integral text-xs text-foreground">${p.revenue.toLocaleString()}</span>
                  <p className="text-[10px] text-emerald-600 font-medium">{p.stock} in stock</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Traffic Sources</CardTitle>
              <Compass className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Customer acquisition channels this month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trafficSources.map((ts) => (
              <div key={ts.source} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{ts.source}</span>
                  <span className="text-muted-foreground font-mono">{ts.visits} ({ts.percentage})</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div style={{ width: ts.percentage }} className={`h-full rounded-full ${ts.color}`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

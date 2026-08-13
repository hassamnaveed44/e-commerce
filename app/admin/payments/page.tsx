"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, ArrowRight, RefreshCw, Bell, AlertCircle, X, ArrowUpDown, BarChart3, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { paymentBalances, paymentTransactions } from "../_data/paymentData";

const currencies = [
  { code: "EUR", label: "eu EUR" },
  { code: "USD", label: "us USD" },
  { code: "GBP", label: "GB GBP" },
  { code: "JPY", label: "JP JPY" },
  { code: "CAD", label: "CA CAD" },
  { code: "AUD", label: "AU AUD" },
];

export default function PaymentDashboardPage() {
  const [sourceCurrency, setSourceCurrency] = useState("eu EUR");
  const [targetCurrency, setTargetCurrency] = useState("us USD");
  const [selectedPeriod, setSelectedPeriod] = useState("7D");

  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);

  const handleSwapCurrencies = () => {
    setSourceCurrency(targetCurrency);
    setTargetCurrency(sourceCurrency);
  };

  // Generate dynamic chart data/path based on selected period
  const getChartData = () => {
    switch (selectedPeriod) {
      case "1D":
        return {
          path: "M 10 50 Q 80 20, 150 50 T 290 40",
          labels: ["9 AM", "1 PM", "5 PM"],
        };
      case "30D":
        return {
          path: "M 10 70 Q 70 20, 130 60 T 220 30 T 290 80",
          labels: ["Jun 7", "Jun 14", "Jun 22", "Jun 30"],
        };
      case "90D":
        return {
          path: "M 10 30 Q 50 90, 100 20 T 180 80 T 240 10 T 290 70",
          labels: ["Apr 23", "May 16", "Jun 7", "Jun 30"],
        };
      case "1Y":
        return {
          path: "M 10 60 Q 90 10, 150 70 T 230 20 T 290 50",
          labels: ["Q1", "Q2", "Q3", "Q4"],
        };
      case "7D":
      default:
        return {
          path: "M 10 80 Q 80 80, 120 40 T 230 50 T 290 20",
          labels: ["Jun 26", "Jun 28", "Jun 30"],
        };
    }
  };

  const chart = getChartData();

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-12">
      
      {/* 2-Column Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ◀️ LEFT CONTAINER (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold font-integral uppercase text-foreground">
                Balances & Payouts
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Total funds in all merchant balances: <span className="font-semibold text-foreground">$1,740.30 USD</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5 sm:hidden">
              <Link href="/admin/payments/transactions">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-xl h-9 border-border bg-card">
                  <span>View All Transactions</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Verification Warning Alert Banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 dark:text-amber-800 w-full">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-900 dark:text-amber-400 shrink-0" />
              <p className="text-xs sm:text-sm font-medium">
                You have information to submit in verification center
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" className="bg-black text-white hover:bg-accent hover:text-black rounded-xl text-xs h-8 px-4 font-semibold">
                Submit Now
              </Button>
              <button type="button" className="text-gray-800 hover:opacity-75 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Currency Balance Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paymentBalances.map((b) => (
              <Card key={b.currency} className="hover:shadow-md transition-shadow cursor-pointer rounded-2xl border-border bg-card">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <span className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-xl bg-muted/60 text-foreground">
                      {b.currency === "USD" ? "US" : b.currency === "EUR" ? "EU" : "GB"}
                    </span>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold font-integral text-foreground">
                        {b.amount} <span className="text-xs font-normal text-muted-foreground">{b.currency}</span>
                      </h3>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Available Balance</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Transactions Card */}
          <Card className="rounded-2xl border-border bg-card pb-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold">Transactions</CardTitle>
                <CardDescription className="text-xs">Updated every several minutes</CardDescription>
              </div>
              <Link href="/admin/payments/transactions">
                <Button variant="ghost" size="sm" className="text-xs gap-1 hover:bg-transparent text-foreground font-semibold">
                  <span>View all</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs defaultValue="latest" className="w-full">
                <div className="px-6 border-b border-border">
                  <TabsList className="bg-transparent p-0 gap-6 h-auto">
                    <TabsTrigger value="latest" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2.5 text-xs font-bold px-0 shadow-none">
                      Latest
                    </TabsTrigger>
                    <TabsTrigger value="upcoming" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2.5 text-xs font-bold px-0 shadow-none">
                      Upcoming
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="latest" className="m-0">
                  <div className="divide-y divide-border/60">
                    {paymentTransactions.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-4 px-6 hover:bg-muted/40 transition">
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground font-mono w-24 hidden sm:inline">{txn.date}</span>
                          <div>
                            <p className="font-semibold text-xs text-foreground">{txn.title}</p>
                            <p className="text-[10px] text-muted-foreground">{txn.status}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`font-bold font-integral text-xs ${txn.positive ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                            {txn.amount}
                          </span>
                          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full border-border bg-card">
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="upcoming" className="p-12 text-center text-xs text-muted-foreground">
                  Nothing to see here right now.
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

        </div>

        {/* ▶️ RIGHT CONTAINER (4 Columns - View All Transactions Button & Exchange Rates Card) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top Right View All Transactions Button */}
          <div className="hidden sm:flex items-center justify-end">
            <Link href="/admin/payments/transactions">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-xl h-9 border-border bg-card">
                <span>View All Transactions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Exchange Rates Interactive Card with Graph & Working Dropdowns/Tabs */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Exchange rates</CardTitle>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <span>Last updated: 11:08 AM</span>
                  <RefreshCw className="h-3 w-3" />
                </div>
              </div>

              {/* Currency Pair Selectors Header with working interactive dropdowns */}
              <div className="flex items-center justify-between pt-3 pb-1 relative">
                
                {/* Source Currency Selector */}
                <div className="relative w-[44%]">
                  <button
                    type="button"
                    onClick={() => {
                      setSourceDropdownOpen(!sourceDropdownOpen);
                      setTargetDropdownOpen(false);
                    }}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-xs font-semibold text-foreground cursor-pointer"
                  >
                    <span>{sourceCurrency}</span>
                    <ChevronRight className="h-3.5 w-3.5 rotate-90 text-muted-foreground" />
                  </button>

                  {sourceDropdownOpen && (
                    <div className="absolute left-0 top-11 z-30 w-full rounded-xl border border-border bg-popover p-1.5 shadow-xl text-left">
                      {currencies.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setSourceCurrency(c.label);
                            setSourceDropdownOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                        >
                          <span>{c.label}</span>
                          {sourceCurrency === c.label && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Swap Button */}
                <button 
                  type="button" 
                  onClick={handleSwapCurrencies}
                  className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition cursor-pointer"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>

                {/* Target Currency Selector */}
                <div className="relative w-[44%]">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetDropdownOpen(!targetDropdownOpen);
                      setSourceDropdownOpen(false);
                    }}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-xs font-semibold text-foreground cursor-pointer"
                  >
                    <span>{targetCurrency}</span>
                    <ChevronRight className="h-3.5 w-3.5 rotate-90 text-muted-foreground" />
                  </button>

                  {targetDropdownOpen && (
                    <div className="absolute right-0 top-11 z-30 w-full rounded-xl border border-border bg-popover p-1.5 shadow-xl text-left">
                      {currencies.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setTargetCurrency(c.label);
                            setTargetDropdownOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                        >
                          <span>{c.label}</span>
                          {targetCurrency === c.label && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Time Period Filter Pills */}
              <div className="flex items-center justify-between pt-2">
                {["1D", "7D", "30D", "90D", "1Y"].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedPeriod === period
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Dynamic SVG Smooth Curve Graph */}
              <div className="h-36 w-full relative flex items-center justify-center pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" fill="none">
                  <path
                    d={chart.path}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-foreground"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute bottom-0 inset-x-0 flex justify-between text-[10px] text-muted-foreground font-mono pt-2 border-t border-border/60">
                  {chart.labels.map((lbl, i) => (
                    <span key={i}>{lbl}</span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <Button className="w-full text-xs h-10 shadow-sm rounded-xl bg-black text-white hover:bg-black/90 font-semibold cursor-pointer">
                  Convert Currencies
                </Button>
                <Button variant="outline" className="w-full text-xs h-10 gap-1.5 rounded-xl border-border bg-card font-semibold cursor-pointer">
                  <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                  <span>Rate Alerts</span>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
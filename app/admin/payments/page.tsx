"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  X,
  ArrowUpDown,
  BarChart3,
  Check,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Building,
  Layers,
  Calculator,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PaymentBalance {
  currency: string;
  label: string;
  flag: string;
  amount: string;
  symbol: string;
  raw: number;
}

interface PaymentTransaction {
  id: string;
  orderNumber: string;
  date: string;
  timestamp: string;
  title: string;
  channel: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  orderStatus: string;
  status: string;
  amount: string;
  amountNumber: number;
  type: string;
  positive: boolean;
}

const currencies = [
  { code: "USD", label: "us USD", symbol: "$", flag: "🇺🇸", rate: 1.0 },
  { code: "PKR", label: "pk PKR", symbol: "₨", flag: "🇵🇰", rate: 279.0 },
];

export default function PaymentDashboardPage() {
  const [balances, setBalances] = useState<PaymentBalance[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [totalRevenueUSD, setTotalRevenueUSD] = useState(0);
  const [totalRevenuePKR, setTotalRevenuePKR] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [sourceCurrency, setSourceCurrency] = useState("us USD");
  const [targetCurrency, setTargetCurrency] = useState("pk PKR");
  const [selectedPeriod, setSelectedPeriod] = useState("7D");
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertAmount, setConvertAmount] = useState("100");

  const fetchPayments = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch("/api/admin/payments");
      const json = await res.json();

      if (json.success && json.data) {
        setBalances(json.data.balances || []);
        setTransactions(json.data.transactions || []);
        setTotalRevenueUSD(json.data.overview?.totalRevenueUSD || 0);
        setTotalRevenuePKR(json.data.overview?.totalRevenuePKR || 0);
        setLastUpdated(json.data.lastUpdated || new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Failed to load payment balances:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSwapCurrencies = () => {
    const prevSource = sourceCurrency;
    setSourceCurrency(targetCurrency);
    setTargetCurrency(prevSource);
  };

  // Live currency calculation
  const getConvertedResult = () => {
    const srcObj = currencies.find((c) => c.label === sourceCurrency) || currencies[0];
    const tgtObj = currencies.find((c) => c.label === targetCurrency) || currencies[1];
    const num = parseFloat(convertAmount) || 0;
    
    // Convert to USD then to Target
    const inUSD = num / srcObj.rate;
    const converted = inUSD * tgtObj.rate;
    
    return converted.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
    <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-12 font-satoshi">
      {/* 2-Column Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ◀️ LEFT CONTAINER (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-integral uppercase text-foreground">
                Balances & Payouts
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Total store funds:{" "}
                <span className="font-bold text-foreground">
                  ${totalRevenueUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                </span>{" "}
                <span className="text-muted-foreground">≈</span>{" "}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ₨ {totalRevenuePKR.toLocaleString("en-US", { minimumFractionDigits: 2 })} PKR
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => fetchPayments(true)}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
              </button>

              <div className="hidden sm:block">
                <Link href="/admin/payments/transactions">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-xl h-9 border-border bg-card font-semibold cursor-pointer">
                    <span>View All Transactions</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Gateway Status Banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900 text-amber-900 dark:text-amber-200 w-full">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-xs sm:text-sm font-medium">
                Live gateway connected · Stripe Checkout (USD) & Cash on Delivery (PKR/USD) active
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 size={11} /> Gateway Online
              </span>
            </div>
          </div>

          {/* Currency Balance Cards Grid (USD & PKR Only) */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-muted/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* US Dollar Card */}
              <Card className="hover:shadow-md transition-shadow rounded-2xl border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <span className="text-xs font-mono font-bold px-3 py-2 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      🇺🇸 USD
                    </span>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold font-integral text-foreground">
                        ${totalRevenueUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </h3>
                      <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                        US Dollar Available Balance
                      </span>
                    </div>
                  </div>
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>

              {/* Pakistani Rupee Card */}
              <Card className="hover:shadow-md transition-shadow rounded-2xl border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <span className="text-xs font-mono font-bold px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                      🇵🇰 PKR
                    </span>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold font-integral text-emerald-600 dark:text-emerald-400">
                        ₨ {totalRevenuePKR.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </h3>
                      <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                        Pakistani Rupee Equivalent (1 USD = 279 PKR)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            </div>
          )}

          {/* Transactions Card */}
          <Card className="rounded-2xl border-border bg-card pb-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold">Live Order Transactions</CardTitle>
                <CardDescription className="text-xs">
                  Updated in real time from customer checkout orders
                </CardDescription>
              </div>
              <Link href="/admin/payments/transactions">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1 hover:bg-transparent text-foreground font-semibold cursor-pointer"
                >
                  <span>View all</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs defaultValue="latest" className="w-full">
                <div className="px-6 border-b border-border">
                  <TabsList className="bg-transparent p-0 gap-6 h-auto">
                    <TabsTrigger
                      value="latest"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2.5 text-xs font-bold px-0 shadow-none"
                    >
                      Latest ({transactions.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="upcoming"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2.5 text-xs font-bold px-0 shadow-none"
                    >
                      Upcoming Settlements
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="latest" className="m-0">
                  {transactions.length === 0 ? (
                    <div className="p-12 text-center text-xs text-muted-foreground">
                      No transactions recorded yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {transactions.slice(0, 6).map((txn) => (
                        <div
                          key={txn.id}
                          className="flex items-center justify-between p-4 px-6 hover:bg-muted/40 transition"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground font-mono w-28 hidden sm:inline">
                              {txn.date}
                            </span>
                            <div>
                              <p className="font-semibold text-xs text-foreground">
                                {txn.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {txn.channel} · {txn.status}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span
                                className={`font-bold font-integral text-xs ${
                                  txn.positive
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-foreground"
                                }`}
                              >
                                {txn.amount}
                              </span>
                              <span className="block text-[10px] text-muted-foreground">
                                ≈ ₨ {(txn.amountNumber * 279).toLocaleString("en-US", { minimumFractionDigits: 2 })} PKR
                              </span>
                            </div>
                            <Link href="/admin/orders">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-full border-border bg-card cursor-pointer"
                              >
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upcoming" className="p-12 text-center text-xs text-muted-foreground">
                  All current customer settlements are synchronized.
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* ▶️ RIGHT CONTAINER (4 Columns - Exchange Rates & Currency Converter) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mobile View All Link */}
          <div className="sm:hidden">
            <Link href="/admin/payments/transactions">
              <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs rounded-xl h-9 border-border bg-card font-semibold">
                <span>View All Transactions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Exchange Rates Interactive Card with Graph & Working USD / PKR Dropdowns */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                    Exchange Rates (USD / PKR)
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <span>Last updated: {lastUpdated}</span>
                  <RefreshCw
                    onClick={() => fetchPayments(true)}
                    className={`h-3 w-3 cursor-pointer ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </div>
              </div>

              {/* Currency Pair Selectors Header */}
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
                          <span>{c.flag} {c.label}</span>
                          {sourceCurrency === c.label && (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          )}
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
                  title="Swap Currencies"
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
                          <span>{c.flag} {c.label}</span>
                          {targetCurrency === c.label && (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          )}
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

              {/* Live Conversion Rate Display */}
              <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs flex items-center justify-between">
                <span className="text-muted-foreground">Current Rate:</span>
                <span className="font-mono font-bold text-foreground">
                  {sourceCurrency === "us USD" ? "1 USD = 279.00 PKR" : "1 PKR = 0.00358 USD"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <Button
                  onClick={() => setConvertModalOpen(true)}
                  className="w-full text-xs h-10 shadow-sm rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calculator size={14} />
                  <span>Convert Currencies (USD ⇄ PKR)</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => alert(`Rate alerts active for 1 USD = 279.00 PKR`)}
                  className="w-full text-xs h-10 gap-1.5 rounded-xl border-border bg-card font-semibold cursor-pointer"
                >
                  <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                  <span>Rate Alerts</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive USD <-> PKR Currency Converter Modal */}
      {convertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <Card className="w-full max-w-md bg-card border-border shadow-2xl rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground font-sans">Currency Converter</h3>
                <p className="text-xs text-muted-foreground">Convert live between US Dollar ($) and Pakistani Rupee (₨)</p>
              </div>
              <button
                type="button"
                onClick={() => setConvertModalOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Currency Swap Selector */}
            <div className="flex items-center justify-between gap-2 p-2 bg-muted/40 rounded-xl border border-border">
              <div className="flex-1 text-center font-bold text-xs text-foreground">
                {sourceCurrency === "us USD" ? "🇺🇸 US Dollar (USD)" : "🇵🇰 Pakistani Rupee (PKR)"}
              </div>
              <button
                type="button"
                onClick={handleSwapCurrencies}
                className="p-2 rounded-lg bg-card border border-border hover:bg-muted text-foreground transition cursor-pointer"
                title="Swap Direction"
              >
                <ArrowUpDown size={14} />
              </button>
              <div className="flex-1 text-center font-bold text-xs text-foreground">
                {targetCurrency === "pk PKR" ? "🇵🇰 Pakistani Rupee (PKR)" : "🇺🇸 US Dollar (USD)"}
              </div>
            </div>

            {/* Input Amount */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Enter Amount to Convert ({sourceCurrency.split(" ")[1]}):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                  {sourceCurrency === "us USD" ? "$" : "₨"}
                </span>
                <input
                  type="number"
                  min="1"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value)}
                  className="w-full h-11 pl-8 pr-4 rounded-xl bg-card border border-border text-base font-bold text-foreground focus:outline-none focus:border-ring"
                  placeholder="Enter amount..."
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground font-medium mr-1">Quick:</span>
                {sourceCurrency === "us USD" ? (
                  [10, 50, 100, 250, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setConvertAmount(String(amt))}
                      className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-[11px] font-semibold text-foreground transition cursor-pointer border border-border"
                    >
                      ${amt}
                    </button>
                  ))
                ) : (
                  [5000, 10000, 25000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setConvertAmount(String(amt))}
                      className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-[11px] font-semibold text-foreground transition cursor-pointer border border-border"
                    >
                      ₨ {amt.toLocaleString()}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Converted Output Display */}
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900 text-center">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Converted Equivalent
              </span>
              <p className="text-2xl font-extrabold font-integral text-emerald-600 dark:text-emerald-400 mt-1">
                {targetCurrency === "pk PKR" ? "₨ " : "$ "}
                {getConvertedResult()} {targetCurrency.split(" ")[1]}
              </p>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Exchange Rate: 1 USD = 279.00 PKR
              </span>
            </div>

            <Button
              onClick={() => setConvertModalOpen(false)}
              className="w-full text-xs font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black cursor-pointer h-10"
            >
              Close Calculator
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
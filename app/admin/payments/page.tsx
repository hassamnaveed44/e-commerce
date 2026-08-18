"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  RefreshCw,
  AlertCircle,
  X,
  ArrowRightLeft,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Check,
  DollarSign,
  CreditCard,
  Building,
  BarChart2,
  Bell,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BalanceItem {
  code: string;
  currency: string;
  label: string;
  amount: string;
  raw: number;
}

interface TransactionItem {
  id: string;
  date: string;
  title: string;
  status: string;
  amount: string;
  isPositive: boolean;
  type: string;
}

interface ChartPoint {
  label: string;
  date: string;
  value: number;
  x: number;
  y: number;
}

export default function PaymentsPage() {
  const [totalFunds, setTotalFunds] = useState("1.740,30 USD");
  const [balances, setBalances] = useState<BalanceItem[]>([
    { code: "US", currency: "USD", label: "US", amount: "1,240.30", raw: 1240.3 },
    { code: "EU", currency: "EUR", label: "EU", amount: "500.00", raw: 500.0 },
    { code: "GB", currency: "GBP", label: "GB", amount: "0.00", raw: 0.0 },
  ]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [activeTab, setActiveTab] = useState<"Latest" | "Upcoming">("Latest");

  // Yellow Banner Dismiss
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Exchange Rates & Timeframes
  const [sourceCurrency, setSourceCurrency] = useState("EU EUR");
  const [targetCurrency, setTargetCurrency] = useState("US USD");
  const [timeframe, setTimeframe] = useState<"1D" | "7D" | "30D" | "90D" | "1Y">("7D");
  const [lastUpdated, setLastUpdated] = useState("11:08 AM");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Chart Hover Tooltip State
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(1);

  // Modals
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertAmount, setConvertAmount] = useState("100");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertTargetRate, setAlertTargetRate] = useState("1.0950");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch payments data from API
  const fetchPayments = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/payments");
      const json = await res.json();
      if (json.success && json.data) {
        setTotalFunds(json.data.totalFundsFormatted || "1.740,30 USD");
        setBalances(json.data.balances || []);
        setTransactions(json.data.transactions || []);
        setLastUpdated(json.data.lastUpdated || "11:08 AM");
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Timeframe points for exchange rates curve
  const timeframeData: Record<string, ChartPoint[]> = {
    "1D": [
      { label: "00:00", date: "Today 00:00", value: 412, x: 10, y: 135 },
      { label: "06:00", date: "Today 06:00", value: 428, x: 75, y: 130 },
      { label: "12:00", date: "Today 12:00", value: 584, x: 140, y: 25 },
      { label: "18:00", date: "Today 18:00", value: 395, x: 200, y: 145 },
      { label: "24:00", date: "Today 24:00", value: 615, x: 270, y: 20 },
    ],
    "7D": [
      { label: "Jun 24", date: "Jun 24, 2024", value: 410, x: 10, y: 135 },
      { label: "Jun 26", date: "Jun 26, 2024", value: 434, x: 75, y: 130 },
      { label: "Jun 27", date: "Jun 27, 2024", value: 580, x: 140, y: 25 },
      { label: "Jun 28", date: "Jun 28, 2024", value: 390, x: 200, y: 145 },
      { label: "Jun 30", date: "Jun 30, 2024", value: 610, x: 270, y: 20 },
    ],
    "30D": [
      { label: "1 Jun", date: "1 Jun, 2024", value: 395, x: 10, y: 140 },
      { label: "8 Jun", date: "8 Jun, 2024", value: 430, x: 75, y: 125 },
      { label: "15 Jun", date: "15 Jun, 2024", value: 620, x: 140, y: 20 },
      { label: "22 Jun", date: "22 Jun, 2024", value: 380, x: 200, y: 150 },
      { label: "30 Jun", date: "30 Jun, 2024", value: 595, x: 270, y: 25 },
    ],
    "90D": [
      { label: "Apr", date: "Apr 2024", value: 380, x: 10, y: 145 },
      { label: "May", date: "May 2024", value: 440, x: 75, y: 120 },
      { label: "May 20", date: "May 20, 2024", value: 650, x: 140, y: 15 },
      { label: "Jun", date: "Jun 2024", value: 400, x: 200, y: 140 },
      { label: "Jul", date: "Jul 2024", value: 590, x: 270, y: 30 },
    ],
    "1Y": [
      { label: "Q1", date: "Q1 2024", value: 350, x: 10, y: 155 },
      { label: "Q2", date: "Q2 2024", value: 430, x: 75, y: 125 },
      { label: "Q2 Late", date: "Mid 2024", value: 640, x: 140, y: 20 },
      { label: "Q3", date: "Q3 2024", value: 420, x: 200, y: 120 },
      { label: "Q4", date: "Q4 2024", value: 680, x: 270, y: 10 },
    ],
  };

  const currentPoints = timeframeData[timeframe] || timeframeData["7D"];
  const activePoint =
    hoveredPointIdx !== null && currentPoints[hoveredPointIdx]
      ? currentPoints[hoveredPointIdx]
      : currentPoints[1];

  // Swap currencies
  const handleSwapCurrencies = () => {
    const temp = sourceCurrency;
    setSourceCurrency(targetCurrency);
    setTargetCurrency(temp);
  };

  // Convert calculation
  const exchangeRate = sourceCurrency.includes("EUR") ? 1.0845 : 0.922;
  const convertedValue = (parseFloat(convertAmount || "0") * exchangeRate).toFixed(2);

  return (
    <div className="space-y-6 pb-20 font-satoshi text-slate-900 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main 2-Column Grid Layout (Screenshots 1 & 2 Match) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: Balances & Transactions (Col Span 8) ================= */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header Title & Subtext */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Balances
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal mt-1">
              Total funds in all balances: {totalFunds}
            </p>
          </div>

          {/* Yellow Verification Alert Banner (Screenshot 2 Match) */}
          {isBannerVisible && (
            <div className="rounded-2xl bg-[#FEF9C3] border border-[#FDE047]/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 text-xs text-slate-800 font-medium">
                <AlertCircle size={17} className="text-amber-600 shrink-0" />
                <span>You have information to submit in verification center</span>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="bg-black hover:bg-black/80 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
                >
                  Submit Now
                </button>
                <button
                  type="button"
                  onClick={() => setIsBannerVisible(false)}
                  className="w-7 h-7 rounded-lg hover:bg-amber-200/50 text-slate-700 flex items-center justify-center transition cursor-pointer"
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* 3 Currency Balance Cards (Screenshot 2 Match) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {balances.map((b) => (
              <div
                key={b.currency}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xs text-slate-700">
                    {b.code}
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-mono">
                    {b.amount} {b.currency}
                  </span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </div>
            ))}
          </div>

          {/* Transactions Card Table (Screenshots 1 & 2 Match) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            {/* Header row: Title + View all */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Transactions
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Updated every several minutes
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1 transition"
              >
                <span>View all</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {/* Tabs: Latest | Upcoming */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("Latest")}
                className={`font-semibold pb-1.5 transition cursor-pointer ${
                  activeTab === "Latest"
                    ? "text-slate-900 border-b-2 border-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Latest
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("Upcoming")}
                className={`font-semibold pb-1.5 transition cursor-pointer ${
                  activeTab === "Upcoming"
                    ? "text-slate-900 border-b-2 border-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Upcoming
              </button>
            </div>

            {/* Transactions Rows List */}
            <div className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 rounded-xl px-2 -mx-2 transition"
                >
                  {/* Left: Date */}
                  <div className="w-24 sm:w-28 shrink-0 text-xs font-bold text-slate-900">
                    {tx.date}
                  </div>

                  {/* Center: Title & Status */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {tx.title}
                    </p>
                    <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                      {tx.status}
                    </span>
                  </div>

                  {/* Right: Amount & Chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold font-mono ${
                        tx.isPositive ? "text-emerald-600" : "text-rose-500"
                      }`}
                    >
                      {tx.amount}
                    </span>
                    <button
                      type="button"
                      className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer shadow-2xs"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Exchange Rates & Trend Chart (Col Span 4) ================= */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            {/* Header: Exchange Rates & Last Updated */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Exchange rates
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-normal">
                <span>Last updated: {lastUpdated}</span>
                <button
                  type="button"
                  onClick={fetchPayments}
                  className="hover:text-slate-700 transition cursor-pointer"
                  title="Refresh rates"
                >
                  <RefreshCw
                    size={12}
                    className={isRefreshing ? "animate-spin text-slate-700" : ""}
                  />
                </button>
              </div>
            </div>

            {/* Currency Selector Row (EU EUR ⇄ US USD) */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={sourceCurrency}
                  onChange={(e) => setSourceCurrency(e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white focus:border-slate-400 outline-none pr-7 cursor-pointer font-medium"
                >
                  <option value="EU EUR">EU EUR</option>
                  <option value="US USD">US USD</option>
                  <option value="GB GBP">GB GBP</option>
                  <option value="PK PKR">PK PKR</option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>

              {/* Swap Button */}
              <button
                type="button"
                onClick={handleSwapCurrencies}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-black transition cursor-pointer shrink-0"
                title="Swap currencies"
              >
                <ArrowRightLeft size={13} />
              </button>

              <div className="relative flex-1">
                <select
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white focus:border-slate-400 outline-none pr-7 cursor-pointer font-medium"
                >
                  <option value="US USD">US USD</option>
                  <option value="EU EUR">EU EUR</option>
                  <option value="GB GBP">GB GBP</option>
                  <option value="PK PKR">PK PKR</option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Timeframe Selector Pills (1D | 7D | 30D | 90D | 1Y) */}
            <div className="flex items-center gap-1.5 pt-1">
              {(["1D", "7D", "30D", "90D", "1Y"] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    timeframe === tf
                      ? "bg-black text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 bg-slate-100/70"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Interactive Smooth SVG Trend Chart (Screenshots 1 & 2 Match) */}
            <div className="relative w-full pt-4 pb-1 select-none">
              {/* Dynamic Tracking Tooltip */}
              {activePoint && (
                <div
                  style={{
                    left: `${Math.min(Math.max(activePoint.x - 20, 10), 160)}px`,
                    top: `${Math.max(activePoint.y - 45, 0)}px`,
                  }}
                  className="absolute z-20 bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-1.5 text-slate-900 pointer-events-none transition-all duration-150 animate-in fade-in"
                >
                  <span className="text-[10px] text-slate-400 font-normal block">
                    {activePoint.date}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-xs bg-black inline-block" />
                      <span className="text-[11px] font-semibold text-slate-700">
                        Page Views
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 font-mono">
                      {activePoint.value}
                    </span>
                  </div>
                </div>
              )}

              {/* Chart SVG */}
              <svg
                viewBox="0 0 280 160"
                className="w-full h-40 overflow-visible cursor-crosshair"
              >
                {/* Horizontal reference grid lines */}
                <line
                  x1="0"
                  y1="25"
                  x2="280"
                  y2="25"
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="80"
                  x2="280"
                  y2="80"
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="135"
                  x2="280"
                  y2="135"
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />

                {/* Vertical tooltip tracker line */}
                {activePoint && (
                  <line
                    x1={activePoint.x}
                    y1="0"
                    x2={activePoint.x}
                    y2="150"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                )}

                {/* Smooth Bezier Trend Curve */}
                <path
                  d={`M 0 135 C 50 135, 65 130, 75 130 C 105 130, 115 25, 140 25 C 170 25, 180 145, 200 145 C 235 145, 255 20, 280 20`}
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points on Curve */}
                {currentPoints.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPointIdx === idx ? "5" : "3.5"}
                    fill={hoveredPointIdx === idx ? "#0F172A" : "#FFFFFF"}
                    stroke="#0F172A"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredPointIdx(idx)}
                  />
                ))}
              </svg>

              {/* Horizontal Dates Axis */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1 px-1">
                <span>Jun 26</span>
                <span>Jun 28</span>
                <span>Jun 30</span>
              </div>
            </div>

            {/* Action Buttons (Screenshot 1 & 2 Match) */}
            <div className="space-y-2 pt-2">
              {/* Convert Currencies Button */}
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(true)}
                className="bg-black hover:bg-black/80 text-white w-full py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer shadow-xs"
              >
                Convert Currencies
              </button>

              {/* Rate Alerts Button */}
              <button
                type="button"
                onClick={() => setIsAlertModalOpen(true)}
                className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 w-full py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
              >
                <BarChart2 size={13} className="text-slate-500" />
                <span>Rate Alerts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 Convert Currencies Modal */}
      {isConvertModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsConvertModalOpen(false);
          }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ArrowRightLeft size={15} />
                <span>Currency Converter</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Amount in {sourceCurrency}
                </label>
                <input
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <span className="text-[11px] text-slate-400 block">
                  Converted to {targetCurrency}
                </span>
                <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
                  {convertedValue} {targetCurrency.split(" ")[1]}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  1 {sourceCurrency.split(" ")[1]} = {exchangeRate} {targetCurrency.split(" ")[1]}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConvertModalOpen(false)}
                className="rounded-lg text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsConvertModalOpen(false);
                  showToast(`Converted ${convertAmount} to ${convertedValue} ${targetCurrency.split(" ")[1]}!`);
                }}
                className="bg-black hover:bg-black/80 text-white rounded-lg text-xs font-semibold"
              >
                Execute Conversion
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Rate Alerts Modal */}
      {isAlertModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAlertModalOpen(false);
          }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Bell size={15} />
                <span>Set Exchange Rate Alert</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAlertModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Receive an instant notification when {sourceCurrency} reaches your target rate against {targetCurrency}.
              </p>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">
                  Target Rate
                </label>
                <input
                  type="text"
                  value={alertTargetRate}
                  onChange={(e) => setAlertTargetRate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAlertModalOpen(false)}
                className="rounded-lg text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsAlertModalOpen(false);
                  showToast(`Rate alert created for ${sourceCurrency} at ${alertTargetRate}!`);
                }}
                className="bg-black hover:bg-black/80 text-white rounded-lg text-xs font-semibold"
              >
                Set Alert
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Verification Center Modal */}
      {isVerificationModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsVerificationModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500" />
                <span>Verification Center</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsVerificationModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your merchant payment processing account is under standard periodic verification. Please confirm your business registration details and settlement bank account.
            </p>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant Name:</span>
                <span className="font-semibold text-slate-800">Poetic Fashion Ltd.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Account:</span>
                <span className="font-semibold text-slate-800">JP Morgan Chase (**** 0440)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-emerald-600">Pending Review</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVerificationModalOpen(false)}
                className="rounded-lg text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsVerificationModalOpen(false);
                  setIsBannerVisible(false);
                  showToast("Verification documents submitted successfully!");
                }}
                className="bg-black hover:bg-black/80 text-white rounded-lg text-xs font-semibold"
              >
                Confirm & Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
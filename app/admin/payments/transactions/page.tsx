"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Download,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  RefreshCw,
  X,
  Check,
  CreditCard,
  Building,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionItem {
  id: string;
  orderNumber?: string;
  date: string;
  title: string;
  customerName?: string;
  customerEmail?: string;
  paymentMethod?: string;
  orderStatus?: string;
  status: string;
  amount: string;
  amountPKR?: string;
  isPositive: boolean;
  type: string;
}

export default function TransactionsPage() {
  const [latestTransactions, setLatestTransactions] = useState<TransactionItem[]>([]);
  const [upcomingTransactions, setUpcomingTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"Latest" | "Upcoming">("Latest");

  // Date Range State
  const [dateRangeLabel, setDateRangeLabel] = useState("22 Jul 2026 - 18 Aug 2026");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Selected Transaction Modal
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchTransactions = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/payments");
      const json = await res.json();
      if (json.success && json.data) {
        setLatestTransactions(json.data.latestTransactions || []);
        setUpcomingTransactions(json.data.upcomingTransactions || []);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 100% Real Dynamic List from Store Orders (No fake withdrawals)
  const currentList = useMemo(() => {
    return activeTab === "Latest" ? latestTransactions : upcomingTransactions;
  }, [activeTab, latestTransactions, upcomingTransactions]);

  // Paginated Slicing
  const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return currentList.slice(start, start + ITEMS_PER_PAGE);
  }, [currentList, currentPage]);

  // Reset to page 1 on tab switch
  const handleTabSwitch = (tab: "Latest" | "Upcoming") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "ID,OrderNumber,Date,Title,Customer,PaymentMethod,Status,Amount,AmountPKR\n";
    const rows = currentList
      .map(
        (t) =>
          `"${t.id}","${t.orderNumber || ""}","${t.date}","${t.title}","${t.customerName || ""}","${t.paymentMethod || ""}","${t.status}","${t.amount}","${t.amountPKR || ""}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${activeTab.toLowerCase()}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Transactions CSV downloaded!");
  };

  return (
    <div className="space-y-6 pb-20 font-satoshi text-slate-900 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header: Title & Action Controls (Screenshot Match) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/payments"
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-2xs"
            title="Back to Balances"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Transactions
          </h1>
        </div>

        {/* Right Tools: Date Range Pill + Export Button */}
        <div className="flex items-center gap-2.5 relative">
          {/* Date Range Picker Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <CalendarIcon size={14} className="text-slate-500" />
              <span>{dateRangeLabel}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {isDateDropdownOpen && (
              <div className="absolute right-0 top-10 z-50 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95">
                {[
                  "22 Jul 2026 - 18 Aug 2026",
                  "Last 7 Days",
                  "Last 30 Days",
                  "This Month",
                  "All Time",
                ].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      setDateRangeLabel(range);
                      setIsDateDropdownOpen(false);
                      showToast(`Filtered by ${range}`);
                    }}
                    className={`w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center justify-between ${
                      dateRangeLabel === range
                        ? "font-bold text-slate-900 bg-slate-50"
                        : "text-slate-600"
                    }`}
                  >
                    <span>{range}</span>
                    {dateRangeLabel === range && (
                      <Check size={13} className="text-slate-900" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export / Download Button (Black Square Button) */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-9 h-9 rounded-xl bg-black hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
            title="Download CSV"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Main Transactions Container Card (Screenshot Match) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        {/* Tabs: Latest | Upcoming */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-2 text-xs">
          <button
            type="button"
            onClick={() => handleTabSwitch("Latest")}
            className={`font-semibold pb-1.5 transition cursor-pointer ${
              activeTab === "Latest"
                ? "text-slate-900 border-b-2 border-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Latest ({latestTransactions.length})
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch("Upcoming")}
            className={`font-semibold pb-1.5 transition cursor-pointer ${
              activeTab === "Upcoming"
                ? "text-slate-900 border-b-2 border-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Upcoming ({upcomingTransactions.length})
          </button>
        </div>

        {/* Transactions Table / List Rows */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw size={18} className="animate-spin text-slate-600" />
            <span className="text-xs">Loading store orders...</span>
          </div>
        ) : paginatedTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {paginatedTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 rounded-xl px-2.5 -mx-2.5 transition cursor-pointer group"
              >
                {/* Left: Date */}
                <div className="w-28 sm:w-32 shrink-0 text-xs font-bold text-slate-900">
                  {tx.date}
                </div>

                {/* Center: Title & Status */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-black transition truncate">
                    {tx.title}
                  </p>
                  <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                    {tx.status}
                  </span>
                </div>

                {/* Right: Amount & Chevron Button */}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTx(tx);
                    }}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer shadow-2xs"
                    title="View details"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            No {activeTab.toLowerCase()} transactions found in your store database.
          </div>
        )}

        {/* 🔢 Bottom Pagination Controls */}
        {currentList.length > ITEMS_PER_PAGE && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-800">
                {Math.min(currentPage * ITEMS_PER_PAGE, currentList.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-800">{currentList.length}</span>{" "}
              entries
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-semibold"
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg font-semibold transition ${
                    currentPage === pageNum
                      ? "bg-black text-white shadow-2xs"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-semibold"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🟢 Transaction Detail Modal */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTx(null);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Transaction Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                <span className="text-[11px] text-slate-400 block">Total Settlement</span>
                <span
                  className={`text-2xl font-bold font-mono mt-1 block ${
                    selectedTx.isPositive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {selectedTx.amount}
                </span>
                {selectedTx.amountPKR && (
                  <span className="text-xs text-slate-500 font-mono block mt-0.5">
                    {selectedTx.amountPKR}
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-700 mt-2 shadow-2xs">
                  {selectedTx.status}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {selectedTx.orderNumber && (
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Order Number:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedTx.orderNumber}
                    </span>
                  </div>
                )}
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[220px]">
                    {selectedTx.customerName || selectedTx.title}
                  </span>
                </div>
                {selectedTx.customerEmail && (
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-mono text-slate-700">
                      {selectedTx.customerEmail}
                    </span>
                  </div>
                )}
                {selectedTx.paymentMethod && (
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Payment Method:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedTx.paymentMethod}
                    </span>
                  </div>
                )}
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-semibold text-slate-800">{selectedTx.date}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Settlement Currency:</span>
                  <span className="font-semibold text-slate-800">USD ($) / PKR (₨)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTx(null)}
                className="rounded-lg text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

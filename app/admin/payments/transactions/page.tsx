"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Download, ArrowLeft, RefreshCw, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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

export default function PaymentTransactionsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchTransactions = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch("/api/admin/payments");
      const json = await res.json();

      if (json.success && json.data?.transactions) {
        setTransactions(json.data.transactions);
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

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = ["Order Number", "Date", "Customer Name", "Customer Email", "Payment Method", "Channel", "Status", "Amount (USD)"];
    const rows = transactions.map((t) => [
      t.orderNumber,
      `"${t.date}"`,
      `"${t.customerName}"`,
      `"${t.customerEmail}"`,
      t.paymentMethod,
      `"${t.channel}"`,
      t.status,
      t.amountNumber.toFixed(2),
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `shop-co-transactions-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTxns = transactions.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(q) ||
      t.orderNumber.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.customerEmail.toLowerCase().includes(q) ||
      t.channel.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && t.status === "Completed") ||
      (statusFilter === "pending" && t.status === "Pending") ||
      (statusFilter === "cancelled" && t.status === "Cancelled");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-12 font-satoshi">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/payments">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border bg-card cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-integral uppercase text-foreground">
              Transactions Ledger
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Live ledger of customer order payments and merchant settlements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchTransactions(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs rounded-xl h-9 border-border bg-card font-semibold cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-2xl border-border bg-card shadow-xs">
        <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-4 gap-4">
          <div>
            <CardTitle className="text-base font-bold">All Records ({filteredTxns.length})</CardTitle>
            <CardDescription className="text-xs">Live records from connected payment gateways</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl border border-border">
              {[
                { label: "All", value: "all" },
                { label: "Completed", value: "completed" },
                { label: "Pending", value: "pending" },
              ].map((btn) => (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => setStatusFilter(btn.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    statusFilter === btn.value
                      ? "bg-card text-foreground shadow-2xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transaction..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-44 sm:w-60 rounded-xl border border-border bg-muted/40 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            {isLoading ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-muted/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredTxns.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-sm font-semibold text-foreground">No transactions found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <TableHead className="py-3 px-6 font-semibold">Date</TableHead>
                    <TableHead className="py-3 px-6 font-semibold">Description & Channel</TableHead>
                    <TableHead className="py-3 px-6 font-semibold">Customer</TableHead>
                    <TableHead className="py-3 px-6 font-semibold">Status</TableHead>
                    <TableHead className="py-3 px-6 font-semibold text-right">Amount</TableHead>
                  </tr>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {filteredTxns.map((t) => (
                    <TableRow key={t.id} className="hover:bg-muted/40 transition">
                      <TableCell className="py-3.5 px-6 font-mono text-xs text-muted-foreground">
                        {t.date}
                      </TableCell>

                      <TableCell className="py-3.5 px-6">
                        <Link href="/admin/orders" className="font-bold text-xs text-foreground hover:underline">
                          {t.title}
                        </Link>
                        <span className="block text-[11px] text-muted-foreground">{t.channel}</span>
                      </TableCell>

                      <TableCell className="py-3.5 px-6 text-xs">
                        <span className="font-medium text-foreground">{t.customerName}</span>
                        <span className="block text-[11px] text-muted-foreground">{t.customerEmail}</span>
                      </TableCell>

                      <TableCell className="py-3.5 px-6">
                        {t.status === "Completed" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                            <CheckCircle2 size={11} /> Completed
                          </span>
                        ) : t.status === "Pending" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                            <Clock size={11} /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                            <AlertCircle size={11} /> Cancelled
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 px-6 text-right font-bold font-sans text-xs text-emerald-600 dark:text-emerald-400">
                        {t.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

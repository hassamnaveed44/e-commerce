"use client";

import { useState } from "react";
import { Search, Download, Eye, ArrowUpDown, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { transactionsData, Transaction } from "../../_data/paymentData";
import TransactionModal from "./TransactionModal";

export default function TransactionsTable() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = transactionsData.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(search.toLowerCase()) ||
      txn.customerName.toLowerCase().includes(search.toLowerCase()) ||
      txn.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      txn.orderId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = activeTab === "All" || txn.status === activeTab;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "Succeeded":
        return <Badge variant="success">Succeeded</Badge>;
      case "Pending":
        return <Badge variant="warning">Pending</Badge>;
      case "Refunded":
        return <Badge variant="destructive">Refunded</Badge>;
      case "Failed":
        return <Badge variant="destructive" className="bg-rose-100 text-rose-800">Failed</Badge>;
    }
  };

  return (
    <>
      <Card className="col-span-full">
        <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-4 gap-4">
          <div>
            <CardTitle>Transactions Log</CardTitle>
            <CardDescription>
              Real-time payment ledger, gateway responses, and dispute records.
            </CardDescription>
          </div>

          {/* Controls: Search, Tabs & Export */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList>
                <TabsTrigger value="All">All</TabsTrigger>
                <TabsTrigger value="Succeeded">Succeeded</TabsTrigger>
                <TabsTrigger value="Pending">Pending</TabsTrigger>
                <TabsTrigger value="Refunded">Refunded</TabsTrigger>
                <TabsTrigger value="Failed">Failed</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/40" />
              <input
                type="text"
                placeholder="Search transaction, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-44 sm:w-52 rounded-full border border-black/10 bg-[#F9FAFB] pl-8 pr-3 text-xs text-black placeholder:text-black/40 focus:border-black focus:outline-none"
              />
            </div>

            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Channel / Method</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-black/50">
                    No transactions found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((txn) => (
                  <TableRow key={txn.id} className="cursor-pointer">
                    <TableCell className="font-mono text-xs font-bold text-black">
                      {txn.id}
                      <span className="block text-[10px] text-black/40 font-normal">
                        {txn.orderId}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-semibold text-xs text-black">{txn.customerName}</p>
                        <p className="text-[11px] text-black/50">{txn.customerEmail}</p>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-black/80">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span>{txn.paymentMethod}</span>
                        {txn.cardLast4 && (
                          <span className="text-black/50 text-[11px]">•••• {txn.cardLast4}</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-black/60">
                      <p>{txn.date}</p>
                      <p className="text-[10px] text-black/40">{txn.time}</p>
                    </TableCell>

                    <TableCell>{getStatusBadge(txn.status)}</TableCell>

                    <TableCell className="text-right font-bold text-xs text-black font-integral">
                      <span className={txn.status === "Refunded" ? "text-rose-600" : "text-black"}>
                        {txn.status === "Refunded" ? "-" : "+"} ${txn.amount.toFixed(2)}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedTransaction(txn)}
                        className="h-7 px-2.5 text-xs gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      <TransactionModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Download, ArrowLeft, ArrowUpDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { paymentTransactions } from "../../_data/paymentData";

export default function PaymentTransactionsPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredTxns = paymentTransactions.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.amount.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/payments">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-integral uppercase text-foreground">
              Transactions Ledger
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Historical ledger of merchant withdrawals, card payments, and refunds.
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5 text-xs w-full sm:w-auto">
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-4 gap-4">
          <div>
            <CardTitle>All Records ({filteredTxns.length})</CardTitle>
            <CardDescription>Filtered by date and clearance channel.</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Tabs value={filterType} onValueChange={setFilterType} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="deposit">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transaction..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-44 sm:w-56 rounded-full border border-input bg-muted/40 pl-8 pr-3 text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description & Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTxns.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{t.date}</TableCell>
                    <TableCell>
                      <p className="font-bold text-xs text-foreground">{t.title}</p>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">{t.type}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">{t.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs font-integral">
                      <span className={t.positive ? "text-emerald-600" : "text-foreground"}>
                        {t.amount}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

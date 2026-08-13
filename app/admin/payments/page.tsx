"use client";

import Link from "next/link";
import { ChevronRight, ArrowUpRight, ArrowDownRight, ArrowRight, RefreshCw, Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { paymentBalances, paymentTransactions, exchangeRates } from "../_data/paymentData";

export default function PaymentDashboardPage() {
  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-integral uppercase text-foreground">
            Balances & Payouts
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Total funds in all merchant balances: <span className="font-semibold text-foreground font-integral">$1,740.30 USD</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/payments/transactions">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <span>View All Transactions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Currency Balance Cards Grid (USD, EUR, GBP) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {paymentBalances.map((b) => (
          <Card key={b.currency} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{b.flag}</span>
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

      {/* 2-Column Section: Transactions Card (8 Cols) + Exchange Rates (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transactions with Tabs */}
        <Card className="lg:col-span-8 pb-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Updated live every several minutes</CardDescription>
            </div>
            <Link href="/admin/payments/transactions">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <span>View all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs defaultValue="latest" className="w-full">
              <div className="px-6 border-b border-border">
                <TabsList className="bg-transparent p-0 gap-4">
                  <TabsTrigger value="latest" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 text-xs font-bold">
                    Latest
                  </TabsTrigger>
                  <TabsTrigger value="upcoming" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2 text-xs font-bold">
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
                        <span className={`font-bold font-integral text-xs ${txn.positive ? "text-emerald-600" : "text-foreground"}`}>
                          {txn.amount}
                        </span>
                        <Button variant="outline" size="icon" className="h-7 w-7 rounded-full">
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="upcoming" className="p-6 text-center text-xs text-muted-foreground">
                No upcoming auto-withdrawals scheduled.
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right Column: Exchange Rates & Rate Alerts */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Exchange Rates</CardTitle>
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <CardDescription>Live interbank market pricing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {exchangeRates.map((rate) => (
                <div key={rate.pair} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-xs font-semibold text-foreground">{rate.pair}</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-foreground block">{rate.rate}</span>
                    <span className={`text-[10px] font-semibold ${rate.positive ? "text-emerald-600" : "text-rose-600"}`}>
                      {rate.change}
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-2 space-y-2">
                <Button className="w-full text-xs h-9 shadow-sm">
                  Convert Currencies
                </Button>
                <Button variant="outline" className="w-full text-xs h-9 gap-1.5">
                  <Bell className="h-3.5 w-3.5" />
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Download, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { recentOrders } from "../_data/ecommerceData";

export default function OrderListPage() {
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("All");

  const filteredOrders = recentOrders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesTab = statusTab === "All" || o.status === statusTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-integral uppercase text-foreground">
            Order Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track customer orders, fulfillment statuses, and invoices.
          </p>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5 text-xs w-full sm:w-auto">
          <Download className="h-3.5 w-3.5" />
          <span>Export Orders</span>
        </Button>
      </div>

      <Card className="col-span-full">
        <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-4 gap-4">
          <div>
            <CardTitle>Customer Orders ({filteredOrders.length})</CardTitle>
            <CardDescription>Real-time order statuses and customer receipts.</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Tabs value={statusTab} onValueChange={setStatusTab} className="w-auto">
              <TabsList>
                <TabsTrigger value="All">All</TabsTrigger>
                <TabsTrigger value="Completed">Completed</TabsTrigger>
                <TabsTrigger value="Processing">Processing</TabsTrigger>
                <TabsTrigger value="Pending">Pending</TabsTrigger>
                <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-44 sm:w-52 rounded-full border border-input bg-muted/40 pl-8 pr-3 text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-bold text-foreground">{order.id}</TableCell>
                    <TableCell>
                      <p className="font-bold text-xs text-foreground">{order.customerName}</p>
                      <p className="text-[11px] text-muted-foreground">{order.customerEmail}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{order.date}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{order.itemsCount} items</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "Completed" ? "success" : order.status === "Pending" ? "warning" : "default"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs text-foreground font-integral">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="secondary" className="h-7 px-2.5 text-xs gap-1">
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </Button>
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

"use client";

import { useState } from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { recentOrders, Order } from "../../_data/ecommerceData";

export default function RecentOrdersTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredOrders = recentOrders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Completed":
        return <Badge variant="success">Completed</Badge>;
      case "Processing":
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200">Processing</Badge>;
      case "Pending":
        return <Badge variant="warning">Pending</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
    }
  };

  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            You have {recentOrders.length} total orders recorded today.
          </CardDescription>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-44 sm:w-56 rounded-full border border-black/10 bg-[#F9FAFB] pl-8 pr-3 text-xs text-black placeholder:text-black/40 focus:border-black focus:bg-white focus:outline-none"
            />
          </div>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-black/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-full border border-black/10 bg-[#F9FAFB] px-3 text-xs font-medium text-black focus:border-black focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>Amount</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-black/50">
                  No orders found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-semibold text-xs font-mono">
                    {order.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-[11px] font-bold">
                        {order.customerAvatar}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-black">{order.customerName}</p>
                        <p className="text-[11px] text-black/50">{order.customerEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-xs text-black/70">{order.paymentMethod}</TableCell>
                  <TableCell className="text-right font-bold text-xs text-black font-integral">
                    ${order.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

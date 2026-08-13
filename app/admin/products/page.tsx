"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, AlertCircle, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { topProducts } from "../_data/ecommerceData";

export default function ProductListPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockStatus, setStockStatus] = useState("All");

  const filteredProducts = topProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    const matchesStock =
      stockStatus === "All" ||
      (stockStatus === "In Stock" && p.stock >= 10) ||
      (stockStatus === "Low Stock" && p.stock < 10);

    return matchesSearch && matchesCat && matchesStock;
  });

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-integral uppercase text-foreground">
            Products
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage, filter, and track inventory for all SHOP.CO catalog apparel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>
          <Link href="/admin/products/create">
            <Button size="sm" className="gap-1.5 text-xs shadow-sm">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStockStatus("All")}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            stockStatus === "All" ? "border-primary bg-primary text-primary-foreground shadow-xs" : "border-border bg-card hover:border-foreground/20"
          }`}
        >
          <span className="text-[11px] block font-medium opacity-70">All Products</span>
          <span className="text-xl font-extrabold font-integral">{topProducts.length}</span>
        </button>

        <button
          onClick={() => setStockStatus("In Stock")}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            stockStatus === "In Stock" ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-border bg-card hover:border-foreground/20"
          }`}
        >
          <span className="text-[11px] block font-medium text-muted-foreground">In Stock</span>
          <span className="text-xl font-extrabold font-integral text-emerald-600">
            {topProducts.filter((p) => p.stock >= 10).length}
          </span>
        </button>

        <button
          onClick={() => setStockStatus("Low Stock")}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            stockStatus === "Low Stock" ? "border-amber-500 bg-amber-50 text-amber-900" : "border-border bg-card hover:border-foreground/20"
          }`}
        >
          <span className="text-[11px] block font-medium text-muted-foreground">Low Stock Alert</span>
          <span className="text-xl font-extrabold font-integral text-amber-600">
            {topProducts.filter((p) => p.stock < 10).length}
          </span>
        </button>

        <div className="p-3 rounded-2xl border border-border bg-card text-left">
          <span className="text-[11px] block font-medium text-muted-foreground">Total Gross</span>
          <span className="text-xl font-extrabold font-integral text-foreground">$298.5K</span>
        </div>
      </div>

      <Card className="col-span-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
          <div>
            <CardTitle>Catalog Products ({filteredProducts.length})</CardTitle>
            <CardDescription>Active garments listed on the SHOP.CO store.</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search SKU, name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full sm:w-56 rounded-full border border-border bg-muted/30 pl-8 pr-3 text-xs text-foreground focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-full border border-border bg-muted/30 px-3 text-xs font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="T-Shirts">T-Shirts</option>
              <option value="Jeans">Jeans</option>
              <option value="Shirts">Shirts</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name & SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>Sales Volume</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => {
                  const isLow = p.stock < 10;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="font-bold text-xs text-foreground">{p.name}</p>
                        <span className="font-mono text-[10px] text-muted-foreground">SKU: {p.id}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-xs font-integral text-foreground">
                        ${p.price}.00
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${isLow ? "text-amber-600 flex items-center gap-1" : "text-emerald-700"}`}>
                            {isLow && <AlertCircle className="h-3 w-3" />}
                            {p.stock} units
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.salesCount} sold (${p.revenue.toLocaleString()})
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/products/${p.id}`}>
                          <Button size="sm" variant="secondary" className="h-7 px-2.5 text-xs gap-1">
                            <Eye className="h-3 w-3" />
                            <span>Details</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

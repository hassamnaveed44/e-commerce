"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Trash2, Edit3, ArrowUpDown, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../_components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../_components/ui/table";
import { Badge } from "../_components/ui/badge";
import { Button } from "../_components/ui/button";
import { topProducts } from "../_data/ecommerceData";

export default function ProductListPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredProducts = topProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-integral uppercase text-black">
            Product List
          </h1>
          <p className="text-xs sm:text-sm text-black/60 mt-1">
            Manage your store apparel catalog, inventory levels, and prices.
          </p>
        </div>

        <Link href="/admin/products/create">
          <Button size="sm" className="gap-1.5 text-xs shadow-sm w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      <Card className="col-span-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
          <div>
            <CardTitle>Catalog Products ({filteredProducts.length})</CardTitle>
            <CardDescription>Active garments listed on the SHOP.CO store.</CardDescription>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/40" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full sm:w-56 rounded-full border border-black/10 bg-[#F9FAFB] pl-8 pr-3 text-xs text-black focus:border-black focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-full border border-black/10 bg-[#F9FAFB] px-3 text-xs font-medium text-black focus:border-black focus:outline-none cursor-pointer"
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
                  <TableHead>SKU / ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => {
                  const isLow = p.stock < 10;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs font-semibold text-black/70">
                        {p.id}
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-xs text-black">{p.name}</p>
                        <p className="text-[10px] text-emerald-600 font-medium">In Stock</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-xs font-integral text-black">
                        ${p.price}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${isLow ? "text-amber-600 flex items-center gap-1" : "text-black"}`}>
                            {isLow && <AlertCircle className="h-3 w-3" />}
                            {p.stock} units
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-black/60">{p.salesCount} sold</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/products/${p.id}`}>
                            <Button size="sm" variant="secondary" className="h-7 px-2 text-xs gap-1">
                              <Eye className="h-3 w-3" />
                              <span>View</span>
                            </Button>
                          </Link>
                        </div>
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

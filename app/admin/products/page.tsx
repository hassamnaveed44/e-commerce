"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  PlusCircle,
  ChevronDown,
  Columns3,
  ArrowUpDown,
  Star,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProductItem {
  id: string;
  name: string;
  image: string;
  price: string;
  priceNum: number;
  category: string;
  stock: number;
  sku: string;
  rating: number;
  status: "Active" | "Out Of Stock" | "Closed For Sale";
}

const initialProducts: ProductItem[] = [
  {
    id: "PROD-1",
    name: "T-shirt with Tape Details",
    image: "/images/product-1.png",
    price: "$120.00",
    priceNum: 120,
    category: "T-Shirts",
    stock: 45,
    sku: "RCH45Q1A",
    rating: 4.9,
    status: "Active",
  },
  {
    id: "PROD-2",
    name: "Skinny Fit Jeans",
    image: "/images/product-2.png",
    price: "$240.00",
    priceNum: 240,
    category: "Jeans",
    stock: 25,
    sku: "MVCFH27F",
    rating: 4.65,
    status: "Active",
  },
  {
    id: "PROD-3",
    name: "Checkered Shirt",
    image: "/images/product-3.png",
    price: "$180.00",
    priceNum: 180,
    category: "Shirts",
    stock: 0,
    sku: "CK8829PL",
    rating: 4.65,
    status: "Out Of Stock",
  },
  {
    id: "PROD-4",
    name: "Sleeve Striped T-shirt",
    image: "/images/product-4.png",
    price: "$130.00",
    priceNum: 130,
    category: "T-Shirts",
    stock: 10,
    sku: "ST9901TR",
    rating: 4.65,
    status: "Active",
  },
  {
    id: "PROD-5",
    name: "Vertical Striped Shirt",
    image: "/images/product-5.png",
    price: "$212.00",
    priceNum: 212,
    category: "Shirts",
    stock: 25,
    sku: "VS4421SH",
    rating: 4.65,
    status: "Closed For Sale",
  },
  {
    id: "PROD-6",
    name: "Courage Graphic T-shirt",
    image: "/images/product-6.png",
    price: "$145.00",
    priceNum: 145,
    category: "T-Shirts",
    stock: 25,
    sku: "CG1049TS",
    rating: 4.65,
    status: "Closed For Sale",
  },
  {
    id: "PROD-7",
    name: "Loose Fit Bermuda Shorts",
    image: "/images/product-7.png",
    price: "$160.00",
    priceNum: 160,
    category: "Shorts",
    stock: 25,
    sku: "BS8810LF",
    rating: 4.65,
    status: "Closed For Sale",
  },
  {
    id: "PROD-8",
    name: "Faded Skinny Jeans",
    image: "/images/product-8.png",
    price: "$210.00",
    priceNum: 210,
    category: "Jeans",
    stock: 25,
    sku: "FJ9902SJ",
    rating: 4.65,
    status: "Closed For Sale",
  },
  {
    id: "PROD-9",
    name: "Casual Comfort Jacket",
    image: "/images/casual.png",
    price: "$320.00",
    priceNum: 320,
    category: "Outerwear",
    stock: 15,
    sku: "CJ3312JK",
    rating: 4.8,
    status: "Active",
  },
  {
    id: "PROD-10",
    name: "Formal Business Blazer",
    image: "/images/formal.png",
    price: "$450.00",
    priceNum: 450,
    category: "Formal",
    stock: 8,
    sku: "FS5521ST",
    rating: 4.9,
    status: "Active",
  },
  {
    id: "PROD-11",
    name: "Gym Fit Athletic Set",
    image: "/images/gymfit.png",
    price: "$110.00",
    priceNum: 110,
    category: "Activewear",
    stock: 30,
    sku: "GF2201AS",
    rating: 4.7,
    status: "Active",
  },
  {
    id: "PROD-12",
    name: "Party Dress Gala Edition",
    image: "/images/partydress.png",
    price: "$290.00",
    priceNum: 290,
    category: "Dresses",
    stock: 12,
    sku: "PD7719GE",
    rating: 4.85,
    status: "Closed For Sale",
  },
];

export default function ProductListPage() {
  const [products] = useState<ProductItem[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [priceFilter, setPriceFilter] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  // Status Filter options
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [priceMenuOpen, setPriceMenuOpen] = useState(false);

  const categories = ["All", "T-Shirts", "Jeans", "Shirts", "Shorts", "Outerwear", "Formal", "Activewear", "Dresses"];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    const matchesPrice =
      priceFilter === "All" ||
      (priceFilter === "$100-$200" && p.priceNum >= 100 && p.priceNum <= 200) ||
      (priceFilter === "Under $100" && p.priceNum < 100) ||
      (priceFilter === "Over $200" && p.priceNum > 200);

    return matchesSearch && matchesStatus && matchesCat && matchesPrice;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-10">
      {/* 1️⃣ TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Products
        </h1>

        <Link href="/admin/products/create">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </Link>
      </div>

      {/* 2️⃣ STAT KPI CARDS (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales */}
        <Card className="p-5 flex flex-col justify-between bg-card border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total Sales</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-500/10 px-1.5 py-0.2 rounded-md">
              +20.1%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-integral text-foreground">
              $30,230
            </span>
          </div>
        </Card>

        {/* Card 2: Number of Sales */}
        <Card className="p-5 flex flex-col justify-between bg-card border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Number of Sales</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-500/10 px-1.5 py-0.2 rounded-md">
              +5.02
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-integral text-foreground">
              982
            </span>
          </div>
        </Card>

        {/* Card 3: Affiliate */}
        <Card className="p-5 flex flex-col justify-between bg-card border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Affiliate</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-500/10 px-1.5 py-0.2 rounded-md">
              +3.1%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-integral text-foreground">
              $4,530
            </span>
          </div>
        </Card>

        {/* Card 4: Discounts */}
        <Card className="p-5 flex flex-col justify-between bg-card border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Discounts</span>
            <span className="text-[10px] font-semibold text-rose-700 bg-rose-500/10 px-1.5 py-0.2 rounded-md">
              -3.58%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-integral text-foreground">
              $2,230
            </span>
          </div>
        </Card>
      </div>

      {/* 3️⃣ FILTER & ACTION TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 h-8 pl-3 pr-3 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setStatusMenuOpen(!statusMenuOpen);
                setCategoryMenuOpen(false);
                setPriceMenuOpen(false);
              }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Status {statusFilter !== "All" && `(${statusFilter})`}</span>
            </button>

            {statusMenuOpen && (
              <div className="absolute left-0 top-9 z-30 w-40 rounded-xl border border-border bg-popover p-1.5 shadow-xl text-left">
                {["All", "Active", "Out Of Stock", "Closed For Sale"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st);
                      setStatusMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                  >
                    <span>{st}</span>
                    {statusFilter === st && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setCategoryMenuOpen(!categoryMenuOpen);
                setStatusMenuOpen(false);
                setPriceMenuOpen(false);
              }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Category {categoryFilter !== "All" && `(${categoryFilter})`}</span>
            </button>

            {categoryMenuOpen && (
              <div className="absolute left-0 top-9 z-30 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-xl text-left max-h-56 overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(cat);
                      setCategoryMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                  >
                    <span>{cat}</span>
                    {categoryFilter === cat && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setPriceMenuOpen(!priceMenuOpen);
                setStatusMenuOpen(false);
                setCategoryMenuOpen(false);
              }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition cursor-pointer"
            >
              <span>Price: {priceFilter === "All" ? "$100-$200" : priceFilter}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {priceMenuOpen && (
              <div className="absolute left-0 top-9 z-30 w-40 rounded-xl border border-border bg-popover p-1.5 shadow-xl text-left">
                {["All", "$100-$200", "Under $100", "Over $200"].map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => {
                      setPriceFilter(pr);
                      setPriceMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                  >
                    <span>{pr}</span>
                    {priceFilter === pr && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Columns Button */}
        <div>
          <button
            type="button"
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition cursor-pointer"
          >
            <span>Columns</span>
            <Columns3 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* 4️⃣ PRODUCTS TABLE CARD */}
      <Card className="bg-card border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto min-h-[480px]">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredProducts.length &&
                      filteredProducts.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-3.5 w-3.5 rounded border-border text-primary cursor-pointer accent-primary"
                  />
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    <span>Product Name</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    <span>Price</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    <span>Category</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    <span>Stock</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((prod) => {
                const isSelected = selectedIds.includes(prod.id);
                return (
                  <tr
                    key={prod.id}
                    className={`hover:bg-muted/30 transition ${
                      isSelected ? "bg-muted/20" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(prod.id)}
                        className="h-3.5 w-3.5 rounded border-border text-primary cursor-pointer accent-primary"
                      />
                    </td>

                    {/* Product Image & Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-lg bg-muted p-1 shrink-0 overflow-hidden border border-border/40">
                          <Image
                            src={prod.image}
                            alt={prod.name}
                            fill
                            className="object-contain"
                            sizes="40px"
                          />
                        </div>
                        <span className="font-semibold text-foreground truncate max-w-[220px]">
                          {prod.name}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 font-semibold text-foreground">
                      {prod.price}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 text-muted-foreground font-medium">
                      {prod.category}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-3 font-mono text-foreground">
                      {prod.stock}
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-3 font-mono text-muted-foreground text-[11px]">
                      {prod.sku}
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-foreground">
                          {prod.rating}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-3 px-3">
                      {prod.status === "Active" && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-500/40 text-emerald-600 bg-emerald-50/50 ">
                          Active
                        </span>
                      )}
                      {prod.status === "Out Of Stock" && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-amber-500/40 text-amber-600 bg-amber-50/50 ">
                          Out Of Stock
                        </span>
                      )}
                      {prod.status === "Closed For Sale" && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-600 text-white shadow-2xs">
                          Closed For Sale
                        </span>
                      )}
                    </td>

                    {/* 3-Dots Action Menu */}
                    <td className="py-3 px-3 text-right relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActionMenuId(actionMenuId === prod.id ? null : prod.id)
                        }
                        className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition cursor-pointer"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>

                      {actionMenuId === prod.id && (
                        <div className="absolute right-3 top-8 z-30 w-36 rounded-xl border border-border bg-popover p-1.5 shadow-xl text-left animate-in fade-in-50 zoom-in-95">
                          <Link href={`/admin/products/${prod.id}`}>
                            <button
                              type="button"
                              onClick={() => setActionMenuId(null)}
                              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>View details</span>
                            </button>
                          </Link>
                          <Link href={`/admin/products/${prod.id}/edit`}>
                            <button
                              type="button"
                              onClick={() => setActionMenuId(null)}
                              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Edit</span>
                            </button>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setActionMenuId(null)}
                            className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5️⃣ TABLE FOOTER & PAGINATION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-t border-border gap-3 text-xs text-muted-foreground">
          <span>
            {selectedIds.length} of {filteredProducts.length} row(s) selected.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground disabled:opacity-50 transition cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

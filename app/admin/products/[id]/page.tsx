"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, TrendingUp, Box, DollarSign, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProductDetailPage() {
  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedColor, setSelectedColor] = useState("Pitch Black");

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold font-integral uppercase text-foreground">
                T-shirt with Tape Details
              </h1>
              <Badge variant="success">In Stock</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">SKU: PROD-1 • Category: T-Shirts</p>
          </div>
        </div>

        <Link href="/admin/products/create">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Details</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">Unit Price</span>
              <h3 className="text-2xl font-extrabold font-integral text-foreground mt-1">$120.00</h3>
            </div>
            <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-foreground">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">Total Sold</span>
              <h3 className="text-2xl font-extrabold font-integral text-foreground mt-1">482 units</h3>
            </div>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">Available Stock</span>
              <h3 className="text-2xl font-extrabold font-integral text-foreground mt-1">45 left</h3>
            </div>
            <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-foreground">
              <Box className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Description & Fabric Specs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs leading-relaxed text-muted-foreground">
              <p>
                This signature graphic t-shirt is designed for contemporary streetwear styling. Features contrasting dual tape accents across shoulders, high-density ribbed crew collar, and pre-shrunk heavyweight combed organic cotton.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                  <span className="font-bold text-foreground block mb-1">Material Blend</span>
                  <span>100% Organic Heavyweight Cotton (240 GSM)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
                  <span className="font-bold text-foreground block mb-1">Fit & Silhouette</span>
                  <span>Relaxed Boxy Drop-Shoulder</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Reviews (4.8 / 5.0)</CardTitle>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" />
                  <span className="text-xs font-bold text-foreground">4.8 (84 ratings)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <p className="font-bold text-foreground">Incredible fabric thickness and perfect cut.</p>
                <span className="text-[10px] text-muted-foreground">Alex M. • Verified Buyer</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variants & Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="font-semibold text-foreground block mb-2">Sizes</span>
                <div className="flex gap-2">
                  {["S", "M", "L", "XL", "XXL"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        selectedSize === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:opacity-80"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <span className="font-semibold text-foreground block mb-2">Color</span>
                <div className="flex gap-2">
                  {["Pitch Black", "Heather Gray", "Off White"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                        selectedColor === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

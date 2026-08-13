import Link from "next/link";
import { ArrowLeft, Edit3, TrendingUp, Tag, Box, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../_components/ui/card";
import { Button } from "../../_components/ui/button";
import { Badge } from "../../_components/ui/badge";

export default function ProductDetailPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold font-integral uppercase text-black">
                T-shirt with Tape Details
              </h1>
              <Badge variant="success">In Stock</Badge>
            </div>
            <p className="text-xs text-black/60 font-mono">SKU: PROD-1 • Category: T-Shirts</p>
          </div>
        </div>

        <Button size="sm" variant="outline" className="gap-1.5 text-xs w-full sm:w-auto">
          <Edit3 className="h-3.5 w-3.5" />
          <span>Edit Product</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-black/50">Unit Price</span>
              <h3 className="text-2xl font-extrabold font-integral text-black mt-1">$120.00</h3>
            </div>
            <div className="h-9 w-9 rounded-xl bg-[#F0EEED] flex items-center justify-center text-black">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-black/50">Total Sold</span>
              <h3 className="text-2xl font-extrabold font-integral text-black mt-1">482 units</h3>
            </div>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-black/50">Available Inventory</span>
              <h3 className="text-2xl font-extrabold font-integral text-black mt-1">45 in stock</h3>
            </div>
            <div className="h-9 w-9 rounded-xl bg-[#F0EEED] flex items-center justify-center text-black">
              <Box className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specifications & Description */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Product Overview & Fabric Specs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs leading-relaxed text-black/70">
            <p>
              This graphic t-shirt is perfect for any occasion. Crafted from 100% premium combed cotton, it features contrasting tape details along the shoulders and a structured ribbed neckline.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-black/5">
                <span className="font-semibold text-black block mb-0.5">Material Blend</span>
                <span>100% Organic Heavyweight Cotton</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-black/5">
                <span className="font-semibold text-black block mb-0.5">Fit & Cut</span>
                <span>Relaxed Boxy Fit</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-black block mb-1">Sizes Available</span>
              <div className="flex gap-1.5">
                {["S", "M", "L", "XL", "XXL"].map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-[#F0EEED] font-bold text-black text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

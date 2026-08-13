"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AddProductPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold font-integral uppercase text-foreground">
              Add New Product
            </h1>
            <p className="text-xs text-muted-foreground">Create a new garment item for the SHOP.CO store.</p>
          </div>
        </div>
      </div>

      {submitted ? (
        <Card className="p-8 text-center bg-card border-emerald-200">
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mb-3" />
            <h3 className="text-xl font-bold font-integral text-foreground">Product Published!</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-6">Your garment is now listed and available for customers.</p>
            <div className="flex gap-3">
              <Link href="/admin/products">
                <Button variant="outline" size="sm">Back to Products</Button>
              </Link>
              <Button size="sm" onClick={() => setSubmitted(false)}>Add Another Product</Button>
            </div>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                  <CardDescription>Product title, descriptions and categories.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Product Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Classic Oversized Heavyweight T-Shirt"
                      className="w-full h-10 rounded-xl border border-input px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Description</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe fabric blend, cut, wash instructions and style fit..."
                      className="w-full rounded-xl border border-input p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Category</label>
                      <select className="w-full h-10 rounded-xl border border-input px-3 text-xs text-foreground focus:outline-none cursor-pointer">
                        <option value="T-Shirts">T-Shirts</option>
                        <option value="Jeans">Jeans</option>
                        <option value="Shirts">Shirts</option>
                        <option value="Hoodies">Hoodies</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Dress Style</label>
                      <select className="w-full h-10 rounded-xl border border-input px-3 text-xs text-foreground focus:outline-none cursor-pointer">
                        <option value="Casual">Casual</option>
                        <option value="Formal">Formal</option>
                        <option value="Party">Party</option>
                        <option value="Gym">Gym</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Photography</CardTitle>
                  <CardDescription>Upload garment preview images.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-foreground transition cursor-pointer bg-muted/30">
                    <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs font-semibold text-foreground">Drag and drop images here, or browse files</p>
                    <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG or WEBP up to 5MB</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing ($ USD)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Base Price</label>
                    <input
                      type="number"
                      required
                      placeholder="120.00"
                      className="w-full h-10 rounded-xl border border-input px-3.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Compare-at Price</label>
                    <input
                      type="number"
                      placeholder="140.00"
                      className="w-full h-10 rounded-xl border border-input px-3.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory & Stock</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">SKU Code</label>
                    <input
                      type="text"
                      placeholder="PROD-901"
                      className="w-full h-10 rounded-xl border border-input px-3.5 text-xs text-foreground font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Quantity in Stock</label>
                    <input
                      type="number"
                      required
                      placeholder="50"
                      className="w-full h-10 rounded-xl border border-input px-3.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full text-xs shadow-md">
                Publish Product
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

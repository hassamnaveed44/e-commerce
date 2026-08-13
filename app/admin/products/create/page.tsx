"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, CheckCircle2, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AddProductPage() {
  const [submitted, setSubmitted] = useState(false);
  const [variants, setVariants] = useState([
    { id: 1, option: "Size", value: "", price: "" },
    { id: 2, option: "Color", value: "", price: "" },
  ]);

  const handleAddVariant = () => {
    setVariants([...variants, { id: variants.length + 1, option: "Size", value: "", price: "" }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold font-integral text-foreground">
              Add Products
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0">
          <Button variant="outline" size="sm" className="rounded-xl bg-muted/50 text-foreground font-medium">Discard</Button>
          <Button variant="outline" size="sm" className="rounded-xl font-medium">Save Draft</Button>
          <Button size="sm" className="rounded-xl bg-black text-white hover:bg-black/90 font-medium">Publish</Button>
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
                <Button variant="outline" size="sm" className="rounded-xl">Back to Products</Button>
              </Link>
              <Button size="sm" className="rounded-xl" onClick={() => setSubmitted(false)}>Add Another Product</Button>
            </div>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (Product Details, Images, Variants) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Product Details Card */}
              <Card className="rounded-2xl border border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Name</label>
                    <input
                      type="text"
                      required
                      className="w-full h-10 rounded-xl border border-input px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">SKU</label>
                      <input
                        type="text"
                        className="w-full h-10 rounded-xl border border-input px-3.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Barcode</label>
                      <input
                        type="text"
                        className="w-full h-10 rounded-xl border border-input px-3.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Description (Optional)</label>
                    <textarea
                      rows={4}
                      className="w-full rounded-xl border border-input p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1.5">Set a description to the product for better visibility.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Product Images Card */}
              <Card className="rounded-2xl border border-border shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold">Product Images</CardTitle>
                  <button type="button" className="text-xs font-semibold text-primary hover:underline">
                    Add media from URL
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-foreground transition cursor-pointer bg-muted/25 flex flex-col items-center justify-center space-y-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Drop your images here</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">PNG or JPG (max. 5MB)</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl text-xs h-9">
                      Select images
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Variants Card */}
              <Card className="rounded-2xl border border-border shadow-xs overflow-hidden p-0">
                <div className="p-6 pb-4">
                  <h3 className="text-lg font-bold">Variants</h3>
                </div>
                
                <div className="px-6 space-y-3">
                  <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-muted-foreground">
                    <div className="col-span-3">Options</div>
                    <div className="col-span-5">Value</div>
                    <div className="col-span-4">Price</div>
                  </div>

                  {variants.map((v, idx) => (
                    <div key={v.id} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-3">
                        <select 
                          defaultValue={idx === 0 ? "Size" : "Color"}
                          className="w-full h-10 rounded-xl border border-input px-3 text-xs text-foreground font-medium focus:outline-none cursor-pointer bg-background"
                        >
                          <option value="Size">Size</option>
                          <option value="Color">Color</option>
                          <option value="Weight">Weight</option>
                          <option value="Smell">Smell</option>
                        </select>
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          className="w-full h-10 rounded-xl border border-input px-3.5 text-xs text-foreground focus:outline-none"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          className="w-full h-10 rounded-xl border border-input px-3.5 text-xs text-foreground focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-border">
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition py-3.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Variant</span>
                  </button>
                </div>
              </Card>

            </div>

            {/* Right Column (Pricing, Status, Categories) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Pricing Card */}
              <Card className="rounded-2xl border border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Base Price</label>
                    <input
                      type="number"
                      className="w-full h-10 rounded-xl border border-input px-3.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Discounted Price</label>
                    <input
                      type="number"
                      className="w-full h-10 rounded-xl border border-input px-3.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" id="tax" className="rounded border-input h-4 w-4 text-primary" />
                    <label htmlFor="tax" className="text-xs text-foreground font-medium cursor-pointer">
                      Charge tax on this product
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs font-semibold text-foreground">In stock</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-foreground"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card className="rounded-2xl border border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <select className="w-full h-10 rounded-xl border border-input px-3 text-xs text-foreground focus:outline-none cursor-pointer bg-background">
                    <option value="Draft">🟠 Draft</option>
                    <option value="Active">🟢 Active</option>
                    <option value="Archived">🔴 Archived</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground">Set the product status.</p>
                </CardContent>
              </Card>

              {/* Categories Card */}
              <Card className="rounded-2xl border border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <select className="w-full h-10 rounded-xl border border-input px-3 text-xs text-muted-foreground focus:outline-none cursor-pointer bg-background">
                      <option value="">Select a category</option>
                      <option value="T-Shirts">T-Shirts</option>
                      <option value="Jeans">Jeans</option>
                      <option value="Shirts">Shirts</option>
                      <option value="Hoodies">Hoodies</option>
                    </select>
                    <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <select className="w-full h-10 rounded-xl border border-input px-3 text-xs text-muted-foreground focus:outline-none cursor-pointer bg-background">
                      <option value="">Select a sub category</option>
                      <option value="Casual">Casual</option>
                      <option value="Formal">Formal</option>
                    </select>
                    <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>

          </div>
        </form>
      )}
    </div>
  );
}
import Link from "next/link";
import { ArrowLeft, Printer, CheckCircle2, Package, Truck, CreditCard } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../_components/ui/card";
import { Button } from "../../_components/ui/button";
import { Badge } from "../../_components/ui/badge";

export default function OrderDetailPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold font-integral uppercase text-black">
                Order #ORD-9481
              </h1>
              <Badge variant="success">Completed</Badge>
            </div>
            <p className="text-xs text-black/60">Placed on Oct 24, 2026 at 14:32 PM</p>
          </div>
        </div>

        <Button size="sm" variant="outline" className="gap-1.5 text-xs w-full sm:w-auto">
          <Printer className="h-3.5 w-3.5" />
          <span>Print Receipt</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Items List */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items (2 items)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] border border-black/5">
                <div>
                  <h4 className="font-bold text-xs text-black">T-shirt with Tape Details</h4>
                  <p className="text-[11px] text-black/50">Size: Large • Color: Black</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs font-integral text-black">$120.00</p>
                  <p className="text-[10px] text-black/50">Qty: 1</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] border border-black/5">
                <div>
                  <h4 className="font-bold text-xs text-black">Skinny Fit Jeans</h4>
                  <p className="text-[11px] text-black/50">Size: 32 • Color: Blue</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs font-integral text-black">$79.99</p>
                  <p className="text-[10px] text-black/50">Qty: 1</p>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-3 border-t border-black/10 space-y-1.5 text-xs">
                <div className="flex justify-between text-black/60">
                  <span>Subtotal</span>
                  <span>$199.99</span>
                </div>
                <div className="flex justify-between text-black/60">
                  <span>Shipping (Standard)</span>
                  <span className="text-emerald-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-black/10">
                  <span>Total Paid</span>
                  <span className="font-integral">$199.99 USD</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-black">Olivia Martin</p>
                <p className="text-black/60">olivia.martin@email.com</p>
                <p className="text-black/60">+1 (555) 234-5678</p>
              </div>

              <div className="pt-3 border-t border-black/10">
                <span className="font-semibold text-black block mb-1">Shipping Address</span>
                <p className="text-black/70">742 Evergreen Terrace, Springfield, OR 97477, USA</p>
              </div>

              <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                <span>Payment</span>
                <span className="font-semibold text-black">Visa •••• 4242</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

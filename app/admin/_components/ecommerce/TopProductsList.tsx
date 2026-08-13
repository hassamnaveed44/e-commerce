import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { topProducts } from "../../_data/ecommerceData";
import { AlertCircle } from "lucide-react";

export default function TopProductsList() {
  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Top Selling Products</CardTitle>
          <Badge variant="secondary">{topProducts.length} items</Badge>
        </div>
        <CardDescription>High-performing catalog garments this month.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {topProducts.map((prod) => {
          const isLowStock = prod.stock < 10;

          return (
            <div
              key={prod.id}
              className="flex items-center justify-between p-3 rounded-2xl border border-black/5 hover:border-black/15 bg-white transition"
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-black">{prod.name}</h4>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                    {prod.category}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-black/50">
                  <span>{prod.salesCount} sales</span>
                  <span>•</span>
                  <span>Unit: ${prod.price}</span>
                </div>

                {/* Stock Level Indicator */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[#F0EEED] overflow-hidden">
                    <div
                      style={{ width: `${Math.min((prod.stock / 50) * 100, 100)}%` }}
                      className={`h-full rounded-full ${
                        isLowStock ? "bg-amber-500" : "bg-black"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold ${isLowStock ? "text-amber-600 flex items-center gap-0.5" : "text-black/50"}`}>
                    {isLowStock && <AlertCircle className="h-3 w-3" />}
                    {prod.stock} left
                  </span>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="text-right pl-2 border-l border-black/10">
                <p className="text-xs font-extrabold font-integral text-black">
                  ${prod.revenue.toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium">Gross</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

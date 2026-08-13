import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { paymentMethodsShare } from "../../_data/paymentData";

export default function PaymentMethodsCard() {
  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader className="pb-4">
        <CardTitle>Payment Methods Breakdown</CardTitle>
        <CardDescription>Volume distribution across enabled gateways.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {paymentMethodsShare.map((item) => (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-black">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-black/60">{item.volume}</span>
                <span className="font-bold text-black font-integral">{item.percentage}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full rounded-full bg-[#F0EEED] overflow-hidden">
              <div
                style={{ width: item.percentage }}
                className={`h-full rounded-full ${
                  item.name === "Visa"
                    ? "bg-blue-600"
                    : item.name === "Mastercard"
                    ? "bg-amber-500"
                    : item.name === "Apple Pay"
                    ? "bg-black"
                    : "bg-indigo-600"
                }`}
              />
            </div>
          </div>
        ))}

        <div className="rounded-xl bg-[#F0EEED] p-3 mt-4 text-[11px] text-black/70 flex items-center justify-between">
          <span>Processing Currency</span>
          <span className="font-bold text-black font-integral">USD ($)</span>
        </div>
      </CardContent>
    </Card>
  );
}

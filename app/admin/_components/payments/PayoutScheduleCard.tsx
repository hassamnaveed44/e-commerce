import { Building2, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { payoutSchedule } from "../../_data/paymentData";

export default function PayoutScheduleCard() {
  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-2">
        <div>
          <CardTitle>Payout Schedule & Bank Account</CardTitle>
          <CardDescription>Automated rolling deposits linked to your merchant account.</CardDescription>
        </div>
        <Button size="sm" variant="outline" className="text-xs">
          Manage Accounts
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Connected Bank Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-black text-white gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm">Chase Business Checking</h4>
                <Badge variant="secondary" className="bg-white/20 text-white text-[10px] py-0">
                  Primary
                </Badge>
              </div>
              <p className="text-xs text-white/60">Account ending in •••• 8921</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[11px] text-white/60 uppercase tracking-wider">Next Auto Deposit</p>
            <p className="text-xl font-extrabold font-integral text-emerald-400">$18,320.50</p>
          </div>
        </div>

        {/* Payout Transfer History */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50 px-1">
            Recent Transfers
          </p>

          {payoutSchedule.map((payout) => (
            <div
              key={payout.id}
              className="flex items-center justify-between p-3 rounded-xl border border-black/5 bg-[#F9FAFB] hover:bg-white transition"
            >
              <div className="flex items-center gap-3">
                {payout.status === "Completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500" />
                )}
                <div>
                  <p className="text-xs font-bold text-black">{payout.bank}</p>
                  <p className="text-[11px] text-black/50">{payout.date}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold font-integral text-black">
                  ${payout.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <Badge
                  variant={payout.status === "Completed" ? "success" : "warning"}
                  className="ml-2 text-[10px] py-0"
                >
                  {payout.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

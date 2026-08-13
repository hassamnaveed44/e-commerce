import { CreditCard, Wallet, Clock, ShieldAlert, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { paymentMetrics } from "../../_data/paymentData";

export default function PaymentKpis() {
  const { totalVolume, availableBalance, pendingPayouts, refundRate } = paymentMetrics;

  const kpis = [
    {
      title: "Total Processed Volume",
      value: `$${totalVolume.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      subtitle: totalVolume.change,
      positive: totalVolume.positive,
      icon: CreditCard,
      iconBg: "bg-black text-white",
    },
    {
      title: "Available Balance",
      value: `$${availableBalance.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      subtitle: availableBalance.nextPayout,
      positive: true,
      icon: Wallet,
      iconBg: "bg-emerald-50 text-emerald-700",
      highlight: true,
    },
    {
      title: "Pending Charges",
      value: `$${pendingPayouts.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      subtitle: `${pendingPayouts.count} transactions in clearing`,
      positive: null,
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-700",
    },
    {
      title: "Dispute & Refund Rate",
      value: `${refundRate.value}%`,
      subtitle: refundRate.change,
      positive: refundRate.positive,
      icon: ShieldAlert,
      iconBg: "bg-[#F0EEED] text-black",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.title}
            className={`hover:shadow-md transition-shadow ${
              kpi.highlight ? "border-emerald-200 bg-emerald-50/20" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-black/60">
                  {kpi.title}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpi.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-2xl lg:text-3xl font-extrabold font-integral tracking-tight text-black">
                  {kpi.value}
                </h3>

                <div className="mt-2 flex items-center gap-1 text-xs">
                  {kpi.positive === true && (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 font-semibold" />
                  )}
                  {kpi.positive === false && (
                    <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 font-semibold" />
                  )}
                  <span
                    className={
                      kpi.positive === true
                        ? "text-emerald-600 font-medium"
                        : kpi.positive === false
                        ? "text-rose-600 font-medium"
                        : "text-black/50"
                    }
                  >
                    {kpi.subtitle}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

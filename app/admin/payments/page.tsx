import { CreditCard, Download, ArrowUpRight } from "lucide-react";
import { Button } from "../_components/ui/button";
import PaymentKpis from "../_components/payments/PaymentKpis";
import PayoutScheduleCard from "../_components/payments/PayoutScheduleCard";
import PaymentMethodsCard from "../_components/payments/PaymentMethodsCard";
import TransactionsTable from "../_components/payments/TransactionsTable";

export default function PaymentDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-integral uppercase text-black tracking-tight">
            Payment Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-black/60 mt-1">
            Real-time merchant balance, payout schedules, gateway health, and transaction logs.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs shadow-xs">
            <Download className="h-3.5 w-3.5" />
            <span>Monthly Statement</span>
          </Button>

          <Button size="sm" className="flex items-center gap-1.5 text-xs shadow-sm">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Instant Transfer</span>
          </Button>
        </div>
      </div>

      {/* Financial KPIs */}
      <PaymentKpis />

      {/* Payout Schedule & Payment Gateways Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <PayoutScheduleCard />
        <PaymentMethodsCard />
      </div>

      {/* Transaction Ledger & Management */}
      <TransactionsTable />
    </div>
  );
}

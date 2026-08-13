export interface PaymentBalance {
  currency: string;
  flag: string;
  amount: string;
  symbol: string;
}

export const paymentBalances: PaymentBalance[] = [
  { currency: "USD", flag: "🇺🇸", amount: "1,240.30", symbol: "$" },
  { currency: "EUR", flag: "🇪🇺", amount: "500.00", symbol: "€" },
  { currency: "GBP", flag: "🇬🇧", amount: "0.00", symbol: "£" },
];

export const paymentTransactions = [
  { id: "TXN-01", date: "16 Aug 2026", title: "Withdrawal to JP Morgan Chase (0440)", status: "Completed", amount: "-1,275.79 USD", type: "withdrawal", positive: false },
  { id: "TXN-02", date: "15 Aug 2026", title: "Withdrawal to Citibank (2290)", status: "Completed", amount: "-202.99 USD", type: "withdrawal", positive: false },
  { id: "TXN-03", date: "15 Aug 2026", title: "Withdrawal to Bank of America (3311)", status: "Completed", amount: "-1,272.30 USD", type: "withdrawal", positive: false },
  { id: "TXN-04", date: "14 Aug 2026", title: "Payment from Stripe Merchant", status: "Completed", amount: "+5,651.56 USD", type: "deposit", positive: true },
  { id: "TXN-05", date: "14 Aug 2026", title: "Withdrawal to HSBC (5522)", status: "Completed", amount: "-1,679.35 USD", type: "withdrawal", positive: false },
  { id: "TXN-06", date: "12 Aug 2026", title: "Withdrawal to JP Morgan Chase (1133)", status: "Completed", amount: "-3,420.00 USD", type: "withdrawal", positive: false },
];

export const exchangeRates = [
  { pair: "EUR / USD", rate: "1.0842", change: "+0.24%", positive: true },
  { pair: "GBP / USD", rate: "1.2715", change: "-0.12%", positive: false },
  { pair: "USD / JPY", rate: "154.60", change: "+0.51%", positive: true },
  { pair: "USD / CAD", rate: "1.3780", change: "+0.08%", positive: true },
];

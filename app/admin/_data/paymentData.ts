export interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  fee: number;
  net: number;
  currency: string;
  paymentMethod: "Visa" | "Mastercard" | "PayPal" | "Apple Pay";
  cardLast4?: string;
  status: "Succeeded" | "Pending" | "Refunded" | "Failed";
  date: string;
  time: string;
  channel: string;
}

export interface PaymentMetrics {
  totalVolume: { value: number; change: string; positive: boolean };
  availableBalance: { value: number; nextPayout: string };
  pendingPayouts: { value: number; count: number };
  refundRate: { value: number; change: string; positive: boolean };
}

export const paymentMetrics: PaymentMetrics = {
  totalVolume: { value: 128430.00, change: "+12.5% vs last month", positive: true },
  availableBalance: { value: 18320.50, nextPayout: "Next deposit on Oct 26" },
  pendingPayouts: { value: 3450.00, count: 14 },
  refundRate: { value: 0.42, change: "-0.08% low risk", positive: true },
};

export const transactionsData: Transaction[] = [
  {
    id: "TXN-884920",
    orderId: "ORD-9481",
    customerName: "Olivia Martin",
    customerEmail: "olivia.martin@email.com",
    amount: 199.99,
    fee: 5.80,
    net: 194.19,
    currency: "USD",
    paymentMethod: "Visa",
    cardLast4: "4242",
    status: "Succeeded",
    date: "Oct 24, 2026",
    time: "14:32:10",
    channel: "Online Store",
  },
  {
    id: "TXN-884919",
    orderId: "ORD-9480",
    customerName: "Jackson Lee",
    customerEmail: "jackson.lee@email.com",
    amount: 89.00,
    fee: 2.58,
    net: 86.42,
    currency: "USD",
    paymentMethod: "Mastercard",
    cardLast4: "5555",
    status: "Pending",
    date: "Oct 24, 2026",
    time: "12:15:44",
    channel: "Mobile Checkout",
  },
  {
    id: "TXN-884918",
    orderId: "ORD-9479",
    customerName: "Isabella Nguyen",
    customerEmail: "isabella.nguyen@email.com",
    amount: 289.50,
    fee: 8.40,
    net: 281.10,
    currency: "USD",
    paymentMethod: "PayPal",
    status: "Succeeded",
    date: "Oct 23, 2026",
    time: "18:45:20",
    channel: "Online Store",
  },
  {
    id: "TXN-884917",
    orderId: "ORD-9478",
    customerName: "William Kim",
    customerEmail: "will@email.com",
    amount: 45.00,
    fee: 1.30,
    net: 43.70,
    currency: "USD",
    paymentMethod: "Apple Pay",
    status: "Succeeded",
    date: "Oct 23, 2026",
    time: "11:20:05",
    channel: "Apple Pay Web",
  },
  {
    id: "TXN-884916",
    orderId: "ORD-9477",
    customerName: "Sofia Davis",
    customerEmail: "sofia.davis@email.com",
    amount: 120.00,
    fee: 0.00,
    net: -120.00,
    currency: "USD",
    paymentMethod: "Visa",
    cardLast4: "1234",
    status: "Refunded",
    date: "Oct 22, 2026",
    time: "09:12:30",
    channel: "Online Store",
  },
  {
    id: "TXN-884915",
    orderId: "ORD-9475",
    customerName: "Ethan Brown",
    customerEmail: "ethan.b@email.com",
    amount: 340.00,
    fee: 0.00,
    net: 0.00,
    currency: "USD",
    paymentMethod: "Visa",
    cardLast4: "9901",
    status: "Failed",
    date: "Oct 22, 2026",
    time: "08:04:12",
    channel: "Online Store",
  },
  {
    id: "TXN-884914",
    orderId: "ORD-9474",
    customerName: "Liam Johnson",
    customerEmail: "liam.j@email.com",
    amount: 310.00,
    fee: 8.99,
    net: 301.01,
    currency: "USD",
    paymentMethod: "Mastercard",
    cardLast4: "8888",
    status: "Succeeded",
    date: "Oct 21, 2026",
    time: "16:50:00",
    channel: "Online Store",
  },
];

export const payoutSchedule = [
  { id: "PAY-101", date: "Oct 26, 2026", bank: "Chase Bank (•••• 8921)", amount: 18320.50, status: "Scheduled" },
  { id: "PAY-100", date: "Oct 19, 2026", bank: "Chase Bank (•••• 8921)", amount: 24190.00, status: "Completed" },
  { id: "PAY-099", date: "Oct 12, 2026", bank: "Chase Bank (•••• 8921)", amount: 19450.25, status: "Completed" },
];

export const paymentMethodsShare = [
  { name: "Visa", share: 48, volume: "$61,646.40", percentage: "48%" },
  { name: "Mastercard", share: 28, volume: "$35,960.40", percentage: "28%" },
  { name: "Apple Pay", share: 14, volume: "$17,980.20", percentage: "14%" },
  { name: "PayPal", share: 10, volume: "$12,843.00", percentage: "10%" },
];

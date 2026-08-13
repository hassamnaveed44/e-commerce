export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  date: string;
  status: "Completed" | "Processing" | "Pending" | "Cancelled";
  total: number;
  itemsCount: number;
  paymentMethod: string;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  salesCount: number;
  revenue: number;
  stock: number;
}

export const ecommerceMetrics = {
  totalRevenue: { value: 45231.89, change: "+20.1%", positive: true },
  totalOrders: { value: 2350, change: "+180.1%", positive: true },
  averageOrderValue: { value: 89.45, change: "+19.0%", positive: true },
  activeCustomers: { value: 573, change: "+201", positive: true },
};

export const revenueData = [
  { month: "Jan", revenue: 28400, sales: 420, height: "45%" },
  { month: "Feb", revenue: 32100, sales: 510, height: "52%" },
  { month: "Mar", revenue: 29800, sales: 480, height: "48%" },
  { month: "Apr", revenue: 38900, sales: 630, height: "64%" },
  { month: "May", revenue: 41200, sales: 690, height: "70%" },
  { month: "Jun", revenue: 36700, sales: 580, height: "60%" },
  { month: "Jul", revenue: 45231, sales: 740, height: "80%" },
  { month: "Aug", revenue: 48900, sales: 810, height: "86%" },
  { month: "Sep", revenue: 44100, sales: 710, height: "76%" },
  { month: "Oct", revenue: 51200, sales: 860, height: "90%" },
  { month: "Nov", revenue: 58400, sales: 940, height: "95%" },
  { month: "Dec", revenue: 64100, sales: 1050, height: "100%" },
];

export const topProducts: TopProduct[] = [
  { id: "PROD-1", name: "T-shirt with Tape Details", category: "T-Shirts", price: 120, salesCount: 482, revenue: 57840, stock: 45 },
  { id: "PROD-2", name: "Skinny Fit Jeans", category: "Jeans", price: 240, salesCount: 391, revenue: 93840, stock: 12 },
  { id: "PROD-3", name: "Checkered Shirt", category: "Shirts", price: 180, salesCount: 320, revenue: 57600, stock: 28 },
  { id: "PROD-4", name: "Sleeve Striped T-shirt", category: "T-Shirts", price: 130, salesCount: 295, revenue: 38350, stock: 8 },
  { id: "PROD-5", name: "Vertical Striped Shirt", category: "Shirts", price: 212, salesCount: 240, revenue: 50880, stock: 35 },
];

export const recentOrders: Order[] = [
  { id: "ORD-9481", customerName: "Olivia Martin", customerEmail: "olivia.martin@email.com", customerAvatar: "OM", date: "16 Aug 2026", status: "Completed", total: 199.99, itemsCount: 2, paymentMethod: "Visa •••• 4242" },
  { id: "ORD-9480", customerName: "Jackson Lee", customerEmail: "jackson.lee@email.com", customerAvatar: "JL", date: "16 Aug 2026", status: "Processing", total: 89.00, itemsCount: 1, paymentMethod: "Mastercard •••• 5555" },
  { id: "ORD-9479", customerName: "Isabella Nguyen", customerEmail: "isabella.nguyen@email.com", customerAvatar: "IN", date: "15 Aug 2026", status: "Completed", total: 289.50, itemsCount: 3, paymentMethod: "PayPal" },
  { id: "ORD-9478", customerName: "William Kim", customerEmail: "will@email.com", customerAvatar: "WK", date: "14 Aug 2026", status: "Pending", total: 45.00, itemsCount: 1, paymentMethod: "Apple Pay" },
  { id: "ORD-9477", customerName: "Sofia Davis", customerEmail: "sofia.davis@email.com", customerAvatar: "SD", date: "12 Aug 2026", status: "Cancelled", total: 120.00, itemsCount: 2, paymentMethod: "Visa •••• 1234" },
];

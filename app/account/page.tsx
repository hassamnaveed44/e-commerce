"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, User, MapPin, LogOut, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import OrderReceiptModal, { ReceiptOrder } from "@/app/components/order/OrderReceiptModal";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  paymentMethod: string;
  shippingAddress: string;
  items: OrderItem[];
}

export default function AccountPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();

  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "addresses">("orders");
  const [selectedInvoice, setSelectedInvoice] = useState<ReceiptOrder | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/account/orders");
        if (!res.ok) {
          setIsLoadingOrders(false);
          return;
        }
        const json = await res.json();
        if (json.success && Array.isArray(json.orders)) {
          setOrders(json.orders);
        }
      } catch (err) {
        console.error("Failed to load user orders:", err);
      } finally {
        setIsLoadingOrders(false);
      }
    }

    loadOrders();
  }, []);

  const handleSignOut = () => {
    signOut(() => {
      router.push("/");
    });
  };

  return (
    <div className="min-h-screen bg-white font-satoshi py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-sans text-black mb-8">
          My Account
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-medium transition cursor-pointer ${
                activeTab === "orders" ? "bg-black text-white" : "text-black/70 hover:bg-[#F0F0F0]"
              }`}
            >
              <Package size={18} />
              <span>My Orders ({orders.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-medium transition cursor-pointer ${
                activeTab === "profile" ? "bg-black text-white" : "text-black/70 hover:bg-[#F0F0F0]"
              }`}
            >
              <User size={18} />
              <span>Profile Information</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-medium transition cursor-pointer ${
                activeTab === "addresses" ? "bg-black text-white" : "text-black/70 hover:bg-[#F0F0F0]"
              }`}
            >
              <MapPin size={18} />
              <span>Saved Addresses</span>
            </button>

            <hr className="border-black/10 my-4" />

            {/* Working Clerk Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-medium text-[#FF3333] hover:bg-rose-50 transition cursor-pointer"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-9">
            {/* TAB 1: ORDERS */}
            {activeTab === "orders" && (
              <div className="border border-black/10 rounded-[20px] p-6 bg-white space-y-6">
                <h2 className="text-xl font-bold text-black">Order History</h2>

                {isLoadingOrders ? (
                  <div className="py-12 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-black" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-black/60">
                    <p>You haven&apos;t placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-black/10 rounded-[16px] p-5 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-3">
                          <div>
                            <span className="font-bold text-black">{order.id}</span>
                            <span className="text-xs text-black/40 block sm:inline sm:ml-3">
                              Placed on {order.date}
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                              order.status.toLowerCase() === "delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.status.toLowerCase()}
                          </span>
                        </div>

                        <div className="text-sm text-black/70">
                          {order.items.map((i: any) => `${i.name} (x${i.qty})`).join(", ")}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="font-bold text-black text-base">
                            ${order.total.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(order)}
                            className="text-xs font-semibold text-black underline hover:opacity-70 cursor-pointer flex items-center gap-1.5"
                          >
                            <FileText size={14} />
                            <span>View Invoice</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PROFILE */}
            {activeTab === "profile" && (
              <div className="border border-black/10 rounded-[20px] p-6 bg-white space-y-5">
                <h2 className="text-xl font-bold text-black">Profile Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-medium text-black/70 mb-1.5">Full Name</label>
                    <input
                      readOnly
                      value={isLoaded ? user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Customer" : "Loading..."}
                      className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/70 mb-1.5">Email</label>
                    <input
                      readOnly
                      value={isLoaded ? user?.primaryEmailAddress?.emailAddress || "user@example.com" : "Loading..."}
                      className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="border border-black/10 rounded-[20px] p-6 bg-white space-y-4">
                <h2 className="text-xl font-bold text-black">Saved Addresses</h2>
                {orders.length > 0 && orders[0]?.shippingAddress ? (
                  <div className="border border-black/10 rounded-[16px] p-4 flex justify-between items-center max-w-md">
                    <div>
                      <span className="font-bold text-sm text-black block">Recent Delivery Address</span>
                      <p className="text-xs text-black/60 mt-1">{orders[0].shippingAddress}</p>
                    </div>
                    <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                  </div>
                ) : (
                  <p className="text-sm text-black/60">No saved addresses yet. Addresses are saved automatically upon checkout.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Order Receipt Slip Modal */}
      <OrderReceiptModal
        order={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}

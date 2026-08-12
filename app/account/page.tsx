"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, User, MapPin, Clock, LogOut, CheckCircle2 } from "lucide-react";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "addresses">("orders");

  const orders = [
    {
      id: "ORD-98214",
      date: "August 12, 2026",
      total: "$287.00",
      status: "Processing",
      items: ["Gradient Graphic T-shirt (L)", "Checkered Shirt (M)"],
    },
    {
      id: "ORD-87123",
      date: "July 24, 2026",
      total: "$120.00",
      status: "Delivered",
      items: ["Skinny Fit Jeans (32)"],
    },
  ];

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
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-medium transition cursor-pointer ${
                activeTab === "orders" ? "bg-black text-white" : "text-black/70 hover:bg-[#F0F0F0]"
              }`}
            >
              <Package size={18} />
              <span>My Orders</span>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-medium transition cursor-pointer ${
                activeTab === "profile" ? "bg-black text-white" : "text-black/70 hover:bg-[#F0F0F0]"
              }`}
            >
              <User size={18} />
              <span>Profile Information</span>
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-medium transition cursor-pointer ${
                activeTab === "addresses" ? "bg-black text-white" : "text-black/70 hover:bg-[#F0F0F0]"
              }`}
            >
              <MapPin size={18} />
              <span>Saved Addresses</span>
            </button>

            <hr className="border-black/10 my-4" />

            <Link
              href="/login"
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-medium text-[#FF3333] hover:bg-rose-50 transition"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </Link>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-9">
            {activeTab === "orders" && (
              <div className="border border-black/10 rounded-[20px] p-6 bg-white space-y-6">
                <h2 className="text-xl font-bold text-black">Order History</h2>
                
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-black/10 rounded-[16px] p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-3">
                        <div>
                          <span className="font-bold text-black">{order.id}</span>
                          <span className="text-xs text-black/40 block sm:inline sm:ml-3">Placed on {order.date}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === "Delivered" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="text-sm text-black/70">
                        {order.items.join(", ")}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-black text-base">{order.total}</span>
                        <button className="text-xs font-medium text-black underline hover:opacity-70 cursor-pointer">
                          View Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="border border-black/10 rounded-[20px] p-6 bg-white space-y-5">
                <h2 className="text-xl font-bold text-black">Profile Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-medium text-black/70 mb-1.5">Full Name</label>
                    <input defaultValue="Alex Morgan" className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/70 mb-1.5">Email</label>
                    <input defaultValue="alex@example.com" className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black outline-none" />
                  </div>
                </div>
                <button className="bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-black/80 transition cursor-pointer">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="border border-black/10 rounded-[20px] p-6 bg-white space-y-4">
                <h2 className="text-xl font-bold text-black">Saved Addresses</h2>
                <div className="border border-black/10 rounded-[16px] p-4 flex justify-between items-center max-w-md">
                  <div>
                    <span className="font-bold text-sm text-black block">Home (Default)</span>
                    <p className="text-xs text-black/60 mt-1">123 Fashion Ave, Suite 400, New York, NY 10001</p>
                  </div>
                  <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

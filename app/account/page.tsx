"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, User, MapPin, LogOut, CheckCircle2, X, Printer, FileText } from "lucide-react";

interface OrderItem {
  name: string;
  size: string;
  color: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: "Processing" | "Delivered";
  paymentMethod: string;
  shippingAddress: string;
  items: OrderItem[];
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "addresses">("orders");
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  const orders: Order[] = [
    {
      id: "ORD-98214",
      date: "August 12, 2026",
      subtotal: 325,
      discount: 53,
      deliveryFee: 15,
      total: 287,
      status: "Processing",
      paymentMethod: "Credit Card (Stripe)",
      shippingAddress: "123 Fashion Ave, Suite 400, New York, NY 10001",
      items: [
        { name: "Gradient Graphic T-shirt", size: "Large", color: "White", qty: 1, price: 145 },
        { name: "Checkered Shirt", size: "Medium", color: "Red", qty: 1, price: 180 },
      ],
    },
    {
      id: "ORD-87123",
      date: "July 24, 2026",
      subtotal: 120,
      discount: 0,
      deliveryFee: 0,
      total: 120,
      status: "Delivered",
      paymentMethod: "Apple Pay",
      shippingAddress: "123 Fashion Ave, Suite 400, New York, NY 10001",
      items: [
        { name: "Skinny Fit Jeans", size: "32", color: "Blue", qty: 1, price: 120 },
      ],
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
                        {order.items.map((i) => `${i.name} (${i.size})`).join(", ")}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-black text-base">${order.total}.00</span>
                        <button
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

      {/* Invoice / Bill Slip Modal Popup */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 border border-black/10 shadow-2xl relative font-satoshi max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-black/10 pb-4 mb-5">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tighter uppercase font-sans text-black">
                  SHOP.CO
                </h3>
                <span className="text-xs text-black/40 uppercase tracking-wider">Official Invoice Receipt</span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-black/40 hover:text-black cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-[#F0F0F0]/50 p-4 rounded-[16px]">
              <div>
                <span className="text-black/50 block">Invoice Number:</span>
                <span className="font-bold text-black text-sm">{selectedInvoice.id}</span>
              </div>
              <div>
                <span className="text-black/50 block">Date Issued:</span>
                <span className="font-bold text-black text-sm">{selectedInvoice.date}</span>
              </div>
              <div>
                <span className="text-black/50 block">Payment Method:</span>
                <span className="font-medium text-black">{selectedInvoice.paymentMethod}</span>
              </div>
              <div>
                <span className="text-black/50 block">Status:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {selectedInvoice.status}
                </span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="text-xs text-black/70 mb-6">
              <span className="text-black/40 uppercase block mb-1 font-semibold">Billed & Shipped To:</span>
              <p className="font-medium text-black text-sm">Alex Morgan</p>
              <p>{selectedInvoice.shippingAddress}</p>
            </div>

            {/* Items Table */}
            <div className="space-y-3 border-t border-b border-black/10 py-4 mb-5">
              <span className="text-xs text-black/40 uppercase font-semibold block">Itemized Details</span>
              {selectedInvoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-black">{item.name}</p>
                    <p className="text-xs text-black/50">Size: {item.size} • Color: {item.color} • Qty: {item.qty}</p>
                  </div>
                  <span className="font-bold text-black">${item.price * item.qty}.00</span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="space-y-2 text-xs text-black/70 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-black">${selectedInvoice.subtotal}.00</span>
              </div>
              {selectedInvoice.discount > 0 && (
                <div className="flex justify-between text-[#FF3333]">
                  <span>Discount</span>
                  <span>-${selectedInvoice.discount}.00</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-medium text-black">${selectedInvoice.deliveryFee}.00</span>
              </div>
              <div className="flex justify-between text-base font-bold text-black pt-2 border-t border-black/10">
                <span>Total Paid</span>
                <span>${selectedInvoice.total}.00</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-black text-white rounded-full py-3 text-sm font-medium hover:bg-black/80 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={16} />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-6 bg-[#F0F0F0] text-black rounded-full py-3 text-sm font-medium hover:bg-black/10 transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

import Breadcrumb from "@/app/components/cart/Breadcrumb";
import CartItemsList from "@/app/components/cart/CartItemsList";
import OrderSummary from "@/app/components/cart/OrderSummary";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-white pb-16 sm:pb-24">
      {/* Breadcrumb Section */}
      <Breadcrumb />

      {/* Main Cart Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 py-6 sm:py-8">
        {/* Your Cart Heading */}
        <h1 className="text-[32px] sm:text-[40px] font-bold uppercase font-integral text-black leading-none tracking-normal mb-6 sm:mb-8">
          YOUR CART
        </h1>

        {/* 12-Column Responsive Layout: 7 columns for items, 5 columns for wider summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 items-start">
          {/* Left Side: Items List (7 cols) */}
          <div className="lg:col-span-7">
            <CartItemsList />
          </div>

          {/* Right Side: Order Summary (5 cols - Wider on Desktop) */}
          <div className="lg:col-span-5">
            <OrderSummary />
          </div>
        </div>
      </section>
    </main>
  );
}

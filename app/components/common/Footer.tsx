import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#F0F0F0] relative pt-24 pb-10 mt-20 font-satoshi">
      {/* Newsletter Banner Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 absolute -top-16 left-0 right-0 z-20">
        <div className="bg-black rounded-[20px] py-9 px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md">
          <h2 className="text-white text-3xl sm:text-4xl font-extrabold uppercase tracking-tight font-integral max-w-xl text-center lg:text-left leading-tight">
            STAY UPTO DATE ABOUT OUR LATEST OFFERS
          </h2>
          <div className="flex flex-col w-full lg:w-[350px] gap-3">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-black/40 pointer-events-none">
                ✉
              </span>
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-white text-black text-sm rounded-full pl-11 pr-4 py-3.5 focus:outline-none"
              />
            </div>
            <button className="w-full bg-white text-black font-medium text-sm rounded-full py-3.5 hover:bg-white/90 transition shadow-sm">
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 pt-16 grid grid-cols-2 md:grid-cols-5 gap-y-10 gap-x-8 border-b border-black/10 pb-12">
        
        {/* Brand Column */}
        <div className="col-span-2 flex flex-col items-start pr-4">
          <h3 className="text-2xl sm:text-[33.45px] font-extrabold uppercase tracking-tight font-integral text-black mb-4">
            SHOP.CO
          </h3>
          <p className="text-black/60 text-sm mb-6 max-w-sm leading-relaxed">
            We have clothes that suits your style and which you&apos;re proud to wear. From women to men.
          </p>
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a href="#" className="w-7 h-7 rounded-full bg-white border border-black/20 flex items-center justify-center text-black hover:bg-black hover:text-white transition text-xs">
              𝕏
            </a>
            <a href="#" className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 transition text-xs">
              f
            </a>
            <a href="#" className="w-7 h-7 rounded-full bg-white border border-black/20 flex items-center justify-center text-black hover:bg-black hover:text-white transition text-xs">
              in
            </a>
            <a href="#" className="w-7 h-7 rounded-full bg-white border border-black/20 flex items-center justify-center text-black hover:bg-black hover:text-white transition text-xs">
              git
            </a>
          </div>
        </div>

        {/* Company Column */}
        <div className="flex flex-col">
          <h4 className="font-bold text-sm tracking-[3px] uppercase text-black mb-4">
            COMPANY
          </h4>
          <ul className="space-y-3 text-sm text-black/60">
            <li><a href="#" className="hover:text-black transition">About</a></li>
            <li><a href="#" className="hover:text-black transition">Features</a></li>
            <li><a href="#" className="hover:text-black transition">Works</a></li>
            <li><a href="#" className="hover:text-black transition">Career</a></li>
          </ul>
        </div>

        {/* Help Column */}
        <div className="flex flex-col">
          <h4 className="font-bold text-sm tracking-[3px] uppercase text-black mb-4">
            HELP
          </h4>
          <ul className="space-y-3 text-sm text-black/60">
            <li><a href="#" className="hover:text-black transition">Customer Support</a></li>
            <li><a href="#" className="hover:text-black transition">Delivery Details</a></li>
            <li><a href="#" className="hover:text-black transition">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-black transition">Privacy Policy</a></li>
          </ul>
        </div>

        {/* FAQ Column */}
        <div className="flex flex-col">
          <h4 className="font-bold text-sm tracking-[3px] uppercase text-black mb-4">
            FAQ
          </h4>
          <ul className="space-y-3 text-sm text-black/60">
            <li><a href="#" className="hover:text-black transition">Account</a></li>
            <li><a href="#" className="hover:text-black transition">Manage Deliveries</a></li>
            <li><a href="#" className="hover:text-black transition">Orders</a></li>
            <li><a href="#" className="hover:text-black transition">Payments</a></li>
          </ul>
        </div>

        {/* Resources Column */}
        <div className="flex flex-col">
          <h4 className="font-bold text-sm tracking-[3px] uppercase text-black mb-4">
            RESOURCES
          </h4>
          <ul className="space-y-3 text-sm text-black/60">
            <li><a href="#" className="hover:text-black transition">Free eBooks</a></li>
            <li><a href="#" className="hover:text-black transition">Development Tutorial</a></li>
            <li><a href="#" className="hover:text-black transition">How to - Blog</a></li>
            <li><a href="#" className="hover:text-black transition">Youtube Playlist</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom Sub-footer / Copyright & Payment Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-black/60 text-xs sm:text-sm">
          Shop.co © 2000-2023, All Rights Reserved
        </p>
        <div className="flex items-center gap-2">
          <div className="bg-white px-2 py-1 rounded-[5px] border border-black/10 text-[10px] font-bold text-blue-800 shadow-sm">VISA</div>
          <div className="bg-white px-2 py-1 rounded-[5px] border border-black/10 text-[10px] font-bold text-orange-600 shadow-sm">MC</div>
          <div className="bg-white px-2 py-1 rounded-[5px] border border-black/10 text-[10px] font-bold text-blue-500 shadow-sm">PAYPAL</div>
          <div className="bg-white px-2 py-1 rounded-[5px] border border-black/10 text-[10px] font-bold text-black shadow-sm">APPLE</div>
          <div className="bg-white px-2 py-1 rounded-[5px] border border-black/10 text-[10px] font-bold text-blue-600 shadow-sm">G PAY</div>
        </div>
      </div>
    </footer>
  );
}
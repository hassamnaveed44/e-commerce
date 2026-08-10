import Link from "next/link";
import { Search, ShoppingCart, User, Menu, ChevronDown } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 h-16 md:h-24 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Trigger & Logo */}
        <div className="flex items-center space-x-3 lg:space-x-10">
          <button 
            aria-label="Open Menu"
            className="lg:hidden text-black focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <Link 
            href="/" 
            className="text-2xl md:text-[32px] font-extrabold tracking-tighter uppercase font-sans text-black"
          >
            SHOP.CO
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6 text-base text-black">
          <Link href="#" className="flex items-center gap-1 hover:opacity-80 transition">
            Shop <ChevronDown size={16} />
          </Link>
          <Link href="#" className="hover:opacity-80 transition">On Sale</Link>
          <Link href="#" className="hover:opacity-80 transition">New Arrivals</Link>
          <Link href="#" className="hover:opacity-80 transition">Brands</Link>
        </nav>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex items-center bg-[#F0F0F0] rounded-full px-4 py-3 flex-1 max-w-md space-x-3">
          <Search size={20} className="text-black/40" />
          <input
            type="text"
            placeholder="Search for products..."
            className="bg-transparent border-none outline-none text-sm w-full text-black placeholder:text-black/40"
          />
        </div>

        {/* Right Icons: Search (Mobile), Cart, User */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <button 
            aria-label="Open Search"
            className="md:hidden text-black focus:outline-none"
          >
            <Search size={24} />
          </button>
          <Link href="#" aria-label="Cart" className="text-black hover:opacity-80 transition">
            <ShoppingCart size={24} />
          </Link>
          <Link href="#" aria-label="Account" className="text-black hover:opacity-80 transition">
            <User size={24} />
          </Link>
        </div>

      </div>
    </header>
  );
}
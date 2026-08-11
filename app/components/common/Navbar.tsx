"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Menu, X, ChevronDown, CircleUserRound } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShopDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShopDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // 200ms grace period so moving mouse to items won't close it abruptly
    timeoutRef.current = setTimeout(() => {
      setShopDropdownOpen(false);
    }, 200);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 h-16 md:h-24 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Trigger & Logo */}
        <div className="flex items-center space-x-3 lg:space-x-10">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open Menu"
            className="lg:hidden text-black focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
          {/* Shop Dropdown */}
          <div 
            ref={dropdownRef}
            className="relative py-2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              type="button"
              onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
              className="flex items-center gap-1 hover:opacity-80 transition cursor-pointer font-satoshi"
            >
              Shop <ChevronDown size={16} className={`transition-transform duration-200 ${shopDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {shopDropdownOpen && (
              <div className="absolute top-full left-0 pt-1 w-48 z-50">
                <div className="bg-white border border-black/10 rounded-xl shadow-lg py-2">
                  <Link 
                    href="/#new-arrivals" 
                    onClick={() => setShopDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-black hover:bg-black/5 transition font-satoshi"
                  >
                    New Arrivals
                  </Link>
                  <Link 
                    href="/#top-selling" 
                    onClick={() => setShopDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-black hover:bg-black/5 transition font-satoshi"
                  >
                    Top Selling
                  </Link>
                  <div className="border-t border-black/5 my-1" />
                  <Link 
                    href="/category/casual" 
                    onClick={() => setShopDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-black/70 hover:bg-black/5 hover:text-black transition font-satoshi"
                  >
                    Casual
                  </Link>
                  <Link 
                    href="/category/formal" 
                    onClick={() => setShopDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-black/70 hover:bg-black/5 hover:text-black transition font-satoshi"
                  >
                    Formal
                  </Link>
                  <Link 
                    href="/category/party" 
                    onClick={() => setShopDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-black/70 hover:bg-black/5 hover:text-black transition font-satoshi"
                  >
                    Party
                  </Link>
                  <Link 
                    href="/category/gym" 
                    onClick={() => setShopDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-black/70 hover:bg-black/5 hover:text-black transition font-satoshi"
                  >
                    Gym
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/#top-selling" className="hover:opacity-80 transition">On Sale</Link>
          <Link href="/#new-arrivals" className="hover:opacity-80 transition">New Arrivals</Link>
          <Link href="/#brands" className="hover:opacity-80 transition">Brands</Link>
        </nav>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-[#F0F0F0] rounded-full px-4 py-3 flex-1 max-w-md space-x-3">
          <button type="submit" aria-label="Search" className="text-black/40 hover:text-black transition">
            <Search size={20} />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="bg-transparent border-none outline-none text-sm w-full text-black placeholder:text-black/40"
          />
        </form>

        {/* Right Icons: Search (Mobile), Cart, User */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <button 
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Open Search"
            className="md:hidden text-black focus:outline-none"
          >
            <Search size={24} />
          </button>
          <Link href="/cart" aria-label="Cart" className="text-black hover:opacity-80 transition">
            <ShoppingCart size={24} />
          </Link>
          <Link href="/profile" aria-label="Account" className="text-black hover:opacity-80 transition">
            <CircleUserRound size={24} />
          </Link>
        </div>

      </div>

      {/* Mobile Search Bar Dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 bg-white border-b border-black/10">
          <form onSubmit={handleSearch} className="flex items-center bg-[#F0F0F0] rounded-full px-4 py-2.5 space-x-3">
            <Search size={18} className="text-black/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="bg-transparent border-none outline-none text-sm w-full text-black placeholder:text-black/40"
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Mobile Navigation Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-black/10 shadow-md py-6 px-6 transition-all z-50">
          <nav className="flex flex-col space-y-4 text-base text-black font-satoshi">
            {/* Mobile Shop Accordion */}
            <div>
              <button 
                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                className="w-full flex items-center justify-between hover:opacity-80 transition pb-2 border-b border-black/5 text-left"
              >
                <span>Shop</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${shopDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {shopDropdownOpen && (
                <div className="pl-4 py-2 flex flex-col space-y-2 text-sm text-black/70">
                  <Link 
                    href="/#new-arrivals" 
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="hover:text-black transition"
                  >
                    • New Arrivals
                  </Link>
                  <Link 
                    href="/#top-selling" 
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="hover:text-black transition"
                  >
                    • Top Selling
                  </Link>
                  <div className="border-t border-black/5 my-1" />
                  <Link 
                    href="/category/casual" 
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="hover:text-black transition"
                  >
                    • Casual
                  </Link>
                  <Link 
                    href="/category/formal" 
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="hover:text-black transition"
                  >
                    • Formal
                  </Link>
                  <Link 
                    href="/category/party" 
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="hover:text-black transition"
                  >
                    • Party
                  </Link>
                  <Link 
                    href="/category/gym" 
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="hover:text-black transition"
                  >
                    • Gym
                  </Link>
                </div>
              )}
            </div>

            <Link 
              href="/#top-selling" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:opacity-80 transition pb-2 border-b border-black/5"
            >
              On Sale
            </Link>
            <Link 
              href="/#new-arrivals" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:opacity-80 transition pb-2 border-b border-black/5"
            >
              New Arrivals
            </Link>
            <Link 
              href="/#brands" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:opacity-80 transition"
            >
              Brands
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

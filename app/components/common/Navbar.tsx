"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  CircleUserRound,
  Loader2,
  PackageX,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

// Hydration-safe client check using standard React 19 API
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isClient = useIsClient();
  const router = useRouter();
  const { totalItemsCount } = useCart();

  // Live search state
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search query
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setLiveResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setIsSearchOpen(true);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=5`);
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setLiveResults(data.products);
        } else {
          setLiveResults([]);
        }
      } catch (err) {
        console.error("Live search error:", err);
        setLiveResults([]);
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    }, 250);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShopDropdownOpen(false);
      }
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
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
    timeoutRef.current = setTimeout(() => {
      setShopDropdownOpen(false);
    }, 200);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 h-16 md:h-24 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger & Logo */}
        <div className="flex items-center space-x-3 lg:space-x-10">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open Menu"
            className="lg:hidden text-black focus:outline-none cursor-pointer"
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
              Shop{" "}
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${shopDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {shopDropdownOpen && (
              <div className="absolute top-full left-0 pt-2 w-[420px] z-50 animate-in fade-in zoom-in-95">
                <div className="bg-white border border-black/10 rounded-2xl shadow-xl p-4 grid grid-cols-2 gap-4">
                  {/* Column 1: Gender / Audience & Featured */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 pb-1 border-b border-black/5">
                      Departments
                    </p>
                    <Link
                      href="/category/men"
                      onClick={() => setShopDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-sm text-black font-semibold hover:bg-black/5 rounded-lg transition"
                    >
                      <span>Men's Collection</span>
                      <span className="text-[10px] text-black/50 font-normal bg-black/5 px-2 py-0.5 rounded-full">New</span>
                    </Link>
                    <Link
                      href="/category/women"
                      onClick={() => setShopDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-sm text-black font-semibold hover:bg-black/5 rounded-lg transition"
                    >
                      <span>Women's Collection</span>
                      <span className="text-[10px] text-black/50 font-normal bg-black/5 px-2 py-0.5 rounded-full">Trending</span>
                    </Link>
                    <Link
                      href="/category/kids"
                      onClick={() => setShopDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-sm text-black font-semibold hover:bg-black/5 rounded-lg transition"
                    >
                      <span>Kids Collection</span>
                    </Link>
                    
                    <div className="pt-2 border-t border-black/5 space-y-1">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 pb-1">
                        Featured
                      </p>
                      <Link
                        href="/#new-arrivals"
                        onClick={() => setShopDropdownOpen(false)}
                        className="block px-3 py-1.5 text-xs text-black/80 hover:bg-black/5 hover:text-black rounded-lg transition"
                      >
                        ⚡ New Arrivals
                      </Link>
                      <Link
                        href="/#top-selling"
                        onClick={() => setShopDropdownOpen(false)}
                        className="block px-3 py-1.5 text-xs text-black/80 hover:bg-black/5 hover:text-black rounded-lg transition"
                      >
                        🔥 Top Selling
                      </Link>
                    </div>
                  </div>

                  {/* Column 2: Dress Styles & Garments */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 pb-1 border-b border-black/5">
                      Dress Styles
                    </p>
                    <Link
                      href="/category/casual"
                      onClick={() => setShopDropdownOpen(false)}
                      className="block px-3 py-2 text-sm text-black/80 hover:bg-black/5 hover:text-black rounded-lg transition font-medium"
                    >
                      Casual Wear
                    </Link>
                    <Link
                      href="/category/formal"
                      onClick={() => setShopDropdownOpen(false)}
                      className="block px-3 py-2 text-sm text-black/80 hover:bg-black/5 hover:text-black rounded-lg transition font-medium"
                    >
                      Formal Wear
                    </Link>
                    <Link
                      href="/category/party"
                      onClick={() => setShopDropdownOpen(false)}
                      className="block px-3 py-2 text-sm text-black/80 hover:bg-black/5 hover:text-black rounded-lg transition font-medium"
                    >
                      Party Outfits
                    </Link>
                    <Link
                      href="/category/gym"
                      onClick={() => setShopDropdownOpen(false)}
                      className="block px-3 py-2 text-sm text-black/80 hover:bg-black/5 hover:text-black rounded-lg transition font-medium"
                    >
                      Gym & Active
                    </Link>

                    <div className="pt-2 border-t border-black/5 space-y-1">
                      <Link
                        href="/category/all"
                        onClick={() => setShopDropdownOpen(false)}
                        className="block px-3 py-2 text-xs font-bold text-black hover:bg-black hover:text-white rounded-lg transition text-center border border-black/15"
                      >
                        Browse All Products →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/#top-selling" className="hover:opacity-80 transition">
            On Sale
          </Link>
          <Link href="/#new-arrivals" className="hover:opacity-80 transition">
            New Arrivals
          </Link>
          <Link href="/#brands" className="hover:opacity-80 transition">
            Brands
          </Link>
        </nav>

        {/* Search Bar (Desktop) */}
        <div ref={desktopSearchRef} className="relative hidden md:flex flex-1 max-w-md">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-[#F0F0F0] rounded-full px-4 py-3 w-full space-x-3 focus-within:ring-2 focus-within:ring-black/10 transition"
          >
            <button
              type="submit"
              aria-label="Search"
              className="text-black/40 hover:text-black transition cursor-pointer"
            >
              <Search size={20} />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setIsSearchOpen(true);
              }}
              placeholder="Search for products..."
              className="bg-transparent border-none outline-none text-sm w-full text-black placeholder:text-black/40"
            />
            {isSearching && (
              <Loader2 size={16} className="animate-spin text-black/40 shrink-0" />
            )}
          </form>

          {/* Desktop Live Search Dropdown */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-black/10 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 font-satoshi">
              {isSearching ? (
                <div className="p-6 flex items-center justify-center gap-2.5 text-xs text-slate-500 font-medium">
                  <Loader2 size={16} className="animate-spin text-slate-700" />
                  <span>Searching products for &ldquo;{searchQuery}&rdquo;...</span>
                </div>
              ) : liveResults.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  <div className="p-3 bg-slate-50 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <span>Matching Products ({liveResults.length})</span>
                    <span className="text-slate-400">Available In Store</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {liveResults.map((product) => {
                      const img = product.images?.[0]?.url || "/images/placeholder.png";
                      return (
                        <Link
                          key={product.id}
                          href={`/shop/product/${product.slug}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setMobileSearchOpen(false);
                          }}
                          className="p-3 flex items-center gap-3 hover:bg-slate-50 transition cursor-pointer group"
                        >
                          <div className="w-11 h-11 rounded-lg bg-[#F0EEED] overflow-hidden shrink-0 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate group-hover:text-black">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium truncate">
                              {product.category?.name || product.dressStyle || "Apparel"}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              ${Number(product.price).toFixed(2)}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="text-xs font-bold text-slate-900 hover:text-black flex items-center justify-center gap-1 w-full cursor-pointer py-1"
                    >
                      <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ) : hasSearched ? (
                <div className="p-6 text-center space-y-2.5">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                    <PackageX size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">This product is unavailable</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      We couldn&apos;t find any products matching &ldquo;<strong className="text-slate-800">{searchQuery}</strong>&rdquo;. Try searching for &ldquo;shirts&rdquo;, &ldquo;t-shirts&rdquo;, or &ldquo;three piece&rdquo;.
                    </p>
                  </div>
                  <div className="pt-1">
                    <Link
                      href="/category/all"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setMobileSearchOpen(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-black underline hover:opacity-75"
                    >
                      <span>Explore all available items</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Icons: Search (Mobile), Cart with Hydration-Safe Badge, User */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Open Search"
            className="md:hidden text-black focus:outline-none cursor-pointer"
          >
            <Search size={24} />
          </button>

          {/* Cart Icon with Hydration-Safe Badge */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="text-black hover:opacity-80 transition relative p-1 cursor-pointer"
          >
            <ShoppingCart size={24} />
            {isClient && totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-in zoom-in">
                {totalItemsCount > 99 ? "99+" : totalItemsCount}
              </span>
            )}
          </Link>

          <Link
            href="/account"
            aria-label="Account"
            className="text-black hover:opacity-80 transition cursor-pointer"
          >
            <CircleUserRound size={24} />
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {mobileSearchOpen && (
        <div ref={mobileSearchRef} className="relative md:hidden px-4 pb-3 bg-white border-b border-black/10">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-[#F0F0F0] rounded-full px-4 py-2.5 space-x-3"
          >
            <Search size={18} className="text-black/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="bg-transparent border-none outline-none text-sm w-full text-black placeholder:text-black/40"
              autoFocus
            />
            {isSearching && (
              <Loader2 size={16} className="animate-spin text-black/40 shrink-0" />
            )}
          </form>

          {/* Mobile Live Search Dropdown */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="mt-2 bg-white rounded-2xl border border-black/10 shadow-2xl overflow-hidden z-50 animate-in fade-in font-satoshi">
              {isSearching ? (
                <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                  <Loader2 size={14} className="animate-spin text-slate-700" />
                  <span>Searching &ldquo;{searchQuery}&rdquo;...</span>
                </div>
              ) : liveResults.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  <div className="p-2.5 bg-slate-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <span>Matching Products ({liveResults.length})</span>
                    <span className="text-slate-400">In Store</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {liveResults.map((product) => {
                      const img = product.images?.[0]?.url || "/images/placeholder.png";
                      return (
                        <Link
                          key={product.id}
                          href={`/shop/product/${product.slug}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setMobileSearchOpen(false);
                          }}
                          className="p-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#F0EEED] overflow-hidden shrink-0 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              ${Number(product.price).toFixed(2)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="p-2 bg-slate-50 text-center">
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1 w-full cursor-pointer py-1"
                    >
                      <span>View all results →</span>
                    </button>
                  </div>
                </div>
              ) : hasSearched ? (
                <div className="p-5 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                    <PackageX size={18} />
                  </div>
                  <p className="text-xs font-bold text-slate-900">This product is unavailable</p>
                  <p className="text-[11px] text-slate-500">
                    No items found for &ldquo;{searchQuery}&rdquo;.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Mobile Navigation Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-black/10 shadow-md py-6 px-6 transition-all z-50">
          <nav className="flex flex-col space-y-4 text-base text-black font-satoshi">
            <div>
              <button
                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                className="w-full flex items-center justify-between hover:opacity-80 transition pb-2 border-b border-black/5 text-left cursor-pointer"
              >
                <span>Shop</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${shopDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {shopDropdownOpen && (
                <div className="pl-4 py-2 flex flex-col space-y-2 text-sm text-black/70">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pt-1">
                    Departments
                  </p>
                  <Link
                    href="/category/men"
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="font-semibold text-black hover:text-black transition"
                  >
                    • Men's Collection
                  </Link>
                  <Link
                    href="/category/women"
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="font-semibold text-black hover:text-black transition"
                  >
                    • Women's Collection
                  </Link>
                  <Link
                    href="/category/kids"
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="font-semibold text-black hover:text-black transition"
                  >
                    • Kids Collection
                  </Link>
                  
                  <div className="border-t border-black/5 my-1" />
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Styles & Categories
                  </p>
                  <Link
                    href="/category/casual"
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="hover:text-black transition"
                  >
                    • Casual Wear
                  </Link>
                  <Link
                    href="/category/formal"
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="hover:text-black transition"
                  >
                    • Formal Wear
                  </Link>
                  <Link
                    href="/category/party"
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="hover:text-black transition"
                  >
                    • Party Outfits
                  </Link>
                  <Link
                    href="/category/gym"
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="hover:text-black transition"
                  >
                    • Gym & Active
                  </Link>
                  <Link
                    href="/category/all"
                    onClick={() => {
                      setShopDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="font-bold text-black hover:text-black transition pt-1"
                  >
                    → Browse All Products
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

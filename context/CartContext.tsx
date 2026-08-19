"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  colorName: string;
  colorHex: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number;
  quantity: number;
  stockQuantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  totalItemsCount: number;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalPrice: number;
  isLoading: boolean;
  isHydrated: boolean;
  promoCode: string;
  promoDiscountPercent: number;
  promoLabel: string | null;
  isAutoApplied: boolean;
  applyPromoCode: (code: string, customLabel?: string) => boolean;
  removePromoCode: () => void;
  addToCart: (item: {
    variantId: string;
    quantity: number;
    productId: string;
    name: string;
    slug: string;
    image: string;
    size: string;
    colorName: string;
    colorHex: string;
    price: number;
    originalPrice: number | null;
    discountPercent: number;
    stockQuantity: number;
  }) => Promise<void>;
  updateQuantity: (cartItemId: string, delta: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const USER_CACHE_KEY = "shopco_cart_cache";
const GUEST_CART_KEY = "shopco_guest_cart";
const PROMO_STORAGE_KEY = "shopco_active_promo";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  // Consistent initial state for SSR and initial hydration render
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(0);
  const [promoLabel, setPromoLabel] = useState<string | null>(null);
  const [isAutoApplied, setIsAutoApplied] = useState(false);

  // Apply promo code with anti-stacking logic
  const applyPromoCode = useCallback((code: string, customLabel?: string) => {
    const cleaned = code.trim().toUpperCase();

    // 20% First-Order / Welcome / VIP discounts
    if (
      cleaned === "WELCOME20" ||
      cleaned === "FIRST20" ||
      cleaned === "SHOP20" ||
      cleaned === "DISCOUNT20"
    ) {
      setPromoCode(cleaned);
      setPromoDiscountPercent(20);
      setPromoLabel(customLabel || "🎉 20% First-Order Welcome Discount Applied!");
      setIsAutoApplied(Boolean(customLabel));
      try {
        localStorage.setItem(
          PROMO_STORAGE_KEY,
          JSON.stringify({
            code: cleaned,
            percent: 20,
            label: customLabel || "20% Discount",
            isAuto: Boolean(customLabel),
          })
        );
      } catch {}
      return true;
    }

    // 10% Referral / Influencer / Ad discounts
    if (
      cleaned === "REF10" ||
      cleaned === "SHOP10" ||
      cleaned === "AD10" ||
      cleaned === "TIKTOK10" ||
      cleaned === "INSTA10"
    ) {
      setPromoCode(cleaned);
      setPromoDiscountPercent(10);
      setPromoLabel(customLabel || "🏷️ 10% Referral Discount Applied!");
      setIsAutoApplied(Boolean(customLabel));
      try {
        localStorage.setItem(
          PROMO_STORAGE_KEY,
          JSON.stringify({
            code: cleaned,
            percent: 10,
            label: customLabel || "10% Referral",
            isAuto: Boolean(customLabel),
          })
        );
      } catch {}
      return true;
    }

    return false;
  }, []);

  const removePromoCode = useCallback(() => {
    setPromoCode("");
    setPromoDiscountPercent(0);
    setPromoLabel(null);
    setIsAutoApplied(false);
    try {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    } catch {}
  }, []);

  // Read initial cache & URL referral parameters on client mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (cached) {
        setCartItems(JSON.parse(cached));
      }

      // Check saved promo in storage
      const savedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
      if (savedPromo) {
        const parsed = JSON.parse(savedPromo);
        if (parsed.code && parsed.percent) {
          setPromoCode(parsed.code);
          setPromoDiscountPercent(parsed.percent);
          setPromoLabel(parsed.label || null);
          setIsAutoApplied(Boolean(parsed.isAuto));
        }
      }

      // Check if arriving via Referral / Campaign link (e.g. ?ref=insta10 or ?promo=shop20)
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const refParam = params.get("ref") || params.get("referral");
        const promoParam = params.get("promo");

        if (promoParam) {
          applyPromoCode(promoParam, `🏷️ Campaign Discount Applied (${promoParam.toUpperCase()})`);
        } else if (refParam) {
          applyPromoCode("REF10", `🏷️ Referral Discount Applied (via ${refParam})`);
        }
      }
    } catch {
      // Ignore cache parse error
    }
    setIsHydrated(true);
  }, [applyPromoCode]);

  // Fetch cart from server
  const fetchServerCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const json = await res.json();
      if (json.success && Array.isArray(json.items)) {
        setCartItems(json.items);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(json.items));
      }
    } catch (err) {
      console.error("Failed to load server cart:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync guest cart when user logs in
  useEffect(() => {
    if (!isLoaded) return;

    const syncWithUser = async () => {
      if (user) {
        try {
          const guestCached = localStorage.getItem(GUEST_CART_KEY);
          const guestItems: CartItem[] = guestCached ? JSON.parse(guestCached) : [];

          if (guestItems.length > 0) {
            const syncPayload = guestItems.map((i) => ({
              variantId: i.variantId,
              quantity: i.quantity,
            }));

            const res = await fetch("/api/cart/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: syncPayload }),
            });
            const json = await res.json();
            // Clear guest items after successful sync
            localStorage.removeItem(GUEST_CART_KEY);
            if (json.success && Array.isArray(json.items)) {
              setCartItems(json.items);
              localStorage.setItem(USER_CACHE_KEY, JSON.stringify(json.items));
              return;
            }
          }
        } catch (err) {
          console.error("Cart sync failed:", err);
        }
      }
      fetchServerCart();
    };

    syncWithUser();
  }, [user, isLoaded, fetchServerCart]);

  const addToCart = async (itemData: {
    variantId: string;
    quantity: number;
    productId: string;
    name: string;
    slug: string;
    image: string;
    size: string;
    colorName: string;
    colorHex: string;
    price: number;
    originalPrice: number | null;
    discountPercent: number;
    stockQuantity: number;
  }) => {
    // Optimistic UI Update
    setCartItems((prev) => {
      const existing = prev.find((i) => i.variantId === itemData.variantId);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((i) =>
          i.variantId === itemData.variantId
            ? { ...i, quantity: Math.min(i.quantity + itemData.quantity, itemData.stockQuantity) }
            : i
        );
      } else {
        const newItem: CartItem = {
          id: `temp_${Date.now()}`,
          ...itemData,
        };
        updated = [newItem, ...prev];
      }
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updated));
      if (!user) {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: itemData.variantId,
          quantity: itemData.quantity,
        }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.items)) {
        setCartItems(json.items);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(json.items));
        if (!user) {
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(json.items));
        }
      }
    } catch (err) {
      console.error("Add to cart API failed:", err);
    }
  };

  const updateQuantity = async (cartItemId: string, delta: number) => {
    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return;

    const newQty = item.quantity + delta;

    // Optimistic UI Update
    if (newQty <= 0) {
      setCartItems((prev) => {
        const updated = prev.filter((i) => i.id !== cartItemId);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updated));
        if (!user) localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
        return updated;
      });
      await fetch(`/api/cart?id=${cartItemId}`, { method: "DELETE" });
    } else {
      setCartItems((prev) => {
        const updated = prev.map((i) =>
          i.id === cartItemId ? { ...i, quantity: Math.min(newQty, item.stockQuantity) } : i
        );
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updated));
        if (!user) localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
        return updated;
      });

      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity: newQty }),
      });
    }
  };

  const removeItem = async (cartItemId: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.id !== cartItemId);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updated));
      if (!user) localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch(`/api/cart?id=${cartItemId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Remove item failed:", err);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setPromoCode("");
    setPromoDiscountPercent(0);
    setPromoLabel(null);
    setIsAutoApplied(false);
    localStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem(GUEST_CART_KEY);
    localStorage.removeItem(PROMO_STORAGE_KEY);
  };

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = promoDiscountPercent > 0 ? (subtotal * promoDiscountPercent) / 100 : 0;
  const deliveryFee = subtotal > 0 && subtotal < 100 ? 15 : 0; // Free shipping over $100
  const totalPrice = Math.max(0, subtotal - discountAmount + deliveryFee);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        subtotal,
        discountAmount,
        deliveryFee,
        totalPrice,
        isLoading,
        isHydrated,
        promoCode,
        promoDiscountPercent,
        promoLabel,
        isAutoApplied,
        applyPromoCode,
        removePromoCode,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

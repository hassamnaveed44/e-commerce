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
  promoCode: string;
  promoDiscountPercent: number;
  applyPromoCode: (code: string) => boolean;
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

const LOCAL_STORAGE_KEY = "shopco_cart_cache";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  // Lazy state initialization from localStorage avoids synchronous setState in useEffect
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(0);

  // Fetch cart from server
  const fetchServerCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const json = await res.json();
      if (json.success && Array.isArray(json.items)) {
        setCartItems(json.items);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.items));
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
          const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
          const localItems: CartItem[] = cached ? JSON.parse(cached) : [];

          if (localItems.length > 0) {
            const syncPayload = localItems.map((i) => ({
              variantId: i.variantId,
              quantity: i.quantity,
            }));

            const res = await fetch("/api/cart/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: syncPayload }),
            });
            const json = await res.json();
            if (json.success && Array.isArray(json.items)) {
              setCartItems(json.items);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.items));
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
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
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
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.items));
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
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      await fetch(`/api/cart?id=${cartItemId}`, { method: "DELETE" });
    } else {
      setCartItems((prev) => {
        const updated = prev.map((i) =>
          i.id === cartItemId ? { ...i, quantity: Math.min(newQty, i.stockQuantity) } : i
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
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
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
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
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const applyPromoCode = (code: string) => {
    const cleaned = code.trim().toUpperCase();
    if (cleaned === "SHOP20" || cleaned === "DISCOUNT20") {
      setPromoCode(cleaned);
      setPromoDiscountPercent(20);
      return true;
    }
    if (cleaned === "SHOP10") {
      setPromoCode(cleaned);
      setPromoDiscountPercent(10);
      return true;
    }
    return false;
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
        promoCode,
        promoDiscountPercent,
        applyPromoCode,
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

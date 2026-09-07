"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import type { ProductDetail } from "@/lib/types";

export interface CartItem {
  id: string; // Unique identifier combining product ID + selected color + selected size
  product: ProductDetail;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: ProductDetail, quantity: number, color?: string, size?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  isMounted: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "vistulavogue-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage on mount (prevents SSR hydration mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim()) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
    setIsMounted(true);
  }, []);

  // Save cart to localStorage whenever it changes
  const saveCart = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, []);

  const addItem = useCallback(
    (product: ProductDetail, quantity: number, color?: string, size?: string) => {
      const itemId = `${product._id}-${color || ""}-${size || ""}`;
      
      const existingItemIndex = items.findIndex((item) => item.id === itemId);
      if (existingItemIndex > -1) {
        const updatedItems = [...items];
        const newQty = updatedItems[existingItemIndex].quantity + quantity;
        // Cap quantity at available stock
        updatedItems[existingItemIndex].quantity = Math.min(newQty, product.stockCount);
        saveCart(updatedItems);
      } else {
        const newItem: CartItem = {
          id: itemId,
          product,
          quantity: Math.min(quantity, product.stockCount),
          selectedColor: color,
          selectedSize: size,
        };
        saveCart([...items, newItem]);
      }
    },
    [items, saveCart]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      saveCart(items.filter((item) => item.id !== itemId));
    },
    [items, saveCart]
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId);
        return;
      }
      const updatedItems = items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: Math.min(quantity, item.product.stockCount),
          };
        }
        return item;
      });
      saveCart(updatedItems);
    },
    [items, removeItem, saveCart]
  );

  const clearCart = useCallback(() => {
    saveCart([]);
  }, [saveCart]);

  const cartCount = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      cartCount,
      isMounted,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, cartCount, isMounted]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

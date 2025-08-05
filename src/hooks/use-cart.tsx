
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import type { Product } from "@/lib/types";

export interface CartItem extends Product {
  quantity: number;
  variationName: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Product & { variationName: string }, quantity: number) => void;
  removeFromCart: (cartItemKey: string) => void;
  updateQuantity: (cartItemKey: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const isBrowser = typeof window !== 'undefined';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (!isBrowser) return [];
    try {
      const item = window.localStorage.getItem("cart");
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cart]);

  const getCartItemKey = (item: { id: string; variationName: string }) => `${item.id}-${item.variationName}`;

  const addToCart = (item: Product & { variationName: string }, quantity: number) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (cartItem) => getCartItemKey(cartItem) === getCartItemKey(item)
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, { ...item, quantity }];
      }
    });
  };

  const removeFromCart = (cartItemKey: string) => {
    setCart((prevCart) => prevCart.filter((item) => getCartItemKey(item) !== cartItemKey));
  };

  const updateQuantity = (cartItemKey: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(cartItemKey);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        getCartItemKey(item) === cartItemKey ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

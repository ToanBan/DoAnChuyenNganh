"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import GetCountCart from "../api/GetCountCart";

interface CartContextType {
  countCartItem: number;
  setCountCartItem: (count: number) => void;
  refreshCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [countCartItem, setCountCartItem] = useState(0);

  const refreshCartCount = async () => {
    const count = await GetCountCart();
    setCountCartItem(count);
  };

  useEffect(() => {
    refreshCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ countCartItem, setCountCartItem, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

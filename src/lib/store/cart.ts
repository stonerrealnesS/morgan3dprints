"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  priceInCents: number;
  image?: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  fulfillment: "pickup" | "ship";
  discreetPacking: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setFulfillment: (f: "pickup" | "ship") => void;
  setDiscreetPacking: (v: boolean) => void;
  itemCount: () => number;
  subtotalCents: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      fulfillment: "ship",
      discreetPacking: false,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return { items: state.items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: quantity <= 0 ? state.items.filter((i) => i.id !== id) : state.items.map((i) => i.id === id ? { ...i, quantity } : i),
        })),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setFulfillment: (fulfillment) => set({ fulfillment }),
      setDiscreetPacking: (discreetPacking) => set({ discreetPacking }),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotalCents: () => get().items.reduce((sum, i) => sum + i.priceInCents * i.quantity, 0),
    }),
    { name: "m3dp-cart", skipHydration: true }
  )
);

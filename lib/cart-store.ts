"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Frame } from "@/lib/types";

type CartStore = {
  items: CartItem[];
  addItem: (frame: Frame, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  count: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (frame, qty = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === frame.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === frame.id
                  ? {
                      ...item,
                      cartQty: Math.min(item.cartQty + qty, Math.max(frame.quantity, 1))
                    }
                  : item
              )
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...frame,
                cartQty: Math.min(qty, Math.max(frame.quantity, 1))
              }
            ]
          };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      updateQty: (id, qty) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  cartQty: Math.min(Math.max(qty, 1), Math.max(item.quantity, 1))
                }
              : item
          )
        })),
      clearCart: () => set({ items: [] }),
      subtotal: () =>
        get().items.reduce((total, item) => total + Number(item.price) * item.cartQty, 0),
      count: () => get().items.reduce((total, item) => total + item.cartQty, 0)
    }),
    {
      name: "clearview-cart",
      skipHydration: true
    }
  )
);

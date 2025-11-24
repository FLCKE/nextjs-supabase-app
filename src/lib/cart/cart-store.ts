'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price_cts: number;
  tax_rate: number;
  quantity: number;
  notes?: string;
}

interface CartStore {
  items: CartItem[];
  tableToken: string | null;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  setTableToken: (token: string) => void;
  
  // Computed values
  getItemCount: () => number;
  getSubtotal: () => number;
  getTaxes: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      tableToken: null,

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === item.id);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: item.quantity || 1 }],
          });
        }
      },

      removeItem: (itemId) => {
        set({
          items: get().items.filter((item) => item.id !== itemId),
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      },

      updateNotes: (itemId, notes) => {
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, notes } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [], tableToken: null });
      },

      setTableToken: (token) => {
        set({ tableToken: token });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price_cts * item.quantity,
          0
        );
      },

      getTaxes: () => {
        return get().items.reduce((total, item) => {
          const itemTotal = item.price_cts * item.quantity;
          const itemTax = Math.round((itemTotal * item.tax_rate) / 100);
          return total + itemTax;
        }, 0);
      },

      getTotal: () => {
        return get().getSubtotal() + get().getTaxes();
      },
    }),
    {
      name: 'wego-cart-storage',
    }
  )
);

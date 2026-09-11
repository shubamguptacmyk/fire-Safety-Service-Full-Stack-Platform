import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  quoteMode: boolean;
  addItem: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  setQuoteMode: (v: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      quoteMode: false,
      addItem: (productId, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === productId);
          if (existing) {
            return { lines: state.lines.map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l)) };
          }
          return { lines: [...state.lines, { productId, quantity }] };
        }),
      updateQuantity: (productId, delta) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + delta } : l))
            .filter((l) => l.quantity > 0),
        })),
      removeItem: (productId) => set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
      setQuoteMode: (v) => set({ quoteMode: v }),
    }),
    { name: "ak-fire-safety-cart" }
  )
);

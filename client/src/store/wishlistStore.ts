import { create } from "zustand";
import { persist } from "zustand/middleware";
import { wishlistService } from "@/services/wishlistService";
import { useAuthStore } from "./authStore";

interface WishlistState {
  itemIds: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => Promise<void>;
  toggleItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clear: () => Promise<void>;
  syncWithServer: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      itemIds: [],
      addItem: (productId: string) => {
        set((state) => ({
          itemIds: state.itemIds.includes(productId)
            ? state.itemIds
            : [...state.itemIds, productId],
        }));
      },
      removeItem: async (productId: string) => {
        set((state) => ({
          itemIds: state.itemIds.filter((id) => id !== productId),
        }));
        if (useAuthStore.getState().accessToken) {
          try {
            await wishlistService.removeItem(productId);
          } catch {
            // Silently fail network sync, local state stays responsive
          }
        }
      },
      toggleItem: async (productId: string) => {
        const exists = get().itemIds.includes(productId);
        if (exists) {
          set((state) => ({
            itemIds: state.itemIds.filter((id) => id !== productId),
          }));
        } else {
          set((state) => ({
            itemIds: [...state.itemIds, productId],
          }));
        }

        if (useAuthStore.getState().accessToken) {
          try {
            await wishlistService.toggleItem(productId);
          } catch {
            // Fallback gracefully
          }
        }
      },
      isInWishlist: (productId: string) => get().itemIds.includes(productId),
      clear: async () => {
        set({ itemIds: [] });
        if (useAuthStore.getState().accessToken) {
          try {
            await wishlistService.clearWishlist();
          } catch {
            // Silently handle
          }
        }
      },
      syncWithServer: async () => {
        if (!useAuthStore.getState().accessToken) return;
        try {
          const products = await wishlistService.getWishlist();
          if (Array.isArray(products)) {
            const serverIds = products.map((p) => p._id);
            // Merge server and local ids
            const merged = Array.from(new Set([...get().itemIds, ...serverIds]));
            set({ itemIds: merged });
          }
        } catch {
          // Keep local wishlist
        }
      },
    }),
    { name: "ak-fire-safety-wishlist" }
  )
);

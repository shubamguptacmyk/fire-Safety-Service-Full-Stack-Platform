import { apiClient } from "./apiClient";
import { Product } from "@/types";

export interface ApiWishlist {
  _id: string;
  user: string;
  products: Product[];
  createdAt: string;
  updatedAt: string;
}

export const wishlistService = {
  async getWishlist(): Promise<Product[]> {
    const res = await apiClient.get<{ success: boolean; data: ApiWishlist }>("/wishlist");
    return res.data.data?.products || [];
  },

  async toggleItem(productId: string): Promise<Product[]> {
    const res = await apiClient.post<{ success: boolean; data: ApiWishlist }>(`/wishlist/${productId}`);
    return res.data.data?.products || [];
  },

  async removeItem(productId: string): Promise<Product[]> {
    const res = await apiClient.delete<{ success: boolean; data: ApiWishlist }>(`/wishlist/${productId}`);
    return res.data.data?.products || [];
  },

  async clearWishlist(): Promise<void> {
    await apiClient.delete("/wishlist");
  },
};

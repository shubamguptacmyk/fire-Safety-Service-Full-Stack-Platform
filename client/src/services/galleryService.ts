import { apiClient } from "./apiClient";

export interface GalleryItem {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  projectDate?: string;
  clientName?: string;
  location?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryListResponse {
  items: GalleryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const galleryService = {
  async getGalleryItems(params: { category?: string; page?: number; limit?: number } = {}): Promise<GalleryListResponse> {
    const res = await apiClient.get<{ success: boolean; data: GalleryListResponse }>("/gallery", {
      params: {
        ...params,
        category: params.category && params.category !== "All" ? params.category : undefined,
        isActive: true,
      },
    });
    return res.data.data;
  },
};

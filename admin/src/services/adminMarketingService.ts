import { apiClient } from "./apiClient";

export interface AdminBannerItem {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  buttonText?: string;
  position: "home_hero" | "home_secondary" | "promo_strip" | "category_top";
  order: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminGalleryItem {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: "installation" | "amc" | "training" | "equipment" | "audit";
  order: number;
  isActive: boolean;
  createdAt: string;
}

export const adminMarketingService = {
  // Banners
  async getBanners() {
    const res = await apiClient.get<{
      success: boolean;
      data: AdminBannerItem[];
    }>("/admin/banners");
    return res.data.data;
  },

  async createBanner(data: {
    title: string;
    subtitle?: string;
    image: string;
    mobileImage?: string;
    link?: string;
    buttonText?: string;
    position?: "home_hero" | "home_secondary" | "promo_strip" | "category_top";
    order?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }) {
    const res = await apiClient.post<{
      success: boolean;
      data: AdminBannerItem;
    }>("/admin/banners", data);
    return res.data.data;
  },

  async updateBanner(id: string, data: Partial<AdminBannerItem>) {
    const res = await apiClient.put<{
      success: boolean;
      data: AdminBannerItem;
    }>(`/admin/banners/${id}`, data);
    return res.data.data;
  },

  async deleteBanner(id: string) {
    const res = await apiClient.delete(`/admin/banners/${id}`);
    return res.data;
  },

  // Gallery
  async getGallery(params?: { category?: string; isActive?: boolean }) {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        items: AdminGalleryItem[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>("/admin/gallery", { params });
    return res.data.data;
  },

  async createGalleryItem(data: {
    title: string;
    description?: string;
    imageUrl: string;
    category?: "installation" | "amc" | "training" | "equipment" | "audit";
    order?: number;
    isActive?: boolean;
  }) {
    const res = await apiClient.post<{
      success: boolean;
      data: AdminGalleryItem;
    }>("/admin/gallery", data);
    return res.data.data;
  },

  async updateGalleryItem(id: string, data: Partial<AdminGalleryItem>) {
    const res = await apiClient.put<{
      success: boolean;
      data: AdminGalleryItem;
    }>(`/admin/gallery/${id}`, data);
    return res.data.data;
  },

  async deleteGalleryItem(id: string) {
    const res = await apiClient.delete(`/admin/gallery/${id}`);
    return res.data;
  },
};

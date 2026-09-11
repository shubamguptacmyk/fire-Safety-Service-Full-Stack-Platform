import { apiClient } from "./apiClient";

export interface BannerItem {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  buttonText?: string;
  position: "home_hero" | "home_middle" | "home_secondary" | "promo_strip" | "category_top" | "services_top" | "deals" | string;
  sortOrder?: number;
  order?: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

export const bannerService = {
  /**
   * Fetch all active banners, optionally filtered by position (e.g. 'home_hero', 'home_middle', etc.)
   */
  async getActiveBanners(position?: string): Promise<BannerItem[]> {
    const params = position ? { position } : {};
    const res = await apiClient.get<{
      success: boolean;
      data: BannerItem[];
    }>("/banners", { params });
    return res.data.data || [];
  },

  /**
   * Fetch a single banner by ID
   */
  async getBannerById(id: string): Promise<BannerItem> {
    const res = await apiClient.get<{
      success: boolean;
      data: BannerItem;
    }>(`/banners/${id}`);
    return res.data.data;
  },
};

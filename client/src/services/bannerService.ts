import { apiClient } from "./apiClient";

export interface BannerItem {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  buttonText?: string;
  position: string;
  sortOrder?: number;
  order?: number;
  isActive: boolean;
}

export const bannerService = {
  async getActiveBanners(position?: string): Promise<BannerItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: BannerItem[] }>("/banners", {
        params: position ? { position } : undefined,
      });
      return res.data.data || [];
    } catch {
      return [];
    }
  },
};

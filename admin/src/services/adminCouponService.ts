import { apiClient } from "./apiClient";

export interface AdminCouponItem {
  _id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  perUserLimit: number;
  isActive: boolean;
  createdAt: string;
}

export const adminCouponService = {
  async getCoupons(params?: { page?: number; limit?: number; isActive?: boolean }) {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        items: AdminCouponItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>("/coupons", { params });
    return res.data.data;
  },

  async getCouponById(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      data: AdminCouponItem;
    }>(`/coupons/${id}`);
    return res.data.data;
  },

  async createCoupon(data: Partial<AdminCouponItem>) {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: AdminCouponItem;
    }>("/coupons", data);
    return res.data.data;
  },

  async updateCoupon(id: string, data: Partial<AdminCouponItem>) {
    const res = await apiClient.put<{
      success: boolean;
      message: string;
      data: AdminCouponItem;
    }>(`/coupons/${id}`, data);
    return res.data.data;
  },

  async deleteCoupon(id: string) {
    const res = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/coupons/${id}`);
    return res.data;
  },
};

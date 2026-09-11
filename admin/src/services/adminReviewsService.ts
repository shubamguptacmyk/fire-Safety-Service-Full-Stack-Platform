import { apiClient } from "./apiClient";

export interface AdminReviewItem {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  product: {
    _id: string;
    name: string;
    slug: string;
    images?: Array<{ url: string }>;
  };
  rating: number;
  title?: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export const adminReviewsService = {
  async getReviews(params: {
    page?: number;
    limit?: number;
    status?: "pending" | "approved" | "rejected";
    productId?: string;
  }) {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        reviews: AdminReviewItem[];
        total: number;
        page: number;
        pages: number;
      };
    }>("/admin/reviews", { params });
    return res.data.data;
  },

  async moderateReview(id: string, status: "approved" | "rejected", rejectionReason?: string) {
    const res = await apiClient.patch<{
      success: boolean;
      data: AdminReviewItem;
    }>(`/admin/reviews/${id}/status`, { status, rejectionReason });
    return res.data.data;
  },

  async deleteReview(id: string) {
    const res = await apiClient.delete(`/admin/reviews/${id}`);
    return res.data;
  },
};

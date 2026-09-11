import { apiClient } from "./apiClient";

export interface ReviewItem {
  _id: string;
  product?: string;
  serviceType?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  helpfulVotes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResponse {
  reviews: ReviewItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

export interface CreateReviewPayload {
  productId?: string;
  serviceType?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export const reviewService = {
  async getProductReviews(
    productId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<ReviewListResponse> {
    const res = await apiClient.get<{ success: boolean; data: ReviewListResponse }>(
      `/reviews/product/${productId}`,
      { params }
    );
    return res.data.data;
  },

  async createReview(payload: CreateReviewPayload): Promise<ReviewItem> {
    const res = await apiClient.post<{ success: boolean; data: ReviewItem }>(
      "/reviews",
      payload
    );
    return res.data.data;
  },

  async updateReview(id: string, payload: Partial<CreateReviewPayload>): Promise<ReviewItem> {
    const res = await apiClient.put<{ success: boolean; data: ReviewItem }>(
      `/reviews/${id}`,
      payload
    );
    return res.data.data;
  },

  async deleteReview(id: string): Promise<void> {
    await apiClient.delete(`/reviews/${id}`);
  },
};

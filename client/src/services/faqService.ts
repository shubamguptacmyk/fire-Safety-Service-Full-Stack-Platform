import { apiClient } from "./apiClient";

export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const faqService = {
  async getPublicFaqs(category?: string): Promise<FaqItem[]> {
    const res = await apiClient.get<{ success: boolean; data: FaqItem[] }>("/faqs", {
      params: category && category !== "All" ? { category } : undefined,
    });
    return res.data.data || [];
  },
};

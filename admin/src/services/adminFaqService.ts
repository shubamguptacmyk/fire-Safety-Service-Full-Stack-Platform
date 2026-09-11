import { apiClient } from "./apiClient";

export interface AdminFAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const adminFaqService = {
  async getFaqs() {
    const res = await apiClient.get<{
      success: boolean;
      data: AdminFAQItem[];
    }>("/admin/faqs");
    return res.data.data;
  },

  async createFaq(data: {
    question: string;
    answer: string;
    category?: string;
    order?: number;
    isActive?: boolean;
  }) {
    const res = await apiClient.post<{
      success: boolean;
      data: AdminFAQItem;
    }>("/admin/faqs", data);
    return res.data.data;
  },

  async updateFaq(id: string, data: Partial<AdminFAQItem>) {
    const res = await apiClient.put<{
      success: boolean;
      data: AdminFAQItem;
    }>(`/admin/faqs/${id}`, data);
    return res.data.data;
  },

  async updateFaqStatus(id: string, isActive: boolean) {
    const res = await apiClient.patch<{
      success: boolean;
      data: AdminFAQItem;
    }>(`/admin/faqs/${id}/status`, { isActive });
    return res.data.data;
  },

  async deleteFaq(id: string) {
    const res = await apiClient.delete(`/admin/faqs/${id}`);
    return res.data;
  },
};

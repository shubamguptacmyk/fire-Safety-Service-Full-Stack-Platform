import { apiClient } from "./apiClient";
import { ApiEnvelope, Category } from "@/types";

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await apiClient.get<ApiEnvelope<Category[]>>("/categories");
    return res.data.data;
  },

  async getBySlug(slug: string): Promise<Category> {
    const res = await apiClient.get<ApiEnvelope<Category>>(`/categories/slug/${slug}`);
    return res.data.data;
  },
};

import { apiClient } from "./apiClient";
import { ApiEnvelope, Product, Category } from "@/types";

export interface AdminProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  inStock?: boolean;
  sort?: string;
}

export const catalogService = {
  // --- Products ---
  async getProducts(params: AdminProductFilters = {}) {
    const res = await apiClient.get<ApiEnvelope<Product[]>>("/products", {
      params: { ...params, includeInactive: true },
    });
    return {
      products: res.data.data,
      meta: res.data.meta,
    };
  },

  async getProductById(id: string): Promise<Product> {
    const res = await apiClient.get<ApiEnvelope<Product>>(`/products/${id}`);
    return res.data.data;
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await apiClient.post<ApiEnvelope<Product>>("/products", data);
    return res.data.data;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await apiClient.put<ApiEnvelope<Product>>(`/products/${id}`, data);
    return res.data.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async updateStock(id: string, stock: number): Promise<Product> {
    const res = await apiClient.patch<ApiEnvelope<Product>>(`/products/${id}/stock`, { stock });
    return res.data.data;
  },

  async getLowStockProducts(): Promise<Product[]> {
    const res = await apiClient.get<ApiEnvelope<Product[]>>("/products/admin/low-stock");
    return res.data.data;
  },

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<ApiEnvelope<Category[]>>("/categories?includeInactive=true");
    return res.data.data;
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await apiClient.post<ApiEnvelope<Category>>("/categories", data);
    return res.data.data;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const res = await apiClient.put<ApiEnvelope<Category>>(`/categories/${id}`, data);
    return res.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },

  // --- Uploads ---
  async uploadImage(file: File): Promise<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<ApiEnvelope<{ url: string; publicId: string }>>(
      "/upload/image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  async uploadDocument(file: File): Promise<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<ApiEnvelope<{ url: string; publicId: string }>>(
      "/upload/document",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },
};

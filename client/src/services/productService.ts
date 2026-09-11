import { apiClient } from "./apiClient";
import { ApiEnvelope, Product, ProductQueryParams, FilterOptions } from "@/types";

export const productService = {
  async getProducts(params: ProductQueryParams = {}): Promise<{
    products: Product[];
    meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
  }> {
    const res = await apiClient.get<ApiEnvelope<Product[]>>("/products", { params });
    return {
      products: res.data.data,
      meta: res.data.meta,
    };
  },

  async getProductBySlug(slug: string): Promise<{
    product: Product;
    relatedProducts: Product[];
  }> {
    const res = await apiClient.get<ApiEnvelope<{ product: Product; relatedProducts: Product[] }>>(
      `/products/slug/${slug}`
    );
    return res.data.data;
  },

  async getFeaturedAndBestSellers(): Promise<{
    featured: Product[];
    bestSellers: Product[];
  }> {
    const res = await apiClient.get<ApiEnvelope<{ featured: Product[]; bestSellers: Product[] }>>(
      "/products/featured-bestsellers"
    );
    return res.data.data;
  },

  async getFilterOptions(): Promise<FilterOptions> {
    const res = await apiClient.get<ApiEnvelope<FilterOptions>>("/products/filters");
    return res.data.data;
  },
};

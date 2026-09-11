import { apiClient } from "./apiClient";

export interface AdminBlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  status: "draft" | "published" | "archived";
  author: {
    name: string;
    role?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  viewsCount: number;
  readTimeMinutes: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const adminBlogService = {
  async getPosts(params: {
    page?: number;
    limit?: number;
    status?: "draft" | "published" | "archived";
    category?: string;
    search?: string;
  }) {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        posts: AdminBlogPost[];
        total: number;
        page: number;
        pages: number;
      };
    }>("/admin/blog", { params });
    return res.data.data;
  },

  async getPostById(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      data: AdminBlogPost;
    }>(`/admin/blog/${id}`);
    return res.data.data;
  },

  async createPost(data: {
    title: string;
    slug?: string;
    excerpt: string;
    content: string;
    category: string;
    tags?: string[];
    featuredImage?: string;
    status?: "draft" | "published";
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string[];
    };
  }) {
    const res = await apiClient.post<{
      success: boolean;
      data: AdminBlogPost;
    }>("/admin/blog", data);
    return res.data.data;
  },

  async updatePost(id: string, data: Partial<AdminBlogPost>) {
    const res = await apiClient.put<{
      success: boolean;
      data: AdminBlogPost;
    }>(`/admin/blog/${id}`, data);
    return res.data.data;
  },

  async publishPost(id: string) {
    const res = await apiClient.patch<{
      success: boolean;
      data: AdminBlogPost;
    }>(`/admin/blog/${id}/publish`);
    return res.data.data;
  },

  async deletePost(id: string) {
    const res = await apiClient.delete(`/admin/blog/${id}`);
    return res.data;
  },
};

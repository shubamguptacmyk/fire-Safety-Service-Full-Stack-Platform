import { apiClient } from "./apiClient";

export interface BlogPostItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: {
    id: string;
    name: string;
    role?: string;
  };
  category: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  readTime: number;
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  items: BlogPostItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const blogService = {
  async getPublishedPosts(params: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
  } = {}): Promise<BlogListResponse> {
    const res = await apiClient.get<{ success: boolean; data: BlogListResponse }>(
      "/blog",
      { params }
    );
    return res.data.data;
  },

  async getPostBySlug(slug: string): Promise<BlogPostItem> {
    const res = await apiClient.get<{ success: boolean; data: BlogPostItem }>(
      `/blog/slug/${slug}`
    );
    return res.data.data;
  },
};

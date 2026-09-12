import { z } from "zod";

export const createBlogPostSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    slug: z.string().min(3).optional(),
    excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(500),
    content: z.string().min(20, "Content must be at least 20 characters"),
    featuredImage: z.string().optional(),
    image: z.string().optional(),
    coverImage: z.string().optional(),
    category: z.string().min(2, "Category is required"),
    tags: z.array(z.string()).default([]),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seo: z
      .object({
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      })
      .optional(),
    readTime: z.coerce.number().int().min(1).default(5),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
  })
  .refine((data) => Boolean(data.featuredImage || data.image || data.coverImage), {
    message: "Featured image URL is required",
    path: ["featuredImage"],
  });

export const updateBlogPostSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z.string().min(3).optional(),
  excerpt: z.string().min(10).max(500).optional(),
  content: z.string().min(20).optional(),
  featuredImage: z.string().optional(),
  image: z.string().optional(),
  coverImage: z.string().optional(),
  category: z.string().min(2).optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  readTime: z.coerce.number().int().min(1).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const blogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;

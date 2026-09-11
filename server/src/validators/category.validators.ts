import { z } from "zod";

const subcategorySchema = z.object({
  name: z.string().min(2, "Subcategory name must be at least 2 characters"),
  slug: z.string().min(2, "Subcategory slug must be at least 2 characters"),
  description: z.string().optional(),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name must be at least 2 characters"),
    slug: z.string().min(2).optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    subcategories: z.array(subcategorySchema).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    subcategories: z.array(subcategorySchema).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
  }),
});

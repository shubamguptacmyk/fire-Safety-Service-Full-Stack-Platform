import { z } from "zod";

export const createGallerySchema = z.object({
  title: z.string().min(2, "Gallery item title is required"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL is required"),
  category: z.enum(["installation", "equipment", "industrial", "service", "team"]).default("installation"),
  tags: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateGallerySchema = createGallerySchema.partial();

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;

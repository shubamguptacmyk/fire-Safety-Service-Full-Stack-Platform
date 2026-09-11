import { z } from "zod";

export const createBannerSchema = z.object({
  title: z.string().min(2, "Banner title is required"),
  subtitle: z.string().optional(),
  image: z.string().min(1, "Banner image URL is required"),
  mobileImage: z.string().optional(),
  link: z.string().optional(),
  buttonText: z.string().default("Explore Now"),
  position: z.enum(["home_hero", "home_middle", "home_secondary", "promo_strip", "category_top", "services_top", "deals"]).default("home_hero"),
  sortOrder: z.number().int().optional().default(0),
  order: z.number().int().optional(),
  isActive: z.boolean().default(true),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
});

export const updateBannerSchema = createBannerSchema.partial();

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;

import { z } from "zod";

export const createBannerSchema = z.object({
  title: z.string().min(2, "Banner title is required"),
  subtitle: z.string().optional(),
  image: z.string().min(1, "Banner image URL is required"),
  link: z.string().optional(),
  buttonText: z.string().default("Explore Now"),
  position: z.enum(["home_hero", "home_middle", "services_top", "deals"]).default("home_hero"),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateBannerSchema = createBannerSchema.partial();

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;

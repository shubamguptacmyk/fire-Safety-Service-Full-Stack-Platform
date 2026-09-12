import { z } from "zod";

export const createBannerSchema = z.object({
  title: z.string().min(2, "Banner title is required"),
  subtitle: z.string().optional().nullable(),
  image: z.string().min(1, "Banner image URL is required"),
  mobileImage: z.string().optional().nullable(),
  link: z.string().optional().nullable(),
  buttonText: z.string().default("Explore Now").optional(),
  position: z
    .enum([
      "home_hero",
      "home_secondary",
      "home_middle",
      "promo_strip",
      "category_top",
      "services_top",
      "deals",
    ])
    .default("home_hero"),
  sortOrder: z.coerce.number().int().optional(),
  order: z.coerce.number().int().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateBannerSchema = createBannerSchema.partial();

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;

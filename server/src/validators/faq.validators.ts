import { z } from "zod";

export const createFAQSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(5, "Answer must be at least 5 characters"),
  category: z.string().min(2).default("General"),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateFAQSchema = createFAQSchema.partial();

export const updateFAQStatusSchema = z.object({
  isActive: z.boolean(),
});

export type CreateFAQInput = z.infer<typeof createFAQSchema>;
export type UpdateFAQInput = z.infer<typeof updateFAQSchema>;

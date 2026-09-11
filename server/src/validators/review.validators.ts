import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().optional(),
  serviceType: z.string().optional(),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  title: z.string().min(2, "Review title is required").max(120),
  comment: z.string().min(5, "Review comment must be at least 5 characters").max(2000),
  images: z.array(z.string().url()).optional(),
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  rejectionReason: z.string().optional(),
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewStatusInput = z.infer<typeof updateReviewStatusSchema>;

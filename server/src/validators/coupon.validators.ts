import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(3, "Coupon code must be at least 3 characters").max(20),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive("Discount value must be positive"),
  minimumOrderValue: z.number().min(0).default(0),
  maxDiscountAmount: z.number().positive().optional(),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().min(4, "End date is required"),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().default(1),
  applicableCategories: z.array(z.string()).optional(),
  applicableProducts: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  orderAmount: z.number().min(0, "Order amount must be non-negative"),
  itemProductIds: z.array(z.string()).optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

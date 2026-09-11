import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  method: z.enum(["mock", "cod", "razorpay"]).default("mock"),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentId: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

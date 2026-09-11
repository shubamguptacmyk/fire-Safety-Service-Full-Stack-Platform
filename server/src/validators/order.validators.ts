import { z } from "zod";

const addressSchema = z.object({
  line1: z.string().min(2, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be a 6-digit Indian PIN code"),
});

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2, "Customer name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().min(10, "Valid 10-digit phone number required"),
    companyName: z.string().optional(),
    gstNumber: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .optional(),
  couponCode: z.string().trim().optional(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  deliveryMethod: z.enum(["standard", "express", "pickup"]).default("standard"),
  paymentMethod: z.enum(["mock", "cod", "razorpay"]).default("mock"),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "Pending",
    "Confirmed",
    "Processing",
    "Packed",
    "Dispatched",
    "Delivered",
    "Cancelled",
    "Refunded",
  ]),
  note: z.string().optional(),
  deliveryDetails: z
    .object({
      carrier: z.string().optional(),
      lrNumber: z.string().optional(),
      estimatedDelivery: z.string().optional(),
    })
    .optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(3, "Cancellation reason must be provided"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
});

export const syncCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
    })
  ),
});

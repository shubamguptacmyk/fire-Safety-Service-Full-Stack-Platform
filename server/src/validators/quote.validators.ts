import { z } from "zod";

export const createQuoteSchema = z.object({
  name: z.string().min(2, "Contact person name is required"),
  companyName: z.string().min(2, "Company or establishment name is required"),
  phone: z.string().min(10, "Valid 10-digit phone number is required"),
  email: z.string().email("Valid corporate email is required"),
  gstNumber: z.string().optional(),
  address: z
    .object({
      line1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        name: z.string().min(2, "Product or service description required"),
        SKU: z.string().optional(),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
        specifications: z.string().optional(),
      })
    )
    .min(1, "Please specify at least one product or requirement item"),
  requirements: z.string().min(5, "Please describe requirements, premises type, or audit needs"),
  preferredDate: z.string().optional(),
});

export const updateQuoteStatusSchema = z.object({
  status: z.enum(["submitted", "under_review", "proposal_sent", "approved", "rejected", "converted"]),
  adminNotes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        name: z.string(),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
        gstPercent: z.number().default(18),
        total: z.number().min(0),
        specifications: z.string().optional(),
      })
    )
    .optional(),
  pricing: z
    .object({
      subtotal: z.number().min(0),
      gst: z.number().min(0),
      grandTotal: z.number().min(0),
    })
    .optional(),
  validUntil: z.string().optional(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;

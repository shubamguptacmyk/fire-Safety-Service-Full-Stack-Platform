import { z } from "zod";

const specificationSchema = z.object({
  key: z.string().min(1, "Specification key is required"),
  value: z.string().min(1, "Specification value is required"),
});

const productImageSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  publicId: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Product name must be at least 2 characters"),
    slug: z.string().min(2).optional(),
    SKU: z.string().min(2, "SKU must be at least 2 characters"),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Valid category ID required"),
    subcategory: z.string().optional(),
    brand: z.string().min(1, "Brand is required"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    shortDescription: z.string().optional(),
    price: z.number().min(0, "Price must be greater than or equal to 0"),
    discountPrice: z.number().min(0).optional(),
    stock: z.number().int().min(0, "Stock cannot be negative").default(0),
    lowStockThreshold: z.number().int().min(0).optional().default(5),
    minimumOrderQuantity: z.number().int().min(1).optional().default(1),
    unit: z.string().optional().default("piece"),
    capacity: z.string().optional(),
    weight: z.string().optional(),
    fireClass: z.array(z.string()).optional().default([]),
    modelNumber: z.string().optional(),
    specifications: z.array(specificationSchema).optional().default([]),
    features: z.array(z.string()).optional().default([]),
    certifications: z.array(z.string()).optional().default([]),
    images: z.array(productImageSchema).optional().default([]),
    datasheet: z.string().optional(),
    isFeatured: z.boolean().optional().default(false),
    isBestSeller: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
});

export const updateStockSchema = z.object({
  body: z.object({
    stock: z.number().int().min(0, "Stock cannot be negative"),
    adjustmentReason: z.string().optional(),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
    search: z.string().optional(),
    category: z.string().optional(), // category slug or ID
    subcategory: z.string().optional(),
    brand: z.string().optional(),
    fireClass: z.string().optional(), // comma-separated or single string
    capacity: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    inStock: z.enum(["true", "false"]).optional(),
    isFeatured: z.enum(["true", "false"]).optional(),
    isBestSeller: z.enum(["true", "false"]).optional(),
    sort: z.enum(["price_asc", "price_desc", "newest", "featured", "bestseller", "name_asc"]).default("newest"),
  }),
});

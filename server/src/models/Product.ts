import { Schema, model, Document, Types } from "mongoose";

export interface IProductSpecification {
  key: string;
  value: string;
}

export interface IProductImage {
  url: string;
  publicId?: string;
  isPrimary?: boolean;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  SKU: string;
  category: Types.ObjectId;
  subcategory?: string;
  brand: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  lowStockThreshold: number;
  minimumOrderQuantity: number;
  unit: string;
  capacity?: string;
  weight?: string;
  fireClass: string[];
  modelNumber?: string;
  specifications: IProductSpecification[];
  features: string[];
  certifications: string[];
  images: IProductImage[];
  datasheet?: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSpecificationSchema = new Schema<IProductSpecification>(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    SKU: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    subcategory: { type: String, trim: true },
    brand: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, trim: true },
    price: { type: Number, required: true, min: 0, index: true },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0, index: true },
    lowStockThreshold: { type: Number, default: 5 },
    minimumOrderQuantity: { type: Number, default: 1, min: 1 },
    unit: { type: String, default: "piece", trim: true },
    capacity: { type: String, trim: true },
    weight: { type: String, trim: true },
    fireClass: [{ type: String, trim: true }],
    modelNumber: { type: String, trim: true },
    specifications: [productSpecificationSchema],
    features: [{ type: String, trim: true }],
    certifications: [{ type: String, trim: true }],
    images: [productImageSchema],
    datasheet: { type: String, trim: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Indexes for high performance querying, sorting, and filtering
productSchema.index({ category: 1, isActive: 1, price: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ fireClass: 1 });
productSchema.index({ stock: 1, lowStockThreshold: 1 });

// Full-text search index across name, brand, SKU, and description
productSchema.index(
  {
    name: "text",
    brand: "text",
    SKU: "text",
    description: "text",
    shortDescription: "text",
  },
  {
    weights: {
      name: 10,
      SKU: 8,
      brand: 5,
      shortDescription: 2,
      description: 1,
    },
    name: "ProductTextIndex",
  }
);

export const Product = model<IProduct>("Product", productSchema);

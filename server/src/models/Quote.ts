import { Schema, model, Document, Types } from "mongoose";

export type QuoteStatus =
  | "submitted"
  | "under_review"
  | "proposal_sent"
  | "approved"
  | "rejected"
  | "converted"
  | "cancelled";

export interface IQuoteItem {
  product?: Types.ObjectId;
  name: string;
  SKU?: string;
  quantity: number;
  unitPrice: number;
  gstPercent: number;
  total: number;
  specifications?: string;
}

export interface IQuote extends Document {
  _id: Types.ObjectId;
  quoteNumber: string;
  user?: Types.ObjectId;
  customer: {
    name: string;
    companyName: string;
    phone: string;
    email: string;
    gstNumber?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  items: IQuoteItem[];
  pricing: {
    subtotal: number;
    gst: number;
    grandTotal: number;
  };
  requirements: string;
  preferredDate?: Date;
  validUntil: Date;
  terms: string[];
  status: QuoteStatus;
  convertedOrderId?: Types.ObjectId;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const quoteItemSchema = new Schema<IQuoteItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    SKU: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, default: 0, min: 0 },
    gstPercent: { type: Number, default: 18 },
    total: { type: Number, default: 0, min: 0 },
    specifications: { type: String },
  },
  { _id: false }
);

const quoteSchema = new Schema<IQuote>(
  {
    quoteNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      companyName: { type: String, required: true, trim: true, index: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      gstNumber: { type: String, trim: true },
      address: {
        line1: { type: String },
        line2: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
      },
    },
    items: { type: [quoteItemSchema], required: true },
    pricing: {
      subtotal: { type: Number, default: 0, min: 0 },
      gst: { type: Number, default: 0, min: 0 },
      grandTotal: { type: Number, default: 0, min: 0 },
    },
    requirements: { type: String, required: true },
    preferredDate: { type: Date },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity default
    },
    terms: [
      {
        type: String,
        default: [
          "Rates quoted are valid for 30 days from proposal date.",
          "Standard 18% GST applicable unless specified.",
          "Payment terms: 50% advance along with Purchase Order, 50% upon delivery/testing.",
          "Standard warranty: 1-5 years depending on product class and manufacturer terms.",
        ],
      },
    ],
    status: {
      type: String,
      enum: ["submitted", "under_review", "proposal_sent", "approved", "rejected", "converted", "cancelled"],
      default: "submitted",
      index: true,
    },
    convertedOrderId: { type: Schema.Types.ObjectId, ref: "Order" },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

quoteSchema.index({ createdAt: -1 });

export const Quote = model<IQuote>("Quote", quoteSchema);

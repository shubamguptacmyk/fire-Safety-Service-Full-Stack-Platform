import { Schema, model, Document, Types } from "mongoose";

export type CouponDiscountType = "percentage" | "fixed";

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minimumOrderValue: number;
  maxDiscountAmount?: number;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usageCount: number;
  perUserLimit: number;
  usedBy: Array<{
    userId: Types.ObjectId;
    orderId: Types.ObjectId;
    usedAt: Date;
    discountApplied: number;
  }>;
  applicableCategories?: Types.ObjectId[];
  applicableProducts?: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        orderId: { type: Schema.Types.ObjectId, ref: "Order" },
        usedAt: { type: Date, default: Date.now },
        discountApplied: { type: Number, required: true },
      },
    ],
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ code: 1, isActive: 1, endDate: 1 });

export const Coupon = model<ICoupon>("Coupon", couponSchema);

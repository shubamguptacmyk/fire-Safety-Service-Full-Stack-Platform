import { Schema, model, Document, Types } from "mongoose";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface IReview extends Document {
  _id: Types.ObjectId;
  product?: Types.ObjectId;
  serviceType?: string;
  userId: Types.ObjectId;
  userName: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  moderatedBy?: Types.ObjectId;
  moderatedAt?: Date;
  rejectionReason?: string;
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      index: true,
    },
    serviceType: {
      type: String,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    moderatedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ product: 1, status: 1, createdAt: -1 });

export const Review = model<IReview>("Review", reviewSchema);

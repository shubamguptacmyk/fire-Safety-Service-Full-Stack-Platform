import { Schema, model, Document, Types } from "mongoose";

export interface IBanner extends Document {
  _id: Types.ObjectId;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText?: string;
  position: "home_hero" | "home_middle" | "services_top" | "deals";
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      trim: true,
      default: "Explore Now",
    },
    position: {
      type: String,
      enum: ["home_hero", "home_middle", "services_top", "deals"],
      default: "home_hero",
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
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

bannerSchema.index({ position: 1, sortOrder: 1, isActive: 1 });

export const Banner = model<IBanner>("Banner", bannerSchema);

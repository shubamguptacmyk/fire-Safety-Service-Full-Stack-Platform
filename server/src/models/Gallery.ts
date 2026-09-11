import { Schema, model, Document, Types } from "mongoose";

export interface IGalleryItem extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  imageUrl: string;
  category: "installation" | "equipment" | "industrial" | "service" | "team";
  tags: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGalleryItem>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["installation", "equipment", "industrial", "service", "team"],
      default: "installation",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
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

gallerySchema.index({ category: 1, sortOrder: 1, isActive: 1 });

export const Gallery = model<IGalleryItem>("Gallery", gallerySchema);

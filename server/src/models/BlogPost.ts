import { Schema, model, Document, Types } from "mongoose";

export type BlogStatus = "draft" | "published" | "archived";

export interface IBlogPost extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: {
    id: Types.ObjectId;
    name: string;
    role?: string;
  };
  category: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  readTime: number;
  status: BlogStatus;
  publishedAt?: Date;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    featuredImage: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      id: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true, trim: true },
      role: { type: String, trim: true, default: "Fire Safety Specialist" },
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      keywords: { type: [String], default: [] },
    },
    readTime: {
      type: Number,
      default: 5,
      min: 1,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ title: "text", content: "text", tags: "text" });

export const BlogPost = model<IBlogPost>("BlogPost", blogPostSchema);

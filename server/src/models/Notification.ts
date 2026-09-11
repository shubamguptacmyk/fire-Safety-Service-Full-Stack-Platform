import { Schema, model, Document, Types } from "mongoose";

export type NotificationType =
  | "ORDER_CREATED"
  | "ORDER_CONFIRMED"
  | "ORDER_DISPATCHED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "QUOTE_CREATED"
  | "QUOTE_APPROVED"
  | "QUOTE_REJECTED"
  | "AMC_EXPIRING"
  | "AMC_EXPIRED"
  | "INSPECTION_DUE"
  | "REFILL_DUE"
  | "SERVICE_BOOKED"
  | "SERVICE_ASSIGNED"
  | "SERVICE_COMPLETED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "order"
  | "quote"
  | "service"
  | "equipment"
  | "amc"
  | "general";

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "ORDER_CREATED",
        "ORDER_CONFIRMED",
        "ORDER_DISPATCHED",
        "ORDER_DELIVERED",
        "ORDER_CANCELLED",
        "QUOTE_CREATED",
        "QUOTE_APPROVED",
        "QUOTE_REJECTED",
        "AMC_EXPIRING",
        "AMC_EXPIRED",
        "INSPECTION_DUE",
        "REFILL_DUE",
        "SERVICE_BOOKED",
        "SERVICE_ASSIGNED",
        "SERVICE_COMPLETED",
        "PAYMENT_SUCCESS",
        "PAYMENT_FAILED",
        "order",
        "quote",
        "service",
        "equipment",
        "amc",
        "general",
      ],
      default: "general",
      index: true,
    },
    link: {
      type: String,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = model<INotification>("Notification", notificationSchema);

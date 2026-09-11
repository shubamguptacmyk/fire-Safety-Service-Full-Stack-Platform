import { Schema, model, Document, Types } from "mongoose";

export type ReminderType =
  | "Refill_Reminder"
  | "Inspection_Reminder"
  | "AMC_Expiry_Reminder"
  | "Service_Update"
  | "Order_Update";

export type DeliveryChannel = "in-app" | "email" | "sms" | "whatsapp";

export interface INotificationLog extends Document {
  _id: Types.ObjectId;
  recipient: string;
  recipientType: "User" | "Email" | "Phone";
  type: ReminderType;
  entityId: string;
  intervalDays: number;
  channel: DeliveryChannel;
  status: "sent" | "logged_mock" | "failed";
  message: string;
  sentAt: Date;
}

const notificationLogSchema = new Schema<INotificationLog>(
  {
    recipient: {
      type: String,
      required: true,
      index: true,
    },
    recipientType: {
      type: String,
      enum: ["User", "Email", "Phone"],
      default: "User",
    },
    type: {
      type: String,
      enum: [
        "Refill_Reminder",
        "Inspection_Reminder",
        "AMC_Expiry_Reminder",
        "Service_Update",
        "Order_Update",
      ],
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    intervalDays: {
      type: Number,
      required: true,
    },
    channel: {
      type: String,
      enum: ["in-app", "email", "sms", "whatsapp"],
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "logged_mock", "failed"],
      default: "sent",
    },
    message: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly detect if this reminder was already sent for this interval
notificationLogSchema.index({ entityId: 1, type: 1, intervalDays: 1, channel: 1 }, { unique: true });

export const NotificationLog = model<INotificationLog>("NotificationLog", notificationLogSchema);

import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  paymentNumber: string;
  orderId: Types.ObjectId;
  user?: Types.ObjectId;
  amount: number;
  currency: string;
  method: "mock" | "cod" | "razorpay";
  status: "pending" | "success" | "failed" | "refunded";
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  gatewayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    paymentNumber: { type: String, required: true, unique: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    method: {
      type: String,
      enum: ["mock", "cod", "razorpay"],
      required: true,
      default: "mock",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    transactionId: { type: String, index: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    gatewayResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

paymentSchema.index({ createdAt: -1 });

export const Payment = model<IPayment>("Payment", paymentSchema);

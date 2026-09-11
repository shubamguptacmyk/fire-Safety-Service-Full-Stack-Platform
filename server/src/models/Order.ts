import { Schema, model, Document, Types } from "mongoose";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Packed"
  | "Dispatched"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

export type PaymentMethod = "mock" | "cod" | "razorpay";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type DeliveryMethod = "standard" | "express" | "pickup";

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  SKU?: string;
  price: number;
  quantity: number;
  image?: string;
  capacity?: string;
  fireClass?: string[];
  hsnSac?: string;
}

export interface IAddressSnapshot {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IStatusHistory {
  status: OrderStatus;
  changedAt: Date;
  changedBy?: Types.ObjectId;
  note?: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  user?: Types.ObjectId;
  customer: {
    name: string;
    email?: string;
    phone: string;
    companyName?: string;
    gstNumber?: string;
  };
  items: IOrderItem[];
  shippingAddress: IAddressSnapshot;
  billingAddress?: IAddressSnapshot;
  pricing: {
    subtotal: number;
    discount: number;
    couponCode?: string;
    gst: number;
    shippingFee: number;
    grandTotal: number;
  };
  deliveryMethod: DeliveryMethod;
  deliveryDetails?: {
    carrier?: string;
    lrNumber?: string;
    estimatedDelivery?: Date;
    dispatchedAt?: Date;
    deliveredAt?: Date;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: {
    transactionId?: string;
    paidAt?: Date;
    gatewayOrderId?: string;
  };
  status: OrderStatus;
  statusHistory: IStatusHistory[];
  cancellationReason?: string;
  cancelledAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    SKU: { type: String },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
    capacity: { type: String },
    fireClass: [{ type: String }],
    hsnSac: { type: String, default: "84241000" },
  },
  { _id: false }
);

const addressSnapshotSchema = new Schema<IAddressSnapshot>(
  {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const statusHistorySchema = new Schema<IStatusHistory>(
  {
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "Packed", "Dispatched", "Delivered", "Cancelled", "Refunded"],
      required: true,
    },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true, index: true },
      companyName: { type: String, trim: true },
      gstNumber: { type: String, trim: true },
    },
    items: { type: [orderItemSchema], required: true, validate: (v: any[]) => v.length > 0 },
    shippingAddress: { type: addressSnapshotSchema, required: true },
    billingAddress: { type: addressSnapshotSchema },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      couponCode: { type: String, trim: true },
      gst: { type: Number, required: true, min: 0 },
      shippingFee: { type: Number, default: 0, min: 0 },
      grandTotal: { type: Number, required: true, min: 0 },
    },
    deliveryMethod: {
      type: String,
      enum: ["standard", "express", "pickup"],
      default: "standard",
    },
    deliveryDetails: {
      carrier: { type: String, trim: true },
      lrNumber: { type: String, trim: true },
      estimatedDelivery: { type: Date },
      dispatchedAt: { type: Date },
      deliveredAt: { type: Date },
    },
    paymentMethod: {
      type: String,
      enum: ["mock", "cod", "razorpay"],
      required: true,
      default: "mock",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentDetails: {
      transactionId: { type: String },
      paidAt: { type: Date },
      gatewayOrderId: { type: String },
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "Packed", "Dispatched", "Delivered", "Cancelled", "Refunded"],
      default: "Pending",
      index: true,
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ "customer.companyName": 1 });

export const Order = model<IOrder>("Order", orderSchema);

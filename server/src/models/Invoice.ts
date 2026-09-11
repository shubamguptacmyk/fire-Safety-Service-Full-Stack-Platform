import { Schema, model, Document, Types } from "mongoose";

export interface IInvoiceItem {
  name: string;
  hsnSac: string;
  quantity: number;
  unitPrice: number;
  taxableAmount: number;
  taxRate: number; // e.g. 18
  cgstAmount: number; // 9%
  sgstAmount: number; // 9%
  igstAmount: number; // 18% if inter-state
  totalAmount: number;
}

export interface IInvoice extends Document {
  _id: Types.ObjectId;
  invoiceNumber: string;
  orderId: Types.ObjectId;
  quoteId?: Types.ObjectId;
  user?: Types.ObjectId;
  invoiceDate: Date;
  dueDate?: Date;
  company: {
    name: string;
    address: string;
    gstin: string;
    phone: string;
    email: string;
    pan?: string;
    state: string;
    stateCode: string;
  };
  customer: {
    name: string;
    companyName?: string;
    gstin?: string;
    phone: string;
    email?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  items: IInvoiceItem[];
  totals: {
    taxableAmount: number;
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    grandTotal: number;
    roundOff: number;
  };
  paymentStatus: "unpaid" | "paid" | "partially_paid" | "cancelled";
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    name: { type: String, required: true },
    hsnSac: { type: String, default: "84241000" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    taxableAmount: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 18 },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true, index: true },
    quoteId: { type: Schema.Types.ObjectId, ref: "Quote" },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    company: {
      name: { type: String, default: "AK Fire Safety Service" },
      address: { type: String, default: "Plot No. 44, MIDC Industrial Area, Turbhe, Navi Mumbai, Maharashtra 400705" },
      gstin: { type: String, default: "27AABCA1234F1Z8" },
      phone: { type: String, default: "+91 98200 88910" },
      email: { type: String, default: "billing@akfiresafety.example" },
      pan: { type: String, default: "AABCA1234F" },
      state: { type: String, default: "Maharashtra" },
      stateCode: { type: String, default: "27" },
    },
    customer: {
      name: { type: String, required: true },
      companyName: { type: String },
      gstin: { type: String },
      phone: { type: String, required: true },
      email: { type: String },
      address: {
        line1: { type: String, required: true },
        line2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
      },
    },
    items: { type: [invoiceItemSchema], required: true },
    totals: {
      taxableAmount: { type: Number, required: true },
      cgstTotal: { type: Number, default: 0 },
      sgstTotal: { type: Number, default: 0 },
      igstTotal: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
      roundOff: { type: Number, default: 0 },
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "partially_paid", "cancelled"],
      default: "paid",
      index: true,
    },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

invoiceSchema.index({ createdAt: -1 });

export const Invoice = model<IInvoice>("Invoice", invoiceSchema);

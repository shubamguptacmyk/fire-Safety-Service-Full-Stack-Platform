import { Schema, model, Document, Types } from "mongoose";

export interface IAddress extends Document {
  user: Types.ObjectId;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  isBilling: boolean;
}

const addressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, default: "Home" },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    isBilling: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Address = model<IAddress>("Address", addressSchema);

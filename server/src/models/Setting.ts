import { Schema, model, Document, Types } from "mongoose";

export interface ISetting extends Document {
  _id: Types.ObjectId;
  key: string;
  data: Record<string, any>;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Setting = model<ISetting>("Setting", settingSchema);

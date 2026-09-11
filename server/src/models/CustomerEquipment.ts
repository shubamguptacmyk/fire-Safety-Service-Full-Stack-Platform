import { Schema, model, Document, Types } from "mongoose";

export type EquipmentStatus = "Healthy" | "Inspection Due Soon" | "Refill Due Soon" | "Overdue";

export interface ICustomerEquipment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  equipmentId: string;
  name: string;
  product?: Types.ObjectId;
  serialNumber: string;
  equipmentType: string;
  capacity?: string;
  location: string;
  purchaseDate?: Date;
  installationDate: Date;
  lastInspectionDate: Date;
  lastRefillDate: Date;
  nextInspectionDate: Date;
  nextRefillDate: Date;
  hydroTestDueDate?: Date;
  status: EquipmentStatus;
  qrCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  computeStatus(): EquipmentStatus;
}

export function calculateEquipmentStatus(nextRefillDate: Date, nextInspectionDate: Date): EquipmentStatus {
  const now = new Date();
  const refill = new Date(nextRefillDate);
  const inspection = new Date(nextInspectionDate);

  // If either is in the past
  if (refill.getTime() < now.getTime() || inspection.getTime() < now.getTime()) {
    return "Overdue";
  }

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const refillDiff = refill.getTime() - now.getTime();
  const inspectionDiff = inspection.getTime() - now.getTime();

  if (refillDiff <= thirtyDaysMs) {
    return "Refill Due Soon";
  }

  if (inspectionDiff <= thirtyDaysMs) {
    return "Inspection Due Soon";
  }

  return "Healthy";
}

const customerEquipmentSchema = new Schema<ICustomerEquipment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    equipmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    serialNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    equipmentType: {
      type: String,
      required: true,
      trim: true,
      default: "ABC Dry Powder",
    },
    capacity: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    purchaseDate: {
      type: Date,
    },
    installationDate: {
      type: Date,
      required: true,
    },
    lastInspectionDate: {
      type: Date,
      required: true,
    },
    lastRefillDate: {
      type: Date,
      required: true,
    },
    nextInspectionDate: {
      type: Date,
      required: true,
      index: true,
    },
    nextRefillDate: {
      type: Date,
      required: true,
      index: true,
    },
    hydroTestDueDate: {
      type: Date,
      index: true,
    },
    status: {
      type: String,
      enum: ["Healthy", "Inspection Due Soon", "Refill Due Soon", "Overdue"],
      default: "Healthy",
      index: true,
    },
    qrCode: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

customerEquipmentSchema.methods.computeStatus = function (): EquipmentStatus {
  return calculateEquipmentStatus(this.nextRefillDate, this.nextInspectionDate);
};

customerEquipmentSchema.pre<ICustomerEquipment>("save", function (next) {
  if (this.nextRefillDate && this.nextInspectionDate) {
    this.status = calculateEquipmentStatus(this.nextRefillDate, this.nextInspectionDate);
  }
  next();
});

export const CustomerEquipment = model<ICustomerEquipment>("CustomerEquipment", customerEquipmentSchema);

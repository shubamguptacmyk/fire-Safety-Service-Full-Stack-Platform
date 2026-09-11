import { Schema, model, Document, Types } from "mongoose";

export type AMCFormBStatus = "Current" | "Due in 30 Days" | "Overdue" | "Under Review";
export type AMCStatus = "Active" | "Expired" | "Renewed" | "Cancelled" | "Pending Approval";
export type AMCFrequency = "Quarterly" | "Half-Yearly" | "Annual";

export interface IAMCVisit {
  visitNumber: number;
  scheduledDate: Date;
  completedDate?: Date;
  technician?: Types.ObjectId;
  technicianName?: string;
  status: "Pending" | "Completed" | "Missed";
  bookingId?: Types.ObjectId;
  notes?: string;
}

export interface IAMCCoveredEquipment {
  equipmentId?: Types.ObjectId;
  description: string;
  quantity: number;
}

export interface IAMCContract extends Document {
  _id: Types.ObjectId;
  contractNumber: string;
  userId: Types.ObjectId;
  clientName: string;
  companyName?: string;
  phone: string;
  email: string;
  premisesType: string;
  location: string;
  planName: string;
  startDate: Date;
  endDate: Date;
  renewalDate: Date;
  frequency: AMCFrequency;
  visitsPerYear: number;
  visitsCompleted: number;
  visitsScheduled: IAMCVisit[];
  formBStatus: AMCFormBStatus;
  formBCertificateUrl?: string;
  formBNumber?: string;
  assignedTechnician?: Types.ObjectId;
  equipmentCount: number;
  coveredEquipment: IAMCCoveredEquipment[];
  annualValue: number;
  status: AMCStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  computeFormBStatus(): AMCFormBStatus;
}

export function calculateFormBStatus(renewalDate: Date): AMCFormBStatus {
  const now = new Date();
  const renewal = new Date(renewalDate);
  const diffMs = renewal.getTime() - now.getTime();

  if (diffMs < 0) {
    return "Overdue";
  }

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  if (diffMs <= thirtyDaysMs) {
    return "Due in 30 Days";
  }

  return "Current";
}

const amcVisitSchema = new Schema<IAMCVisit>(
  {
    visitNumber: { type: Number, required: true },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    technician: { type: Schema.Types.ObjectId, ref: "Technician" },
    technicianName: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Missed"],
      default: "Pending",
    },
    bookingId: { type: Schema.Types.ObjectId, ref: "ServiceBooking" },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const amcCoveredEquipmentSchema = new Schema<IAMCCoveredEquipment>(
  {
    equipmentId: { type: Schema.Types.ObjectId, ref: "CustomerEquipment" },
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const amcContractSchema = new Schema<IAMCContract>(
  {
    contractNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    premisesType: {
      type: String,
      required: true,
      trim: true,
      default: "Commercial / Warehousing",
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
      default: "Comprehensive AMC (Quarterly)",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    renewalDate: {
      type: Date,
      required: true,
      index: true,
    },
    frequency: {
      type: String,
      enum: ["Quarterly", "Half-Yearly", "Annual"],
      default: "Quarterly",
    },
    visitsPerYear: {
      type: Number,
      default: 4,
      min: 1,
    },
    visitsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    visitsScheduled: [amcVisitSchema],
    formBStatus: {
      type: String,
      enum: ["Current", "Due in 30 Days", "Overdue", "Under Review"],
      default: "Current",
      index: true,
    },
    formBCertificateUrl: {
      type: String,
      trim: true,
    },
    formBNumber: {
      type: String,
      trim: true,
    },
    assignedTechnician: {
      type: Schema.Types.ObjectId,
      ref: "Technician",
    },
    equipmentCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    coveredEquipment: [amcCoveredEquipmentSchema],
    annualValue: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Expired", "Renewed", "Cancelled", "Pending Approval"],
      default: "Active",
      index: true,
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

amcContractSchema.methods.computeFormBStatus = function (): AMCFormBStatus {
  return calculateFormBStatus(this.renewalDate);
};

amcContractSchema.pre<IAMCContract>("save", function (next) {
  if (this.renewalDate) {
    this.formBStatus = calculateFormBStatus(this.renewalDate);
  }
  next();
});

export const AMCContract = model<IAMCContract>("AMCContract", amcContractSchema);

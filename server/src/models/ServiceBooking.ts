import { Schema, model, Document, Types } from "mongoose";

export type ServiceType =
  | "Cylinder Refilling"
  | "Fire Safety Audit"
  | "Fire Audit"
  | "Installation"
  | "Inspection"
  | "Quarterly AMC Inspection"
  | "AMC Visit"
  | "Maintenance"
  | "Emergency Maintenance"
  | "Emergency Service"
  | "Hydrant Repair";

export type ServiceBookingStatus =
  | "Requested"
  | "Confirmed"
  | "Assigned"
  | "Technician On The Way"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Rejected";

export interface IEquipmentInspectionItem {
  equipmentId?: Types.ObjectId;
  serialNumber?: string;
  type: string;
  capacity?: string;
  pressureBar?: number;
  result: "Pass" | "Fail" | "Repaired" | "Condemned";
}

export interface IServiceReport {
  jobCardNumber?: string;
  summary?: string;
  remarks?: string;
  pressureTestPassed?: boolean;
  formBRef?: string;
  partsReplaced?: string[];
  completedAt?: Date;
  customerSignature?: string;
}

export interface IServicePhoto {
  url: string;
  caption?: string;
  phase: "before" | "after" | "testing";
}

export interface IServiceBookingStatusHistory {
  status: ServiceBookingStatus;
  changedAt: Date;
  changedBy?: Types.ObjectId;
  notes?: string;
}

export interface IServiceBooking extends Document {
  _id: Types.ObjectId;
  bookingId: string;
  userId?: Types.ObjectId;
  customerName: string;
  companyName?: string;
  phone: string;
  email: string;
  serviceType: ServiceType;
  serviceAddress: {
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  preferredDate: Date;
  preferredTime: string;
  equipmentDetails?: string;
  problemDescription?: string;
  status: ServiceBookingStatus;
  assignedTechnician?: Types.ObjectId;
  assignedTechnicianName?: string;
  assignedTechnicianPhone?: string;
  amcContract?: Types.ObjectId;
  equipmentList: IEquipmentInspectionItem[];
  serviceReport?: IServiceReport;
  photographs: IServicePhoto[];
  cost?: {
    serviceFee: number;
    partsFee: number;
    tax: number;
    total: number;
    paymentStatus: "Pending" | "Paid" | "Covered by AMC";
  };
  statusHistory: IServiceBookingStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const serviceBookingSchema = new Schema<IServiceBooking>(
  {
    bookingId: {
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
      index: true,
    },
    customerName: {
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
    serviceType: {
      type: String,
      enum: [
        "Cylinder Refilling",
        "Fire Safety Audit",
        "Fire Audit",
        "Installation",
        "Inspection",
        "Quarterly AMC Inspection",
        "AMC Visit",
        "Maintenance",
        "Emergency Maintenance",
        "Emergency Service",
        "Hydrant Repair",
      ],
      required: true,
      index: true,
    },
    serviceAddress: {
      street: { type: String, required: true, trim: true },
      landmark: { type: String, trim: true },
      city: { type: String, required: true, trim: true, default: "Navi Mumbai" },
      state: { type: String, required: true, trim: true, default: "Maharashtra" },
      pincode: { type: String, required: true, trim: true },
    },
    preferredDate: {
      type: Date,
      required: true,
      index: true,
    },
    preferredTime: {
      type: String,
      default: "Morning (10:00 AM - 1:00 PM)",
    },
    equipmentDetails: {
      type: String,
      trim: true,
    },
    problemDescription: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "Requested",
        "Confirmed",
        "Assigned",
        "Technician On The Way",
        "In Progress",
        "Completed",
        "Cancelled",
        "Rejected",
      ],
      default: "Requested",
      index: true,
    },
    assignedTechnician: {
      type: Schema.Types.ObjectId,
      ref: "Technician",
    },
    assignedTechnicianName: {
      type: String,
      trim: true,
    },
    assignedTechnicianPhone: {
      type: String,
      trim: true,
    },
    amcContract: {
      type: Schema.Types.ObjectId,
      ref: "AMCContract",
    },
    equipmentList: [
      {
        equipmentId: { type: Schema.Types.ObjectId, ref: "CustomerEquipment" },
        serialNumber: { type: String, trim: true },
        type: { type: String, required: true },
        capacity: { type: String },
        pressureBar: { type: Number },
        result: {
          type: String,
          enum: ["Pass", "Fail", "Repaired", "Condemned"],
          default: "Pass",
        },
      },
    ],
    serviceReport: {
      jobCardNumber: { type: String, trim: true },
      summary: { type: String, trim: true },
      remarks: { type: String, trim: true },
      pressureTestPassed: { type: Boolean },
      formBRef: { type: String, trim: true },
      partsReplaced: [String],
      completedAt: { type: Date },
      customerSignature: { type: String },
    },
    photographs: [
      {
        url: { type: String, required: true },
        caption: { type: String, trim: true },
        phase: {
          type: String,
          enum: ["before", "after", "testing"],
          default: "after",
        },
      },
    ],
    cost: {
      serviceFee: { type: Number, default: 0 },
      partsFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Covered by AMC"],
        default: "Pending",
      },
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
        notes: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const ServiceBooking = model<IServiceBooking>("ServiceBooking", serviceBookingSchema);

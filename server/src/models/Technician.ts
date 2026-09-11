import { Schema, model, Document, Types } from "mongoose";

export type TechnicianStatus = "active" | "on-leave" | "busy" | "inactive";

export interface ITechnician extends Document {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  employeeId: string;
  skills: string[];
  serviceArea: string;
  status: TechnicianStatus;
  licenseNumber?: string;
  rating: number;
  activeJobsCount: number;
  completedJobsCount: number;
  profilePhoto?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const technicianSchema = new Schema<ITechnician>(
  {
    name: {
      type: String,
      required: true,
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
      lowercase: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    skills: {
      type: [String],
      default: ["Extinguisher Refilling", "Hydro-Testing", "Hydrant Maintenance"],
    },
    serviceArea: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "on-leave", "busy", "inactive"],
      default: "active",
      index: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    activeJobsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedJobsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    profilePhoto: {
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

export const Technician = model<ITechnician>("Technician", technicianSchema);

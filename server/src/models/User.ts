import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { Role } from "../utils/permissions";

export type CustomerType = "b2c" | "b2b" | "corporate";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  phone: string;
  passwordHash?: string;
  role: Role;
  customerType: CustomerType;
  companyName?: string;
  gstNumber?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  emailVerificationSentAt?: Date;
  mustChangePassword?: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  tokenVersion: number; // bumped on password change / logout-all to invalidate old refresh tokens
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    passwordHash: { type: String, select: false },
    role: {
      type: String,
      enum: ["super_admin", "admin", "sales", "technician", "accountant", "customer"],
      default: "customer",
      index: true,
    },
    customerType: { type: String, enum: ["b2c", "b2b", "corporate"], default: "b2c" },
    companyName: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    emailVerificationSentAt: { type: Date, select: false },
    mustChangePassword: { type: Boolean, default: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    tags: [{ type: String }],
    notes: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = model<IUser>("User", userSchema);

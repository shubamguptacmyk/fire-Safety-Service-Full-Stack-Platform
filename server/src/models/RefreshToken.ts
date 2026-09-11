import { Schema, model, Document, Types } from "mongoose";

// Stored so refresh tokens can be revoked individually (logout) or in bulk
// (logout-all-devices, forced password reset) rather than trusting JWT expiry alone.
export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  userAgent?: string;
  ip?: string;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
    userAgent: String,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>("RefreshToken", refreshTokenSchema);

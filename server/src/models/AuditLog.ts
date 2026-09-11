import { Schema, model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  user?: Types.ObjectId;
  userId?: Types.ObjectId;
  action: string;
  module?: string;
  resource?: string;
  resourceId?: string;
  details?: unknown;
  entity?: string;
  entityId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  ip?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    module: { type: String, default: "general", index: true },
    resource: { type: String },
    resourceId: { type: String },
    details: { type: Schema.Types.Mixed },
    entity: { type: String, default: "general" },
    entityId: { type: String },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.pre("save", function (next) {
  if (!this.user && this.userId) {
    this.user = this.userId;
  }
  if (!this.module && this.resource) {
    this.module = this.resource;
  }
  if (!this.entity && this.resource) {
    this.entity = this.resource;
  }
  if (!this.entityId && this.resourceId) {
    this.entityId = this.resourceId;
  }
  if (!this.newValue && this.details) {
    this.newValue = this.details;
  }
  next();
});

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);

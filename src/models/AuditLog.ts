import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  adminUserId?: mongoose.Types.ObjectId;
  adminEmail?: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    adminUserId: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    adminEmail: {
      type: String,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resource: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

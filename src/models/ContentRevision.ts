import mongoose, { Schema, Document } from 'mongoose';
import { AuditAction } from '@today-digitech/shared';

export interface IContentRevision extends Document {
  entityType: string;
  entityId: string;
  versionNumber: number;
  snapshot: Record<string, any>;
  createdBy: string;
  changeSummary?: string;
  actionType: AuditAction;
  createdAt: Date;
  updatedAt: Date;
}

const contentRevisionSchema = new Schema<IContentRevision>(
  {
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    versionNumber: { type: Number, required: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    createdBy: { type: String, required: true },
    changeSummary: String,
    actionType: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'PUBLISH', 'UNPUBLISH', 'SCHEDULE', 'ARCHIVE', 'RESTORE', 'DELETE', 'ROLLBACK', 'LOGIN', 'LOGOUT'],
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

contentRevisionSchema.index({ entityType: 1, entityId: 1, versionNumber: -1 });

export const ContentRevision = mongoose.model<IContentRevision>('ContentRevision', contentRevisionSchema);

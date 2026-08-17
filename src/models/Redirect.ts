import mongoose, { Schema, Document } from 'mongoose';

export interface IRedirect extends Document {
  sourcePath: string;
  destinationPath: string;
  redirectType: number;
  hitCount: number;
  status: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const redirectSchema = new Schema<IRedirect>(
  {
    sourcePath: { type: String, required: true, unique: true, index: true },
    destinationPath: { type: String, required: true },
    redirectType: { type: Number, enum: [301, 302], default: 301 },
    hitCount: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Published', 'Scheduled', 'Archived'], default: 'Published', index: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Redirect = mongoose.model<IRedirect>('Redirect', redirectSchema);

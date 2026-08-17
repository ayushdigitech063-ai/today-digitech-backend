import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus } from '@today-digitech/shared';

export interface IClientLogo extends Document {
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  status: ContentStatus;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const clientLogoSchema = new Schema<IClientLogo>(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
    websiteUrl: String,
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Scheduled', 'Archived'],
      default: 'Published',
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ClientLogo = mongoose.model<IClientLogo>('ClientLogo', clientLogoSchema);

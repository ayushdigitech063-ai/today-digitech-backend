import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus } from '@today-digitech/shared';

export interface IService extends Document {
  title: string;
  slug: string;
  category?: string;
  categoryId?: mongoose.Types.ObjectId;
  summary?: string;
  description?: string;
  features: string[];
  techStack: string[];
  iconUrl?: string;
  bannerUrl?: string;
  status: ContentStatus;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  metaTitle?: string;
  metaDescription?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, default: 'General' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'ServiceCategory' },
    summary: { type: String },
    description: { type: String },
    features: [String],
    techStack: [String],
    iconUrl: String,
    bannerUrl: String,
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Scheduled', 'Archived'],
      default: 'Draft',
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    metaTitle: String,
    metaDescription: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
);

export const Service = mongoose.model<IService>('Service', serviceSchema);

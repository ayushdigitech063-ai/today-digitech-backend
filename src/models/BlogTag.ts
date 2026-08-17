import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus } from '@today-digitech/shared';

export interface IBlogTag extends Document {
  name: string;
  slug: string;
  status: ContentStatus;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogTagSchema = new Schema<IBlogTag>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ['Draft', 'Published', 'Scheduled', 'Archived'], default: 'Published', index: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const BlogTag = mongoose.model<IBlogTag>('BlogTag', blogTagSchema);

import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus } from '@today-digitech/shared';

export interface IPortfolio extends Document {
  title: string;
  slug: string;
  clientName: string;
  category: string;
  coverImageUrl: string;
  gallery: string[];
  techStack: string[];
  projectUrl?: string;
  completionDate?: string;
  summary: string;
  description: string;
  status: ContentStatus;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioSchema = new Schema<IPortfolio>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    clientName: { type: String, required: true },
    category: { type: String, required: true },
    coverImageUrl: { type: String, required: true },
    gallery: [String],
    techStack: [String],
    projectUrl: String,
    completionDate: String,
    summary: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Scheduled', 'Archived'],
      default: 'Published',
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', portfolioSchema);

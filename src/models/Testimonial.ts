import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus } from '@today-digitech/shared';

export interface ITestimonial extends Document {
  clientName: string;
  clientTitle: string;
  designation?: string;
  companyName: string;
  quote: string;
  rating: number;
  avatarUrl?: string;
  logoUrl?: string;
  serviceUsed?: string;
  videoUrl?: string;
  googleReviewUrl?: string;
  status: ContentStatus;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    clientName: { type: String, required: true, trim: true },
    clientTitle: { type: String, required: true },
    designation: String,
    companyName: { type: String, required: true },
    quote: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    avatarUrl: String,
    logoUrl: String,
    serviceUsed: String,
    videoUrl: String,
    googleReviewUrl: String,
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

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', testimonialSchema);

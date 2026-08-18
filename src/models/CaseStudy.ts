import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus } from '@today-digitech/shared';

export interface IMetricItem {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

export interface IBeforeAfterImage {
  label: string;
  beforeUrl: string;
  afterUrl: string;
}

export interface ICaseStudy extends Document {
  title: string;
  slug: string;
  clientName: string;
  industry: string;
  servicesUsed: string[];
  problem: string;
  strategy: string;
  implementation: string;
  results: string;
  metrics: IMetricItem[];
  beforeAfterImages: IBeforeAfterImage[];
  timeline?: string;
  gallery: string[];
  testimonial?: {
    quote: string;
    clientName: string;
    clientTitle: string;
    avatarUrl?: string;
  };
  relatedServices?: string[];
  coverImageUrl?: string;
  status: ContentStatus;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const caseStudySchema = new Schema<ICaseStudy>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    clientName: { type: String, default: 'Client' },
    industry: { type: String, default: 'General' },
    servicesUsed: [String],
    problem: { type: String, default: '' },
    strategy: { type: String, default: '' },
    implementation: { type: String, default: '' },
    results: { type: String, default: '' },
    metrics: [
      {
        label: { type: String, default: '' },
        value: { type: String, default: '' },
        change: String,
        isPositive: { type: Boolean, default: true },
      },
    ],
    beforeAfterImages: [
      {
        label: String,
        beforeUrl: { type: String, default: '' },
        afterUrl: { type: String, default: '' },
      },
    ],
    timeline: String,
    gallery: [String],
    testimonial: {
      quote: String,
      clientName: String,
      clientTitle: String,
      avatarUrl: String,
    },
    relatedServices: [String],
    coverImageUrl: String,
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

export const CaseStudy = mongoose.model<ICaseStudy>('CaseStudy', caseStudySchema);

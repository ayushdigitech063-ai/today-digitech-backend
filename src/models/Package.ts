import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus } from '@today-digitech/shared';

export interface IPackage extends Document {
  category: string;
  name: string;
  shortDescription: string;
  price: string;
  billingCycle?: string;
  features: string[];
  isRecommended: boolean;
  ctaLabel: string;
  ctaDestination: string;
  showPricing: boolean;
  status: ContentStatus;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IPackage>(
  {
    category: { type: String, required: true, default: 'Web Engineering' },
    name: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true },
    price: { type: String, required: true, default: 'Custom Quote' },
    billingCycle: { type: String, default: 'per project' },
    features: [String],
    isRecommended: { type: Boolean, default: false },
    ctaLabel: { type: String, default: 'Choose Package' },
    ctaDestination: { type: String, default: '/contact' },
    showPricing: { type: Boolean, default: true },
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

export const Package = mongoose.model<IPackage>('Package', packageSchema);

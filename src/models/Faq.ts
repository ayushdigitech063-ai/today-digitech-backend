import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus } from '@today-digitech/shared';

export interface IFaq extends Document {
  question: string;
  answer: string;
  category: string;
  status: ContentStatus;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    category: { type: String, default: 'General', index: true },
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

export const Faq = mongoose.model<IFaq>('Faq', faqSchema);

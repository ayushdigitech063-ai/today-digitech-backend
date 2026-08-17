import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus } from '@today-digitech/shared';

export interface IPageSection {
  sectionType: string;
  heading: string;
  subheading?: string;
  content: string;
  imageUrl?: string;
  order: number;
}

export interface IPage extends Document {
  title: string;
  slug: string;
  summary?: string;
  sections: IPageSection[];
  status: ContentStatus;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: String,
    sections: [
      {
        sectionType: { type: String, required: true },
        heading: { type: String, required: true },
        subheading: String,
        content: { type: String, default: '' },
        imageUrl: String,
        order: { type: Number, default: 0 },
      },
    ],
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
    keywords: [String],
    canonicalUrl: String,
    ogImage: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
);

export const Page = mongoose.model<IPage>('Page', pageSchema);

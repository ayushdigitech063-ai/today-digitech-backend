import mongoose, { Schema, Document } from 'mongoose';

export interface ISeoMeta extends Document {
  pagePath: string;
  pageType: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  indexPage: boolean;
  followLinks: boolean;
  schemaOverride?: string;
  status: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const seoMetaSchema = new Schema<ISeoMeta>(
  {
    pagePath: { type: String, required: true, unique: true, index: true },
    pageType: { type: String, required: true, default: 'page' },
    metaTitle: String,
    metaDescription: String,
    focusKeywords: [String],
    canonicalUrl: String,
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    twitterCard: { type: String, enum: ['summary', 'summary_large_image'], default: 'summary_large_image' },
    indexPage: { type: Boolean, default: true },
    followLinks: { type: Boolean, default: true },
    schemaOverride: String,
    status: { type: String, enum: ['Draft', 'Published', 'Scheduled', 'Archived'], default: 'Published', index: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const SeoMeta = mongoose.model<ISeoMeta>('SeoMeta', seoMetaSchema);

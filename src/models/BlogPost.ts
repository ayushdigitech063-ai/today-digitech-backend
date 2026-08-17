import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus } from '@today-digitech/shared';

export interface ITocItem {
  id: string;
  text: string;
  level: number;
}

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  summary?: string;
  content?: string;
  coverImageUrl?: string;
  category?: mongoose.Types.ObjectId;
  tags?: mongoose.Types.ObjectId[];
  author?: mongoose.Types.ObjectId;
  readingTime?: number;
  tableOfContents?: ITocItem[];
  relatedBlogs?: mongoose.Types.ObjectId[];
  relatedServices?: string[];
  publishDate?: Date;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  status: ContentStatus;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: '' },
    summary: { type: String, default: '' },
    content: { type: String, default: '' },
    coverImageUrl: String,
    category: { type: Schema.Types.Mixed, index: true },
    tags: [{ type: Schema.Types.Mixed }],
    author: { type: Schema.Types.Mixed },
    readingTime: { type: Number, default: 0 },
    tableOfContents: [
      {
        id: String,
        text: String,
        level: Number,
      },
    ],
    relatedBlogs: [{ type: Schema.Types.ObjectId, ref: 'BlogPost' }],
    relatedServices: [String],
    publishDate: { type: Date, default: Date.now },
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
    status: { type: String, enum: ['Draft', 'Published', 'Scheduled', 'Archived'], default: 'Draft', index: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Auto-calculate reading time before save
blogPostSchema.pre('save', function (next) {
  if (this.isModified('content') && this.content) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', blogPostSchema);

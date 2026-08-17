import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus } from '@today-digitech/shared';

export interface IBlogAuthor extends Document {
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  role?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  status: ContentStatus;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogAuthorSchema = new Schema<IBlogAuthor>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    bio: String,
    avatarUrl: String,
    role: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
    },
    status: { type: String, enum: ['Draft', 'Published', 'Scheduled', 'Archived'], default: 'Published', index: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const BlogAuthor = mongoose.model<IBlogAuthor>('BlogAuthor', blogAuthorSchema);

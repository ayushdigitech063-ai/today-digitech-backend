import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus } from '@today-digitech/shared';

export interface IJobPosting extends Document {
  title: string;
  slug: string;
  department?: string;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  salaryRange?: string;
  benefits?: string[];
  applicationDeadline?: Date;
  status: ContentStatus;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobPostingSchema = new Schema<IJobPosting>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    department: { type: String, default: 'Engineering' },
    location: { type: String, default: 'New Delhi, India' },
    employmentType: { type: String, default: 'Full-time' },
    experienceLevel: { type: String, default: '2-4 Years' },
    description: { type: String, default: '' },
    requirements: [String],
    responsibilities: [String],
    salaryRange: String,
    benefits: [String],
    applicationDeadline: Date,
    status: { type: String, enum: ['Draft', 'Published', 'Scheduled', 'Archived'], default: 'Published', index: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const JobPosting = mongoose.model<IJobPosting>('JobPosting', jobPostingSchema);

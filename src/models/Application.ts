import mongoose, { Schema, Document } from 'mongoose';
import { ApplicationStatus } from '@today-digitech/shared';

export interface IApplicationNote {
  note: string;
  author: string;
  createdAt: Date;
}

export interface IApplicationTimeline {
  status: ApplicationStatus;
  changedBy: string;
  timestamp: Date;
  note?: string;
}

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  applicantName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  resumePublicId: string;
  coverLetter?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  status: ApplicationStatus;
  notes: IApplicationNote[];
  statusTimeline: IApplicationTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'JobPosting', required: true, index: true },
    applicantName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true },
    resumeUrl: { type: String, required: true },
    resumePublicId: { type: String, required: true },
    coverLetter: String,
    linkedinUrl: String,
    portfolioUrl: String,
    status: {
      type: String,
      enum: ['NEW', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'],
      default: 'NEW',
      index: true,
    },
    notes: [
      {
        note: { type: String, required: true },
        author: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    statusTimeline: [
      {
        status: { type: String, required: true },
        changedBy: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true },
);

export const Application = mongoose.model<IApplication>('Application', applicationSchema);

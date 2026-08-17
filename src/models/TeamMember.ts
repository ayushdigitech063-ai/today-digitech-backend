import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus } from '@today-digitech/shared';

export interface ITeamMember extends Document {
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  status: ContentStatus;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true },
    bio: { type: String, required: true },
    photoUrl: { type: String, required: true },
    linkedinUrl: String,
    twitterUrl: String,
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

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);

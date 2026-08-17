import mongoose, { Schema, Document } from 'mongoose';
import { LeadStatus, FormType } from '@today-digitech/shared';

export interface IInternalNote {
  note: string;
  author: string;
  createdAt: Date;
}

export interface IStatusTimelineItem {
  status: LeadStatus;
  changedBy: string;
  timestamp: Date;
  note?: string;
}

export interface ILead extends Document {
  name: string;
  businessName?: string;
  phone?: string;
  email: string;
  website?: string;
  interestedService?: string;
  budget?: string;
  message?: string;
  formType: FormType;
  leadSource?: string;
  landingPage?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  consent: boolean;
  status: LeadStatus;
  assignedTo?: mongoose.Types.ObjectId;
  followUpDate?: Date;
  notes: IInternalNote[];
  statusTimeline: IStatusTimelineItem[];
  isDuplicate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    businessName: String,
    phone: String,
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    website: String,
    interestedService: String,
    budget: String,
    message: String,
    formType: {
      type: String,
      enum: ['CONTACT', 'GET_QUOTE', 'FREE_AUDIT', 'CALL_BACK', 'SERVICE_ENQUIRY', 'NEWSLETTER'],
      default: 'CONTACT',
      index: true,
    },
    leadSource: { type: String, default: 'Organic Website' },
    landingPage: String,
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmContent: String,
    utmTerm: String,
    consent: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'SPAM'],
      default: 'NEW',
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    followUpDate: Date,
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
    isDuplicate: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Lead = mongoose.model<ILead>('Lead', leadSchema);

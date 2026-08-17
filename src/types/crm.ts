export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'SPAM';

export type FormType =
  | 'CONTACT'
  | 'GET_QUOTE'
  | 'FREE_AUDIT'
  | 'CALL_BACK'
  | 'SERVICE_ENQUIRY'
  | 'NEWSLETTER';

export interface InternalNoteDTO {
  id: string;
  note: string;
  author: string;
  createdAt: string;
}

export interface StatusTimelineItemDTO {
  status: LeadStatus;
  changedBy: string;
  timestamp: string;
  note?: string;
}

export interface LeadDTO {
  id: string;
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
  assignedTo?: string;
  followUpDate?: string;
  notes: InternalNoteDTO[];
  statusTimeline: StatusTimelineItemDTO[];
  isDuplicate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadSubmissionPayload {
  name: string;
  businessName?: string;
  phone?: string;
  email: string;
  website?: string;
  interestedService?: string;
  budget?: string;
  message?: string;
  formType?: FormType;
  landingPage?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  consent?: boolean;
}

import { BaseCmsItem } from './cms';

export type ApplicationStatus =
  | 'NEW'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED';

export interface JobPostingDTO extends BaseCmsItem {
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salaryRange?: string;
  benefits?: string[];
  applicationDeadline?: string;
}

export interface ApplicationNoteDTO {
  id: string;
  note: string;
  author: string;
  createdAt: string;
}

export interface ApplicationTimelineDTO {
  status: ApplicationStatus;
  changedBy: string;
  timestamp: string;
  note?: string;
}

export interface ApplicationDTO {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  resumePublicId: string;
  coverLetter?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  status: ApplicationStatus;
  notes: ApplicationNoteDTO[];
  statusTimeline: ApplicationTimelineDTO[];
  createdAt: string;
  updatedAt: string;
}

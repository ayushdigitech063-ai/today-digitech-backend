import { z } from 'zod';

export const leadSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  businessName: z.string().optional(),
  website: z.string().optional(),
  interestedService: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const jobApplicationSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  applicantName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone is required'),
  coverLetter: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

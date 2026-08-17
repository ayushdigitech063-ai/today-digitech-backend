import { BaseCmsItem } from './cms';

export interface MetricItem {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

export interface BeforeAfterImage {
  label: string;
  beforeUrl: string;
  afterUrl: string;
}

export interface CaseStudyTestimonial {
  quote: string;
  clientName: string;
  clientTitle: string;
  avatarUrl?: string;
}

export interface CaseStudyDTO extends BaseCmsItem {
  title: string;
  slug: string;
  clientName: string;
  industry: string;
  servicesUsed: string[];
  problem: string;
  strategy: string;
  implementation: string;
  results: string;
  metrics: MetricItem[];
  beforeAfterImages: BeforeAfterImage[];
  timeline?: string;
  gallery: string[];
  testimonial?: CaseStudyTestimonial;
  relatedServices?: string[];
  coverImageUrl?: string;
}

export interface PortfolioDTO extends BaseCmsItem {
  title: string;
  slug: string;
  clientName: string;
  category: string;
  coverImageUrl: string;
  gallery: string[];
  techStack: string[];
  projectUrl?: string;
  completionDate?: string;
  summary: string;
  description: string;
}

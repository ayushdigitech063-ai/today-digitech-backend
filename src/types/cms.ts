export type ContentStatus = 'Draft' | 'Published' | 'Scheduled' | 'Archived';

export interface BaseCmsItem {
  id: string;
  status: ContentStatus;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PageSectionDTO {
  id: string;
  sectionType: string;
  heading: string;
  subheading?: string;
  content: string;
  imageUrl?: string;
  order: number;
}

export interface PageDTO extends BaseCmsItem {
  title: string;
  slug: string;
  summary?: string;
  sections: PageSectionDTO[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
}

export interface ServiceCategoryDTO extends BaseCmsItem {
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

export interface ServiceDTO extends BaseCmsItem {
  title: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  summary: string;
  description: string;
  features: string[];
  techStack: string[];
  iconUrl?: string;
  bannerUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface IndustryDTO extends BaseCmsItem {
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  bannerUrl?: string;
}

export interface LocationDTO extends BaseCmsItem {
  name: string;
  slug: string;
  region: string;
  address?: string;
  phone?: string;
}

export interface FaqDTO extends BaseCmsItem {
  question: string;
  answer: string;
  category: string;
}

export interface TestimonialDTO extends BaseCmsItem {
  clientName: string;
  clientTitle: string;
  designation?: string;
  companyName: string;
  quote: string;
  rating: number;
  avatarUrl?: string;
  logoUrl?: string;
  serviceUsed?: string;
  videoUrl?: string;
  googleReviewUrl?: string;
}

export interface ClientLogoDTO extends BaseCmsItem {
  name: string;
  logoUrl: string;
  websiteUrl?: string;
}

export interface TeamMemberDTO extends BaseCmsItem {
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}

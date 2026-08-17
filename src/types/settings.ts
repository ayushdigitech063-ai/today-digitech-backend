export interface SocialLinksDTO {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
}

export interface HeaderCtaDTO {
  text: string;
  href: string;
  isActive: boolean;
}

export interface AnalyticsIdsDTO {
  googleAnalyticsId?: string;
  metaPixelId?: string;
  googleTagManagerId?: string;
}

export interface DefaultSeoDTO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
}

export interface WebsiteSettingsDTO {
  businessName: string;
  tagline: string;
  fullLogoUrl: string;
  compactLogoUrl: string;
  faviconUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  businessHours: string;
  socialLinks: SocialLinksDTO;
  headerCta: HeaderCtaDTO;
  footerDescription: string;
  copyrightText: string;
  analyticsIds: AnalyticsIdsDTO;
  defaultSeo: DefaultSeoDTO;
  maintenanceMode: boolean;
  recipientEmails: string[];
  updatedAt?: string;
}

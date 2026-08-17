import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  businessName: string;
  tagline?: string;
  fullLogoUrl?: string;
  compactLogoUrl?: string;
  headerLogoUrl?: string;
  footerLogoUrl?: string;
  adminPanelLogoUrl?: string;
  faviconUrl?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  googleMapsUrl?: string;
  businessHours?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  headerCta?: {
    text?: string;
    href?: string;
    isActive?: boolean;
  };
  heroSection?: {
    badgeText?: string;
    headlineTitle?: string;
    headlineAccent?: string;
    subdescription?: string;
    primaryCtaText?: string;
    primaryCtaHref?: string;
    secondaryCtaText?: string;
    secondaryCtaHref?: string;
    heroImageUrl?: string;
    trustedText?: string;
  };
  partnersSection?: {
    topCaption?: string;
    headlineText?: string;
  };
  announcementBar?: {
    text?: string;
    badgeText?: string;
    href?: string;
    isActive?: boolean;
  };
  footerDescription?: string;
  copyrightText?: string;
  analyticsIds?: {
    googleAnalyticsId?: string;
    metaPixelId?: string;
    googleTagManagerId?: string;
  };
  defaultSeo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
  };
  maintenanceMode: boolean;
  recipientEmails: string[];
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    businessName: { type: String, required: true, default: 'Today Digitech' },
    tagline: { type: String, default: 'Enterprise Digital Transformation & Engineering' },
    fullLogoUrl: { type: String, default: '/images/logo-full.svg' },
    compactLogoUrl: { type: String, default: '/images/logo-compact.svg' },
    headerLogoUrl: { type: String, default: '/images/logo-full.svg' },
    footerLogoUrl: { type: String, default: '/images/logo-full.svg' },
    adminPanelLogoUrl: { type: String, default: '/images/logo-compact.svg' },
    partnersSection: {
      topCaption: { type: String, default: 'TRUSTED BY BUSINESSES & GROWING TEAMS' },
      headlineText: { type: String, default: 'We’re proud to partner with ambitious companies across industries.' },
    },
    announcementBar: {
      text: { type: String, default: '🚀 Transforming Enterprises with Scalable Next.js 14 & AI Engineering' },
      badgeText: { type: String, default: 'NEW' },
      href: { type: String, default: '/contact' },
      isActive: { type: Boolean, default: true },
    },
    faviconUrl: { type: String, default: '/favicon.ico' },
    phone: { type: String, default: '+91 98765 43210' },
    whatsapp: { type: String, default: '+91 98765 43210' },
    email: { type: String, default: 'info@todaydigitech.com' },
    address: { type: String, default: 'Connaught Place, Central Business District, New Delhi 110001, India' },
    googleMapsUrl: { type: String, default: 'https://maps.google.com' },
    businessHours: { type: String, default: 'Mon - Sat: 9:00 AM - 7:00 PM' },
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com/todaydigitech' },
      twitter: { type: String, default: 'https://twitter.com/todaydigitech' },
      linkedin: { type: String, default: 'https://linkedin.com/company/todaydigitech' },
      instagram: { type: String, default: 'https://instagram.com/todaydigitech' },
    },
    headerCta: {
      text: { type: String, default: 'Get Started' },
      href: { type: String, default: '/contact' },
      isActive: { type: Boolean, default: true },
    },
    heroSection: {
      badgeText: { type: String, default: 'DIGITAL TRANSFORMATION • ENGINEERING • INNOVATION' },
      headlineTitle: { type: String, default: 'Building Digital Products That' },
      headlineAccent: { type: String, default: 'Move Businesses Forward' },
      subdescription: { type: String, default: 'We build scalable web, mobile, AI and cloud solutions that drive innovation, growth and long-term impact.' },
      primaryCtaText: { type: String, default: 'Start a Project' },
      primaryCtaHref: { type: String, default: '/contact' },
      secondaryCtaText: { type: String, default: 'View Our Work' },
      secondaryCtaHref: { type: String, default: '/portfolio' },
      heroImageUrl: { type: String, default: '/images/hero_dashboard.jpg' },
      trustedText: { type: String, default: 'Trusted by 50+ companies worldwide' },
    },
    footerDescription: {
      type: String,
      default:
        'Today Digitech is an enterprise digital transformation partner enabling organizations through web engineering, mobile apps, cloud DevOps, and digital growth strategies.',
    },
    copyrightText: {
      type: String,
      default: '© 2026 Today Digitech. All rights reserved.',
    },
    analyticsIds: {
      googleAnalyticsId: String,
      metaPixelId: String,
      googleTagManagerId: String,
    },
    defaultSeo: {
      metaTitle: { type: String, default: 'Today Digitech - Next-Gen Digital Solutions' },
      metaDescription: {
        type: String,
        default: 'Enterprise Digital Transformation, Software Engineering & Tech Innovation Platform.',
      },
      keywords: { type: [String], default: ['Next.js', 'Express', 'TypeScript', 'Digital Marketing'] },
      ogImage: String,
    },
    maintenanceMode: { type: Boolean, default: false },
    recipientEmails: { type: [String], default: ['leads@todaydigitech.com'] },
  },
  { timestamps: true },
);

export const Setting = mongoose.model<ISetting>('Setting', settingSchema);

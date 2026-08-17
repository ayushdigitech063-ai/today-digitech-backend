import { BaseCmsItem } from './cms';

export interface PackageDTO extends BaseCmsItem {
  category: string;
  name: string;
  shortDescription: string;
  price: string;
  billingCycle?: string;
  features: string[];
  isRecommended: boolean;
  ctaLabel: string;
  ctaDestination: string;
  showPricing: boolean;
}

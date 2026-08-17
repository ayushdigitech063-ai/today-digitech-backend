import { BaseCmsItem } from './cms';
export interface SeoMetaDTO extends BaseCmsItem {
    pagePath: string;
    pageType: string;
    metaTitle?: string;
    metaDescription?: string;
    focusKeywords?: string[];
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: 'summary' | 'summary_large_image';
    indexPage: boolean;
    followLinks: boolean;
    schemaOverride?: string;
}
export interface RedirectDTO extends BaseCmsItem {
    sourcePath: string;
    destinationPath: string;
    redirectType: 301 | 302;
    hitCount: number;
}
//# sourceMappingURL=seo.d.ts.map
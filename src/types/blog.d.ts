import { BaseCmsItem } from './cms';
export interface BlogCategoryDTO extends BaseCmsItem {
    name: string;
    slug: string;
    description?: string;
}
export interface BlogTagDTO extends BaseCmsItem {
    name: string;
    slug: string;
}
export interface BlogAuthorDTO extends BaseCmsItem {
    name: string;
    slug: string;
    bio?: string;
    avatarUrl?: string;
    role?: string;
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
    };
}
export interface TocItem {
    id: string;
    text: string;
    level: number;
}
export interface BlogPostDTO extends BaseCmsItem {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImageUrl?: string;
    category?: string;
    tags?: string[];
    author?: string;
    readingTime?: number;
    tableOfContents?: TocItem[];
    relatedBlogs?: string[];
    relatedServices?: string[];
    publishDate?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
}
//# sourceMappingURL=blog.d.ts.map
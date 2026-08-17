export type CloudinaryFolder =
  | 'branding'
  | 'services'
  | 'industries'
  | 'blogs'
  | 'case-studies'
  | 'portfolio'
  | 'testimonials'
  | 'team'
  | 'careers';

export interface MediaItemDTO {
  id: string;
  url: string;
  secureUrl: string;
  publicId: string;
  folder: CloudinaryFolder;
  fileName: string;
  fileType: string;
  fileSize: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  credit?: string;
  usageCount: number;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

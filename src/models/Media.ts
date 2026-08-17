import mongoose, { Schema, Document } from 'mongoose';
import { CloudinaryFolder } from '@today-digitech/shared';

export interface IMedia extends Document {
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
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<IMedia>(
  {
    url: { type: String, required: true },
    secureUrl: { type: String, required: true },
    publicId: { type: String, required: true, unique: true, index: true },
    folder: {
      type: String,
      required: true,
      enum: [
        'branding',
        'services',
        'industries',
        'blogs',
        'case-studies',
        'portfolio',
        'testimonials',
        'team',
        'careers',
      ],
      index: true,
    },
    fileName: { type: String, required: true, index: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    width: Number,
    height: Number,
    altText: { type: String, default: '' },
    caption: { type: String, default: '' },
    credit: { type: String, default: '' },
    usageCount: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
);

export const Media = mongoose.model<IMedia>('Media', mediaSchema);

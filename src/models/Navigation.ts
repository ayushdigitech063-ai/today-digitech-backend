import mongoose, { Schema, Document } from 'mongoose';
import { NavigationLocation } from '@today-digitech/shared';

export interface INavigation extends Document {
  title: string;
  href: string;
  location: NavigationLocation;
  parentId?: mongoose.Types.ObjectId;
  megaMenuGroup?: string;
  isExternal: boolean;
  openInNewTab: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const navigationSchema = new Schema<INavigation>(
  {
    title: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
    location: {
      type: String,
      required: true,
      enum: ['header', 'footer-quick', 'footer-services', 'footer-legal'],
      index: true,
    },
    parentId: { type: Schema.Types.ObjectId, ref: 'Navigation', default: null },
    megaMenuGroup: { type: String, default: null },
    isExternal: { type: Boolean, default: false },
    openInNewTab: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export const Navigation = mongoose.model<INavigation>('Navigation', navigationSchema);

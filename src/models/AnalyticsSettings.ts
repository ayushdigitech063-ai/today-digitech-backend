import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsSettings extends Document {
  ga4MeasurementId?: string;
  gscVerificationTag?: string;
  metaPixelId?: string;
  googleAdsConversionId?: string;
  googleAdsConversionLabel?: string;
  scriptHeaderCustom?: string;
  scriptBodyCustom?: string;
  status: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSettingsSchema = new Schema<IAnalyticsSettings>(
  {
    ga4MeasurementId: { type: String, trim: true },
    gscVerificationTag: { type: String, trim: true },
    metaPixelId: { type: String, trim: true },
    googleAdsConversionId: { type: String, trim: true },
    googleAdsConversionLabel: { type: String, trim: true },
    scriptHeaderCustom: String,
    scriptBodyCustom: String,
    status: { type: String, enum: ['Draft', 'Published', 'Scheduled', 'Archived'], default: 'Published' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const AnalyticsSettings = mongoose.model<IAnalyticsSettings>('AnalyticsSettings', analyticsSettingsSchema);

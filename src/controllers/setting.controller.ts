import { Request, Response, NextFunction } from 'express';
import { Setting } from '../models/Setting';
import { sendSuccess } from '../utils/apiResponse';
import { logAuditAction } from '../utils/auditLogger';

// Helper to fetch or initialize singleton settings document
const getSingletonSetting = async () => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({});
  }
  return setting;
};

export const getPublicSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const setting = await getSingletonSetting();
    sendSuccess(res, setting, 'Website settings fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const setting = await getSingletonSetting();
    sendSuccess(res, setting, 'Admin website settings fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const setting = await getSingletonSetting();

    const allowedFields = [
      'businessName',
      'tagline',
      'fullLogoUrl',
      'compactLogoUrl',
      'faviconUrl',
      'phone',
      'whatsapp',
      'email',
      'address',
      'googleMapsUrl',
      'businessHours',
      'socialLinks',
      'headerCta',
      'footerDescription',
      'copyrightText',
      'analyticsIds',
      'defaultSeo',
      'maintenanceMode',
      'recipientEmails',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (setting as any)[field] = req.body[field];
      }
    });

    await setting.save();
    await logAuditAction(req, 'UPDATE_WEBSITE_SETTINGS', 'Setting', req.body);

    sendSuccess(res, setting, 'Website settings updated successfully');
  } catch (error) {
    next(error);
  }
};

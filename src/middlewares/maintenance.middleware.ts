import { Request, Response, NextFunction } from 'express';
import { Setting } from '../models/Setting';
import { AppError } from '../utils/appError';

export const checkMaintenanceMode = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // Admin routes bypass maintenance mode
    if (req.originalUrl.includes('/auth') || req.originalUrl.includes('/cms') || req.originalUrl.includes('/users')) {
      return next();
    }

    const settings = await Setting.findOne({ isActive: true });
    if (settings && (settings as any).maintenanceMode) {
      return next(
        new AppError(
          'System is currently undergoing scheduled maintenance. Please try again shortly.',
          503,
          'SERVICE_MAINTENANCE',
        ),
      );
    }

    next();
  } catch (error) {
    next();
  }
};

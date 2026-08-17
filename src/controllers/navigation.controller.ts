import { Request, Response, NextFunction } from 'express';
import { Navigation } from '../models/Navigation';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { logAuditAction } from '../utils/auditLogger';

export const getPublicNavigation = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activeItems = await Navigation.find({ isActive: true }).sort({ order: 1 });

    const grouped = {
      header: activeItems.filter((i) => i.location === 'header'),
      footerQuick: activeItems.filter((i) => i.location === 'footer-quick'),
      footerServices: activeItems.filter((i) => i.location === 'footer-services'),
      footerLegal: activeItems.filter((i) => i.location === 'footer-legal'),
    };

    sendSuccess(res, grouped, 'Public navigation items fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminNavigation = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items = await Navigation.find().sort({ location: 1, order: 1 });
    sendSuccess(res, items, 'Admin navigation items fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createNavigationItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, href, location, parentId, megaMenuGroup, isExternal, openInNewTab, isActive, order } = req.body;

    const item = await Navigation.create({
      title,
      href,
      location,
      parentId: parentId || null,
      megaMenuGroup: megaMenuGroup || null,
      isExternal: !!isExternal,
      openInNewTab: !!openInNewTab,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    await logAuditAction(req, 'CREATE_NAVIGATION_ITEM', 'Navigation', { id: item.id, title: item.title });

    sendSuccess(res, item, 'Navigation item created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateNavigationItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await Navigation.findById(id);

    if (!item) {
      return next(new AppError('Navigation item not found', 404, 'NOT_FOUND'));
    }

    const fields = ['title', 'href', 'location', 'parentId', 'megaMenuGroup', 'isExternal', 'openInNewTab', 'isActive', 'order'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        (item as any)[f] = req.body[f];
      }
    });

    await item.save();
    await logAuditAction(req, 'UPDATE_NAVIGATION_ITEM', 'Navigation', { id: item.id, title: item.title });

    sendSuccess(res, item, 'Navigation item updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteNavigationItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await Navigation.findById(id);

    if (!item) {
      return next(new AppError('Navigation item not found', 404, 'NOT_FOUND'));
    }

    await Navigation.findByIdAndDelete(id);
    await logAuditAction(req, 'DELETE_NAVIGATION_ITEM', 'Navigation', { id, title: item.title });

    sendSuccess(res, null, 'Navigation item deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const reorderNavigationItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { items } = req.body as { items: Array<{ id: string; order: number }> };

    if (!Array.isArray(items)) {
      return next(new AppError('Items array required for reordering', 400, 'INVALID_PAYLOAD'));
    }

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await Navigation.bulkWrite(bulkOps);
    await logAuditAction(req, 'REORDER_NAVIGATION', 'Navigation', { count: items.length });

    sendSuccess(res, null, 'Navigation items reordered successfully');
  } catch (error) {
    next(error);
  }
};

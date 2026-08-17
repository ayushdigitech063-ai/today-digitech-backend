import { Response, NextFunction } from 'express';
import { Page } from '../models/Page';
import { Service } from '../models/Service';
import { ServiceCategory } from '../models/ServiceCategory';
import { Industry } from '../models/Industry';
import { Location } from '../models/Location';
import { Faq } from '../models/Faq';
import { Testimonial } from '../models/Testimonial';
import { ClientLogo } from '../models/ClientLogo';
import { TeamMember } from '../models/TeamMember';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { QueryFeatures } from '../utils/queryFeatures';
import { logAuditAction } from '../utils/auditLogger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

import { CaseStudy } from '../models/CaseStudy';
import { Portfolio } from '../models/Portfolio';
import { Package } from '../models/Package';
import { BlogPost } from '../models/BlogPost';
import { BlogCategory } from '../models/BlogCategory';
import { BlogTag } from '../models/BlogTag';
import { BlogAuthor } from '../models/BlogAuthor';
import { JobPosting } from '../models/JobPosting';
import { SeoMeta } from '../models/SeoMeta';
import { Redirect } from '../models/Redirect';
import { AnalyticsSettings } from '../models/AnalyticsSettings';

const getModelMap = (): Record<string, any> => ({
  pages: Page,
  services: Service,
  'service-categories': ServiceCategory,
  industries: Industry,
  locations: Location,
  faqs: Faq,
  testimonials: Testimonial,
  clients: ClientLogo,
  team: TeamMember,
  'case-studies': CaseStudy,
  portfolio: Portfolio,
  packages: Package,
  'blog-posts': BlogPost,
  'blog-categories': BlogCategory,
  'blog-tags': BlogTag,
  'blog-authors': BlogAuthor,
  jobs: JobPosting,
  'seo-meta': SeoMeta,
  redirects: Redirect,
  'analytics-settings': AnalyticsSettings,
});

export const getCmsList = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { module } = req.params;
    const Model = getModelMap()[module];

    if (!Model) {
      return next(new AppError(`Invalid CMS module: ${module}`, 400, 'INVALID_MODULE'));
    }

    const features = new QueryFeatures(Model.find(), req.query)
      .filter(['title', 'name', 'question', 'clientName', 'summary', 'description'])
      .sort()
      .limitFields();

    const { meta } = await features.paginate();
    const items = await features.query;

    sendSuccess(res, items, `${module} list fetched successfully`, 200, meta);
  } catch (error) {
    next(error);
  }
};

import { ContentRevision } from '../models/ContentRevision';

const saveRevisionSnapshot = async (req: AuthenticatedRequest, module: string, entityId: string, snapshot: any, actionType: any, changeSummary?: string) => {
  try {
    const latestRev = await ContentRevision.findOne({ entityType: module, entityId }).sort({ versionNumber: -1 });
    const newVersion = (latestRev?.versionNumber || 0) + 1;
    await ContentRevision.create({
      entityType: module,
      entityId,
      versionNumber: newVersion,
      snapshot: typeof snapshot.toObject === 'function' ? snapshot.toObject() : snapshot,
      createdBy: req.adminUser?.name || req.adminUser?.email || 'Admin',
      changeSummary: changeSummary || `${actionType} operation on ${module}`,
      actionType,
    });
  } catch (err) {
    // Non-blocking revision recording
  }
};

export const createCmsItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { module } = req.params;
    const Model = getModelMap()[module];

    if (!Model) {
      return next(new AppError(`Invalid CMS module: ${module}`, 400, 'INVALID_MODULE'));
    }

    const itemData = {
      ...req.body,
      createdBy: req.adminUser?.id,
      updatedBy: req.adminUser?.id,
    };

    const item = await Model.create(itemData);
    await logAuditAction(req, 'CREATE', module, { itemId: item.id });
    await saveRevisionSnapshot(req, module, item.id, item, 'CREATE', `Initial publication of ${module}`);

    sendSuccess(res, item, `${module} item created successfully`, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCmsItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { module, id } = req.params;
    const Model = getModelMap()[module];

    if (!Model) {
      return next(new AppError(`Invalid CMS module: ${module}`, 400, 'INVALID_MODULE'));
    }

    const item = await Model.findById(id);
    if (!item) {
      return next(new AppError('CMS item not found', 404, 'NOT_FOUND'));
    }

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    Object.assign(item, updateData, { updatedBy: req.adminUser?.id });
    await item.save();

    const action = req.body.status === 'Published' ? 'PUBLISH' : req.body.status === 'Scheduled' ? 'SCHEDULE' : 'UPDATE';
    await logAuditAction(req, action, module, { itemId: item.id });
    await saveRevisionSnapshot(req, module, item.id, item, action as any, `Updated content attributes for ${module}`);

    sendSuccess(res, item, `${module} item updated successfully`);
  } catch (error) {
    next(error);
  }
};

export const deleteCmsItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { module, id } = req.params;
    const Model = getModelMap()[module];

    if (!Model) {
      return next(new AppError(`Invalid CMS module: ${module}`, 400, 'INVALID_MODULE'));
    }

    const item = await Model.findByIdAndDelete(id);
    if (!item) {
      return next(new AppError('CMS item not found', 404, 'NOT_FOUND'));
    }

    await logAuditAction(req, `DELETE_${module.toUpperCase()}`, module, { itemId: id });

    sendSuccess(res, null, `${module} item deleted successfully`);
  } catch (error) {
    next(error);
  }
};

export const duplicateCmsItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { module, id } = req.params;
    const Model = getModelMap()[module];

    if (!Model) {
      return next(new AppError(`Invalid CMS module: ${module}`, 400, 'INVALID_MODULE'));
    }

    const item = await Model.findById(id).lean();
    if (!item) {
      return next(new AppError('CMS item not found', 404, 'NOT_FOUND'));
    }

    delete item._id;
    delete item.createdAt;
    delete item.updatedAt;

    if (item.title) item.title = `${item.title} (Copy)`;
    if (item.name) item.name = `${item.name} (Copy)`;
    if (item.slug) item.slug = `${item.slug}-copy-${Date.now()}`;
    item.status = 'Draft';
    item.createdBy = req.adminUser?.id;
    item.updatedBy = req.adminUser?.id;

    const duplicatedItem = await Model.create(item);
    await logAuditAction(req, `DUPLICATE_${module.toUpperCase()}`, module, { originalId: id, newId: duplicatedItem.id });

    sendSuccess(res, duplicatedItem, `${module} item duplicated successfully`, 201);
  } catch (error) {
    next(error);
  }
};

export const togglePublishCmsItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { module, id } = req.params;
    const { status } = req.body;
    const Model = getModelMap()[module];

    if (!Model) {
      return next(new AppError(`Invalid CMS module: ${module}`, 400, 'INVALID_MODULE'));
    }

    const item = await Model.findById(id);
    if (!item) {
      return next(new AppError('CMS item not found', 404, 'NOT_FOUND'));
    }

    item.status = status || (item.status === 'Published' ? 'Draft' : 'Published');
    item.updatedBy = req.adminUser?.id;
    await item.save();

    await logAuditAction(req, `TOGGLE_PUBLISH_${module.toUpperCase()}`, module, { itemId: id, newStatus: item.status });

    sendSuccess(res, item, `${module} item status changed to ${item.status}`);
  } catch (error) {
    next(error);
  }
};

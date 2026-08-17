import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ContentRevision } from '../models/ContentRevision';
import { AuditLog } from '../models/AuditLog';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { QueryFeatures } from '../utils/queryFeatures';
import { logAuditAction } from '../utils/auditLogger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getRecentRevisions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const revisions = await ContentRevision.find().sort({ createdAt: -1 }).limit(limit);
    sendSuccess(res, revisions, 'Recent content revisions fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getRevisions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;
    const revisions = await ContentRevision.find({ entityType, entityId }).sort({ versionNumber: -1 });
    sendSuccess(res, revisions, 'Content revisions fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getRevisionById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const revision = await ContentRevision.findById(req.params.id);
    if (!revision) return next(new AppError('Revision record not found', 404, 'NOT_FOUND'));
    sendSuccess(res, revision, 'Revision detail fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const rollbackRevision = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const targetRevision = await ContentRevision.findById(req.params.id);
    if (!targetRevision) return next(new AppError('Target revision not found', 404, 'NOT_FOUND'));

    const modelName = mongoose.modelNames().find((m) => m.toLowerCase() === targetRevision.entityType.toLowerCase() || m === targetRevision.entityType);
    if (!modelName) return next(new AppError(`Model ${targetRevision.entityType} not found`, 400, 'INVALID_MODEL'));

    const Model = mongoose.model(modelName);
    const existingDoc = await Model.findById(targetRevision.entityId);
    if (!existingDoc) return next(new AppError('Original entity document no longer exists', 404, 'ENTITY_NOT_FOUND'));

    // Apply snapshot to document
    const snapshotData = { ...targetRevision.snapshot };
    delete snapshotData._id;
    delete snapshotData.__v;
    delete snapshotData.createdAt;

    Object.assign(existingDoc, snapshotData);
    await existingDoc.save();

    // Get highest version number
    const latestRev = await ContentRevision.findOne({ entityType: targetRevision.entityType, entityId: targetRevision.entityId }).sort({ versionNumber: -1 });
    const newVersion = (latestRev?.versionNumber || 0) + 1;

    // Create ROLLBACK revision entry
    await ContentRevision.create({
      entityType: targetRevision.entityType,
      entityId: targetRevision.entityId,
      versionNumber: newVersion,
      snapshot: existingDoc.toObject(),
      createdBy: req.adminUser?.name || req.adminUser?.email || 'Admin',
      changeSummary: `Rolled back to version #${targetRevision.versionNumber}`,
      actionType: 'ROLLBACK',
    });

    await logAuditAction(req, 'ROLLBACK', targetRevision.entityType, {
      entityId: targetRevision.entityId,
      restoredFromVersion: targetRevision.versionNumber,
      newVersion,
    });

    sendSuccess(res, existingDoc, `Entity rolled back successfully to Version #${targetRevision.versionNumber}`);
  } catch (error) {
    next(error);
  }
};

export const archiveEntity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;
    const Model = mongoose.model(entityType);
    const doc = await Model.findById(entityId);
    if (!doc) return next(new AppError('Entity not found', 404, 'NOT_FOUND'));

    doc.status = 'Archived';
    doc.isActive = false;
    await doc.save();

    await logAuditAction(req, 'ARCHIVE', entityType, { entityId });
    sendSuccess(res, doc, `${entityType} archived successfully (soft deleted)`);
  } catch (error) {
    next(error);
  }
};

export const restoreEntity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;
    const Model = mongoose.model(entityType);
    const doc = await Model.findById(entityId);
    if (!doc) return next(new AppError('Entity not found', 404, 'NOT_FOUND'));

    doc.status = 'Published';
    doc.isActive = true;
    await doc.save();

    await logAuditAction(req, 'RESTORE', entityType, { entityId });
    sendSuccess(res, doc, `${entityType} restored from archive`);
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const features = new QueryFeatures(AuditLog.find(), req.query).filter(['action', 'resource', 'adminEmail']).sort().limitFields();
    const { meta } = await features.paginate();
    const logs = await features.query;
    sendSuccess(res, logs, 'Audit logs fetched successfully', 200, meta);
  } catch (error) {
    next(error);
  }
};

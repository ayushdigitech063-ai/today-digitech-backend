import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { AdminUser } from '../models/AdminUser';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { QueryFeatures } from '../utils/queryFeatures';
import { logAuditAction } from '../utils/auditLogger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getAdminUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const features = new QueryFeatures(AdminUser.find(), req.query).filter(['name', 'email']).sort().limitFields();
    const { meta } = await features.paginate();
    const users = await features.query;

    sendSuccess(res, users, 'Admin users retrieved successfully', 200, meta);
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, customPermissions } = req.body;

    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      return next(new AppError('An admin user with this email already exists', 400, 'USER_EXISTS'));
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await AdminUser.create({
      name,
      email,
      passwordHash,
      role: role || 'Viewer',
      customPermissions: customPermissions || [],
      isSuperAdmin: role === 'Super Admin',
    });

    await logAuditAction(req, 'CREATE_ADMIN_USER', 'AdminUser', { createdUserId: user.id, email: user.email, role: user.role });

    sendSuccess(res, user, 'Admin user created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateAdminUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, customPermissions, isActive } = req.body;

    const user = await AdminUser.findById(id);
    if (!user) {
      return next(new AppError('Admin user not found', 404, 'USER_NOT_FOUND'));
    }

    // Protection: Prevent demoting Super Admin
    if (user.isSuperAdmin && role && role !== 'Super Admin') {
      return next(new AppError('Forbidden: Primary Super Admin role cannot be demoted', 403, 'SUPER_ADMIN_PROTECTED'));
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (customPermissions) user.customPermissions = customPermissions;
    if (typeof isActive === 'boolean') {
      if (user.isSuperAdmin && !isActive) {
        return next(new AppError('Forbidden: Primary Super Admin account cannot be disabled', 403, 'SUPER_ADMIN_PROTECTED'));
      }
      user.isActive = isActive;
    }

    await user.save();
    await logAuditAction(req, 'UPDATE_ADMIN_USER', 'AdminUser', { targetUserId: user.id, role: user.role });

    sendSuccess(res, user, 'Admin user updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteAdminUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await AdminUser.findById(id);

    if (!user) {
      return next(new AppError('Admin user not found', 404, 'USER_NOT_FOUND'));
    }

    // Protection: Prevent deleting Super Admin
    if (user.isSuperAdmin || user.role === 'Super Admin') {
      return next(new AppError('Forbidden: Primary Super Admin account cannot be deleted', 403, 'SUPER_ADMIN_PROTECTED'));
    }

    await AdminUser.findByIdAndDelete(id);
    await logAuditAction(req, 'DELETE_ADMIN_USER', 'AdminUser', { deletedUserId: id, email: user.email });

    sendSuccess(res, null, 'Admin user deleted successfully');
  } catch (error) {
    next(error);
  }
};

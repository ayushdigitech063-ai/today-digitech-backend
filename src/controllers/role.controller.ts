import { Response, NextFunction } from 'express';
import { Role } from '../models/Role';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { logAuditAction } from '../utils/auditLogger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getRoles = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    sendSuccess(res, roles, 'Roles retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, permissions } = req.body;

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return next(new AppError('A role with this name already exists', 400, 'ROLE_EXISTS'));
    }

    const role = await Role.create({
      name,
      description,
      permissions: permissions || [],
      isSystemRole: false,
    });

    await logAuditAction(req, 'CREATE_ROLE', 'Role', { roleId: role.id, name: role.name });

    sendSuccess(res, role, 'Role created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { description, permissions } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      return next(new AppError('Role not found', 404, 'ROLE_NOT_FOUND'));
    }

    if (description) role.description = description;
    if (permissions) role.permissions = permissions;

    await role.save();
    await logAuditAction(req, 'UPDATE_ROLE', 'Role', { roleId: role.id, name: role.name });

    sendSuccess(res, role, 'Role updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);

    if (!role) {
      return next(new AppError('Role not found', 404, 'ROLE_NOT_FOUND'));
    }

    if (role.isSystemRole) {
      return next(new AppError('Forbidden: Default system roles cannot be deleted', 403, 'SYSTEM_ROLE_PROTECTED'));
    }

    await Role.findByIdAndDelete(id);
    await logAuditAction(req, 'DELETE_ROLE', 'Role', { roleId: id, name: role.name });

    sendSuccess(res, null, 'Role deleted successfully');
  } catch (error) {
    next(error);
  }
};

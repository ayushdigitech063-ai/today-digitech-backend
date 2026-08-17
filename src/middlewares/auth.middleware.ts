import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/token';
import { AppError } from '../utils/appError';
import { AdminUser, IAdminUser } from '../models/AdminUser';
import { Role } from '../models/Role';
import { Permission } from '@today-digitech/shared';

export interface AuthenticatedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  adminUser?: IAdminUser;
  tokenPayload?: TokenPayload;
}

export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Unauthorized: Access token missing', 401, 'UNAUTHORIZED'));
    }

    const payload = verifyAccessToken(token);
    const user = await AdminUser.findById(payload.adminId);

    if (!user || !user.isActive) {
      return next(new AppError('Unauthorized: User not found or inactive', 401, 'UNAUTHORIZED'));
    }

    req.adminUser = user;
    req.tokenPayload = payload;
    next();
  } catch (error) {
    return next(new AppError('Unauthorized: Invalid or expired token', 401, 'UNAUTHORIZED'));
  }
};

export const requirePermission = (permission: Permission) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.adminUser) {
        return next(new AppError('Unauthorized: Authentication required', 401, 'UNAUTHORIZED'));
      }

      await req.adminUser.populate('role');
      const role = req.adminUser.role as unknown as typeof Role.prototype;

      if (!role) {
        return next(new AppError('Forbidden: Role not assigned', 403, 'FORBIDDEN'));
      }

      if (role.name === 'Super Admin' || (role.permissions && role.permissions.includes(permission))) {
        return next();
      }

      return next(
        new AppError(`Forbidden: Required permission '${permission}' missing`, 403, 'FORBIDDEN'),
      );
    } catch (error) {
      return next(error);
    }
  };
};

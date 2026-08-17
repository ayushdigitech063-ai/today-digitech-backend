import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/token';
import { AppError } from '../utils/appError';
import { AdminUser, IAdminUser } from '../models/AdminUser';
import { Role } from '../models/Role';
import { Permission } from '@today-digitech/shared';

export interface AuthenticatedRequest extends Request {
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
      return next(new AppError('Unauthorized: Account inactive or not found', 401, 'ACCOUNT_INACTIVE'));
    }

    // Verify session if sessionId is attached and sessions array exists
    if (payload.sessionId && Array.isArray(user.sessions) && user.sessions.length > 0) {
      const sessionExists = user.sessions.some((s) => s.sessionId === payload.sessionId);
      if (!sessionExists) {
        return next(new AppError('Unauthorized: Session expired or revoked', 401, 'SESSION_EXPIRED'));
      }
    }

    req.adminUser = user;
    req.tokenPayload = payload;
    next();
  } catch (error) {
    next(new AppError('Unauthorized: Invalid or expired access token', 401, 'TOKEN_INVALID'));
  }
};

export const requirePermission = (...requiredPermissions: Permission[]) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.adminUser) {
      return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    }

    // Super Admin bypasses all permission checks
    if (req.adminUser.isSuperAdmin || req.adminUser.role === 'Super Admin') {
      return next();
    }

    // Fetch permissions from assigned Role
    const role = await Role.findOne({ name: req.adminUser.role });
    const rolePermissions = role ? role.permissions : [];
    const userPermissions = [...new Set([...rolePermissions, ...(req.adminUser.customPermissions || [])])];

    const hasPermission = requiredPermissions.every((perm) => userPermissions.includes(perm));

    if (!hasPermission) {
      return next(
        new AppError(
          `Forbidden: Insufficient permissions. Required: [${requiredPermissions.join(', ')}]`,
          403,
          'FORBIDDEN',
        ),
      );
    }

    next();
  };
};

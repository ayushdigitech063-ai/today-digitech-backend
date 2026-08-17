import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AdminUser } from '../models/AdminUser';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';
import { logAuditAction } from '../utils/auditLogger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { env } from '../config/env';
import * as notificationService from '../utils/notificationService';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

const toAuthUser = (user: InstanceType<typeof AdminUser>) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  permissions: user.customPermissions,
  isActive: user.isActive,
  isSuperAdmin: user.isSuperAdmin,
  lastLoginAt: user.lastLoginAt?.toISOString(),
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await AdminUser.findOne({ email }).select('+passwordHash');
    if (!user) {
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      return next(
        new AppError(
          `Account locked due to multiple failed login attempts. Try again in ${remainingMinutes} minutes.`,
          423,
          'ACCOUNT_LOCKED',
        ),
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementFailedLogin();
      await logAuditAction(req, 'LOGIN_FAILED', 'Auth', { email }, undefined, email);
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    if (!user.isActive) {
      return next(new AppError('Account is disabled. Contact system administrator.', 403, 'ACCOUNT_DISABLED'));
    }

    // Reset failed login attempts on successful login
    await user.resetFailedLogin();

    // Filter out expired sessions (older than 7 days)
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    user.sessions = (user.sessions || []).filter(
      (s) => s.lastActiveAt && now - new Date(s.lastActiveAt).getTime() < SEVEN_DAYS_MS,
    );

    const userAgent = req.get('user-agent') || 'Unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';

    // Check if an active session already exists for this same user-agent & IP address
    const existingSessionIndex = user.sessions.findIndex(
      (s) => s.userAgent === userAgent && s.ipAddress === ipAddress,
    );

    let sessionId: string;
    if (existingSessionIndex !== -1) {
      sessionId = user.sessions[existingSessionIndex].sessionId;
    } else {
      sessionId = crypto.randomBytes(16).toString('hex');
    }

    const tokenPayload = {
      adminId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    if (existingSessionIndex !== -1) {
      user.sessions[existingSessionIndex].refreshToken = refreshToken;
      user.sessions[existingSessionIndex].previousRefreshToken = undefined;
      user.sessions[existingSessionIndex].tokenRotatedAt = undefined;
      user.sessions[existingSessionIndex].lastActiveAt = new Date();
    } else {
      user.sessions.push({
        sessionId,
        refreshToken,
        userAgent,
        ipAddress,
        lastActiveAt: new Date(),
      });
    }

    // Keep max 10 active sessions per admin user
    if (user.sessions.length > 10) {
      user.sessions = user.sessions.slice(-10);
    }

    await user.save();

    // Set Refresh Token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    await logAuditAction(req, 'LOGIN_SUCCESS', 'Auth', { email: user.email }, user.id, user.email);

    sendSuccess(
      res,
      {
        user: toAuthUser(user),
        accessToken,
      },
      'Admin authentication successful',
    );
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      return next(new AppError('Refresh token required', 401, 'REFRESH_TOKEN_REQUIRED'));
    }

    const payload = verifyRefreshToken(token);
    const user = await AdminUser.findById(payload.adminId);

    if (!user || !user.isActive) {
      return next(new AppError('User not found or inactive', 401, 'UNAUTHORIZED'));
    }

    const targetSession = user.sessions.find(
      (session) => session.sessionId === payload.sessionId,
    );

    if (!targetSession) {
      return next(
        new AppError(
          'Refresh session not found or revoked',
          401,
          'REFRESH_TOKEN_INVALID',
        ),
      );
    }

    const cleanPayload = {
      adminId: user.id,
      email: user.email,
      role: user.role,
      sessionId: targetSession.sessionId,
    };

    // Check if stored refresh token matches current request token
    if (targetSession.refreshToken === token) {
      // Normal rotation flow
      const newAccessToken = generateAccessToken(cleanPayload);
      const newRefreshToken = generateRefreshToken(cleanPayload);

      targetSession.previousRefreshToken = token;
      targetSession.tokenRotatedAt = new Date();
      targetSession.refreshToken = newRefreshToken;
      targetSession.lastActiveAt = new Date();

      await user.save();

      res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

      sendSuccess(
        res,
        {
          accessToken: newAccessToken,
          user: toAuthUser(user),
        },
        'Access token refreshed successfully',
      );
      return;
    }

    // Grace Window Check (30 seconds):
    // If request token matches previousRefreshToken and token was rotated less than 30s ago
    const GRACE_PERIOD_MS = 30 * 1000;
    if (
      targetSession.previousRefreshToken === token &&
      targetSession.tokenRotatedAt &&
      Date.now() - new Date(targetSession.tokenRotatedAt).getTime() < GRACE_PERIOD_MS
    ) {
      const newAccessToken = generateAccessToken(cleanPayload);
      res.cookie('refreshToken', targetSession.refreshToken, COOKIE_OPTIONS);

      sendSuccess(
        res,
        {
          accessToken: newAccessToken,
          user: toAuthUser(user),
        },
        'Access token refreshed successfully (grace window)',
      );
      return;
    }

    // Mismatch outside grace window -> Revoke compromised session
    user.sessions = user.sessions.filter((s) => s.sessionId !== payload.sessionId);
    await user.save();

    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    return next(
      new AppError(
        'Refresh token mismatch or session revoked',
        401,
        'REFRESH_TOKEN_INVALID',
      ),
    );
  } catch (error: any) {
    console.error('REFRESH TOKEN CONTROLLER ERROR:', error);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    next(
      new AppError(
        error.message || 'Invalid or expired refresh token',
        401,
        'REFRESH_TOKEN_INVALID',
      ),
    );
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.adminUser && req.tokenPayload) {
      req.adminUser.sessions = req.adminUser.sessions.filter(
        (s) => s.sessionId !== req.tokenPayload?.sessionId,
      );
      await req.adminUser.save();
      await logAuditAction(req, 'LOGOUT', 'Auth', {}, req.adminUser.id, req.adminUser.email);
    }

    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.adminUser!;
    sendSuccess(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.customPermissions,
        isActive: user.isActive,
        isSuperAdmin: user.isSuperAdmin,
        lastLoginAt: user.lastLoginAt?.toISOString(),
        createdAt: user.createdAt.toISOString(),
      },
      'Admin profile fetched successfully',
    );
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.adminUser!;
    const { name } = req.body;

    if (name) user.name = name;
    await user.save();

    await logAuditAction(req, 'UPDATE_PROFILE', 'AdminUser', { name }, user.id, user.email);

    sendSuccess(res, { id: user.id, name: user.name, email: user.email }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await AdminUser.findById(req.adminUser!.id).select('+passwordHash');
    if (!user) return next(new AppError('User not found', 444, 'NOT_FOUND'));

    const { currentPassword, newPassword } = req.body;

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password incorrect', 400, 'INVALID_CURRENT_PASSWORD'));
    }

    const bcrypt = await import('bcryptjs');
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.sessions = []; // Revoke all sessions on password change
    await user.save();

    await logAuditAction(req, 'CHANGE_PASSWORD', 'AdminUser', {}, user.id, user.email);

    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    sendSuccess(res, null, 'Password changed successfully. Please login again.');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await AdminUser.findOne({ email });

    if (!user) {
      // Return success to prevent email enumeration
      sendSuccess(res, null, 'If that email exists, a password reset link has been issued');
      return;
    }

    const resetToken = user.createPasswordResetToken();
    await user.save();

    await logAuditAction(req, 'FORGOT_PASSWORD_REQUEST', 'Auth', { email }, user.id, user.email);

    const resetUrl = new URL('/reset-password', env.FRONTEND_URL);
    resetUrl.searchParams.set('token', resetToken);

    try {
      await notificationService.sendPasswordResetEmail(user.email, resetToken, resetUrl.toString());
    } catch {
      console.error(
        JSON.stringify({
          event: 'password_reset_email_dispatch_failure',
          recipient: user.email,
          failureCategory: 'notification_service',
        }),
      );
    }

    sendSuccess(res, null, 'If an account exists, a password reset email has been sent.');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await AdminUser.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400, 'INVALID_RESET_TOKEN'));
    }

    const bcrypt = await import('bcryptjs');
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.sessions = [];
    await user.save();

    await logAuditAction(req, 'RESET_PASSWORD_SUCCESS', 'Auth', { email: user.email }, user.id, user.email);

    sendSuccess(res, null, 'Password reset successful. Please login with your new password.');
  } catch (error) {
    next(error);
  }
};

export const getActiveSessions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.adminUser!;
    const sessions = user.sessions.map((s) => ({
      sessionId: s.sessionId,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      lastActiveAt: s.lastActiveAt.toISOString(),
      isCurrent: s.sessionId === req.tokenPayload?.sessionId,
    }));

    sendSuccess(res, sessions, 'Active sessions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const revokeSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const user = req.adminUser!;

    user.sessions = user.sessions.filter((s) => s.sessionId !== sessionId);
    await user.save();

    await logAuditAction(req, 'REVOKE_SESSION', 'Auth', { sessionId }, user.id, user.email);

    sendSuccess(res, null, 'Session revoked successfully');
  } catch (error) {
    next(error);
  }
};

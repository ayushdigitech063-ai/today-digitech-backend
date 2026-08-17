import { Request } from 'express';
import { AuditLog } from '../models/AuditLog';

export const logAuditAction = async (
  req: Request,
  action: string,
  resource: string,
  details?: Record<string, any>,
  adminId?: string,
  adminEmail?: string,
): Promise<void> => {
  try {
    await AuditLog.create({
      adminUserId: adminId || (req as any).adminUser?.id,
      adminEmail: adminEmail || (req as any).adminUser?.email,
      action,
      resource,
      details,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    });
  } catch (error) {
    console.error('❌ [AuditLog Error]: Failed to create audit log entry:', error);
  }
};

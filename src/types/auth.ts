export type AdminRoleName =
  | 'Super Admin'
  | 'Admin'
  | 'Content Manager'
  | 'SEO Manager'
  | 'Sales Manager'
  | 'Sales Executive'
  | 'Viewer';

export type Permission =
  | 'MANAGE_USERS'
  | 'MANAGE_ROLES'
  | 'MANAGE_CONTENT'
  | 'MANAGE_SEO'
  | 'MANAGE_INQUIRIES'
  | 'MANAGE_SETTINGS'
  | 'VIEW_AUDIT_LOGS'
  | 'VIEW_ANALYTICS'
  | 'VIEW_ONLY';

export interface AdminUserDTO {
  id: string;
  name: string;
  email: string;
  role: AdminRoleName;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionDTO {
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
  lastActiveAt: string;
}

export interface AuthLoginResponse {
  user: AdminUserDTO;
  accessToken: string;
}

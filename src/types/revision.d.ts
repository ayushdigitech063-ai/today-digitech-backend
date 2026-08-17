import { BaseCmsItem } from './cms';
export type AuditAction = 'CREATE' | 'UPDATE' | 'PUBLISH' | 'UNPUBLISH' | 'SCHEDULE' | 'ARCHIVE' | 'RESTORE' | 'DELETE' | 'ROLLBACK' | 'LOGIN' | 'LOGOUT';
export interface ContentRevisionDTO extends BaseCmsItem {
    entityType: string;
    entityId: string;
    versionNumber: number;
    snapshot: Record<string, unknown>;
    createdBy: string;
    changeSummary?: string;
    actionType: AuditAction;
}
export interface AuditLogEntryDTO {
    id: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    adminId?: string;
    adminEmail: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}
//# sourceMappingURL=revision.d.ts.map
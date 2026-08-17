import { Router } from 'express';
import {
  getRecentRevisions,
  getRevisions,
  getRevisionById,
  rollbackRevision,
  archiveEntity,
  restoreEntity,
  getAuditLogs,
} from '../../controllers/revision.controller';
import { authenticateAdmin, requirePermission } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticateAdmin);

// Revisions
router.get('/revisions', requirePermission('VIEW_AUDIT_LOGS'), getRecentRevisions);
router.get('/revisions/:entityType/:entityId', requirePermission('MANAGE_CONTENT'), getRevisions);
router.get('/revisions/:id', requirePermission('MANAGE_CONTENT'), getRevisionById);
router.post('/revisions/:id/rollback', requirePermission('MANAGE_CONTENT'), rollbackRevision);

// Soft-deletion Governance
router.patch('/governance/archive/:entityType/:entityId', requirePermission('MANAGE_CONTENT'), archiveEntity);
router.patch('/governance/restore/:entityType/:entityId', requirePermission('MANAGE_CONTENT'), restoreEntity);

// Audit Logs
router.get('/audit-logs', requirePermission('VIEW_AUDIT_LOGS'), getAuditLogs);

export default router;

import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  updateLead,
  bulkUpdateLeadStatus,
  exportLeadsCSV,
} from '../../controllers/lead.controller';
import { authenticateAdmin, requirePermission } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticateAdmin);

router.get('/', requirePermission('MANAGE_INQUIRIES'), getLeads);
router.get('/export/csv', requirePermission('MANAGE_INQUIRIES'), exportLeadsCSV);
router.get('/:id', requirePermission('MANAGE_INQUIRIES'), getLeadById);
router.patch('/:id', requirePermission('MANAGE_INQUIRIES'), updateLead);
router.post('/bulk-status', requirePermission('MANAGE_INQUIRIES'), bulkUpdateLeadStatus);

export default router;

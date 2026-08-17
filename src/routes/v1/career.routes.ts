import { Router } from 'express';
import {
  getAdminJobs,
  getApplications,
  getApplicationById,
  updateApplication,
  getResumeSignedUrl,
} from '../../controllers/career.controller';
import { authenticateAdmin, requirePermission } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticateAdmin);

router.get('/jobs', requirePermission('MANAGE_CONTENT'), getAdminJobs);
router.get('/applications', requirePermission('MANAGE_CONTENT'), getApplications);
router.get('/applications/:id', requirePermission('MANAGE_CONTENT'), getApplicationById);
router.patch('/applications/:id', requirePermission('MANAGE_CONTENT'), updateApplication);
router.get('/applications/:id/resume', requirePermission('MANAGE_CONTENT'), getResumeSignedUrl);

export default router;

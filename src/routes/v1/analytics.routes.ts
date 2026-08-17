import { Router } from 'express';
import { getDashboardAnalytics } from '../../controllers/analytics.controller';
import { authenticateAdmin, requirePermission } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticateAdmin);
router.get('/dashboard', requirePermission('VIEW_ANALYTICS'), getDashboardAnalytics);

export default router;

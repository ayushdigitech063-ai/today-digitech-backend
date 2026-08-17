import { Router } from 'express';
import {
  getAdminNavigation,
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
  reorderNavigationItems,
} from '../../controllers/navigation.controller';
import { authenticateAdmin, requirePermission } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticateAdmin);

router.get('/', requirePermission('MANAGE_SETTINGS'), getAdminNavigation);
router.post('/', requirePermission('MANAGE_SETTINGS'), createNavigationItem);
router.post('/reorder', requirePermission('MANAGE_SETTINGS'), reorderNavigationItems);
router.patch('/:id', requirePermission('MANAGE_SETTINGS'), updateNavigationItem);
router.delete('/:id', requirePermission('MANAGE_SETTINGS'), deleteNavigationItem);

export default router;

import { Router } from 'express';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '../../controllers/adminUser.controller';
import { authenticateAdmin, requirePermission } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticateAdmin);

router.get('/', requirePermission('MANAGE_USERS'), getAdminUsers);
router.post('/', requirePermission('MANAGE_USERS'), createAdminUser);
router.patch('/:id', requirePermission('MANAGE_USERS'), updateAdminUser);
router.delete('/:id', requirePermission('MANAGE_USERS'), deleteAdminUser);

export default router;

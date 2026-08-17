import { Router } from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../../controllers/role.controller';
import { authenticateAdmin, requirePermission } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticateAdmin);

router.get('/', requirePermission('MANAGE_ROLES'), getRoles);
router.post('/', requirePermission('MANAGE_ROLES'), createRole);
router.patch('/:id', requirePermission('MANAGE_ROLES'), updateRole);
router.delete('/:id', requirePermission('MANAGE_ROLES'), deleteRole);

export default router;

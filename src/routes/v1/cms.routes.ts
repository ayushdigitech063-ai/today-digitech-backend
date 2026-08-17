import { Router } from 'express';
import {
  getCmsList,
  createCmsItem,
  updateCmsItem,
  deleteCmsItem,
  duplicateCmsItem,
  togglePublishCmsItem,
} from '../../controllers/cms.controller';
import { authenticateAdmin, requirePermission } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticateAdmin);

router.get('/:module', requirePermission('MANAGE_CONTENT'), getCmsList);
router.post('/:module', requirePermission('MANAGE_CONTENT'), createCmsItem);
router.patch('/:module/:id', requirePermission('MANAGE_CONTENT'), updateCmsItem);
router.put('/:module/:id', requirePermission('MANAGE_CONTENT'), updateCmsItem);
router.delete('/:module/:id', requirePermission('MANAGE_CONTENT'), deleteCmsItem);
router.post('/:module/:id/duplicate', requirePermission('MANAGE_CONTENT'), duplicateCmsItem);
router.post('/:module/:id/toggle-publish', requirePermission('MANAGE_CONTENT'), togglePublishCmsItem);

export default router;

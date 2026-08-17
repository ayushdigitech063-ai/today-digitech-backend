import { Router } from 'express';
import {
  uploadSingleMedia,
  uploadMultipleMedia,
  getMediaList,
  updateMediaMetadata,
  replaceMedia,
  deleteMedia,
} from '../../controllers/media.controller';
import { authenticateAdmin, requirePermission } from '../../middlewares/auth.middleware';
import { uploadMiddleware } from '../../middlewares/upload.middleware';

const router = Router();

router.use(authenticateAdmin);

router.get('/', requirePermission('MANAGE_CONTENT'), getMediaList);
router.post('/upload', requirePermission('MANAGE_CONTENT'), uploadMiddleware.single('file'), uploadSingleMedia);
router.post('/upload-multiple', requirePermission('MANAGE_CONTENT'), uploadMiddleware.array('files', 10), uploadMultipleMedia);
router.patch('/:id', requirePermission('MANAGE_CONTENT'), updateMediaMetadata);
router.put('/:id', requirePermission('MANAGE_CONTENT'), uploadMiddleware.single('file'), replaceMedia);
router.delete('/:id', requirePermission('MANAGE_CONTENT'), deleteMedia);

export default router;

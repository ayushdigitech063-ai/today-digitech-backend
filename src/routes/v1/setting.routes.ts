import { Router, Request, Response } from 'express';
import { getAdminSettings, updateSettings } from '../../controllers/setting.controller';
import { authenticateAdmin, requirePermission } from '../../middlewares/auth.middleware';

import { uploadMiddleware } from '../../middlewares/upload.middleware';

const router = Router();

router.use(authenticateAdmin);

router.get('/', requirePermission('MANAGE_SETTINGS'), getAdminSettings);
router.patch('/', requirePermission('MANAGE_SETTINGS'), updateSettings);
router.post('/hero-image', requirePermission('MANAGE_SETTINGS'), uploadMiddleware.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({ success: true, data: { url: fileUrl }, message: 'Hero banner image uploaded successfully via Multer!' });
});

export default router;

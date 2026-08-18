import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { getAdminSettings, updateSettings } from '../../controllers/setting.controller';
import { authenticateAdmin, requirePermission } from '../../middlewares/auth.middleware';
import { uploadMiddleware, frontendUploadDir } from '../../middlewares/upload.middleware';

const router = Router();

router.use(authenticateAdmin);

router.get('/', requirePermission('MANAGE_SETTINGS'), getAdminSettings);
router.patch('/', requirePermission('MANAGE_SETTINGS'), updateSettings);
router.post('/hero-image', requirePermission('MANAGE_SETTINGS'), uploadMiddleware.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded' });
  }

  // Dual-sync: copy uploaded file to frontend/public/uploads so both frontend & backend serve it 100% reliably
  try {
    const frontendDest = path.join(frontendUploadDir, req.file.filename);
    fs.copyFileSync(req.file.path, frontendDest);
  } catch (err) {
    console.error('Frontend upload sync notice:', err);
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({ success: true, data: { url: fileUrl }, message: 'Hero banner image uploaded successfully via Multer!' });
});

export default router;

import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import adminUserRoutes from './adminUser.routes';
import roleRoutes from './role.routes';
import mediaRoutes from './media.routes';
import publicRoutes from './public.routes';
import settingRoutes from './setting.routes';
import navigationRoutes from './navigation.routes';
import cmsRoutes from './cms.routes';
import leadRoutes from './lead.routes';
import careerRoutes from './career.routes';
import analyticsRoutes from './analytics.routes';
import revisionRoutes from './revision.routes';

const router = Router();

router.use('/public', publicRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', adminUserRoutes);
router.use('/roles', roleRoutes);
router.use('/media', mediaRoutes);
router.use('/settings', settingRoutes);
router.use('/navigation', navigationRoutes);
router.use('/cms', cmsRoutes);
router.use('/leads', leadRoutes);
router.use('/careers', careerRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/governance', revisionRoutes);

export default router;

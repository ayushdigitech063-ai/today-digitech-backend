import { Router } from 'express';
import { getSystemHealth, getDatabaseHealth } from '../../controllers/health.controller';

const router = Router();

router.get('/', getSystemHealth);
router.get('/database', getDatabaseHealth);

export default router;

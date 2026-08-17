import { Router } from 'express';
import {
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getActiveSessions,
  revokeSession,
} from '../../controllers/auth.controller';
import { authenticateAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Public auth endpoints
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Authenticated auth endpoints
router.post('/logout', authenticateAdmin, logout);
router.get('/me', authenticateAdmin, getProfile);
router.patch('/me', authenticateAdmin, updateProfile);
router.post('/change-password', authenticateAdmin, changePassword);
router.get('/sessions', authenticateAdmin, getActiveSessions);
router.delete('/sessions/:sessionId', authenticateAdmin, revokeSession);

export default router;

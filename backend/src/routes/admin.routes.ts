import { Router } from 'express';
import {
  loginHandler,
  getStatsHandler,
  getVerificationsHandler,
  getUserHandler,
  approveUserHandler,
  rejectUserHandler,
  flagUserHandler,
  getUsersHandler,
} from '../controllers/admin.controller';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';

const router = Router();

// Public
router.post('/login', loginHandler);

// Protected
router.get('/stats', adminAuthMiddleware, getStatsHandler);
router.get('/verifications', adminAuthMiddleware, getVerificationsHandler);
router.get('/verifications/:id', adminAuthMiddleware, getUserHandler);
router.put('/verifications/:id/approve', adminAuthMiddleware, approveUserHandler);
router.put('/verifications/:id/reject', adminAuthMiddleware, rejectUserHandler);
router.put('/verifications/:id/flag', adminAuthMiddleware, flagUserHandler);
router.get('/users', adminAuthMiddleware, getUsersHandler);

export default router;
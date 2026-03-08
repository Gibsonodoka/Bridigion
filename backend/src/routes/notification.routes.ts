import { Router } from 'express';
import { userAuthMiddleware } from '../middlewares/userAuth.middleware';
import { companyAuthMiddleware } from '../middlewares/companyAuth.middleware';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';
import {
  getUserNotificationsHandler,
  getCompanyNotificationsHandler,
  getAdminNotificationsHandler,
  markAllReadHandler,
  markOneReadHandler,
} from '../controllers/notification.controller';

const router = Router();

router.get('/user', userAuthMiddleware, getUserNotificationsHandler);
router.get('/company', companyAuthMiddleware, getCompanyNotificationsHandler);
router.get('/admin', adminAuthMiddleware, getAdminNotificationsHandler);
router.put('/read-all', userAuthMiddleware, markAllReadHandler);
router.put('/read-all/company', companyAuthMiddleware, markAllReadHandler);
router.put('/read-all/admin', adminAuthMiddleware, markAllReadHandler);
router.put('/:id/read', userAuthMiddleware, markOneReadHandler);

export default router;
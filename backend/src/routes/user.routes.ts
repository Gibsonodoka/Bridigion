import { Router } from 'express';
import {
  loginSendOtpHandler,
  loginVerifyOtpHandler,
  getProfileHandler,
  updateProfileHandler,
  getStatusHandler,
} from '../controllers/user.controller';
import { userAuthMiddleware } from '../middlewares/userAuth.middleware';

const router = Router();

// Public - Login
router.post('/login/send-otp', loginSendOtpHandler);
router.post('/login/verify-otp', loginVerifyOtpHandler);

// Protected
router.get('/profile', userAuthMiddleware, getProfileHandler);
router.put('/profile', userAuthMiddleware, updateProfileHandler);
router.get('/status', userAuthMiddleware, getStatusHandler);

export default router;
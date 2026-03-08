import { Router } from 'express';
import {
  sendOtpHandler,
  verifyOtpHandler,
  completeProfile,
  selectRole,
} from '../controllers/auth.controller';

const router = Router();

router.post('/send-otp', sendOtpHandler);
router.post('/verify-otp', verifyOtpHandler);
router.post('/complete-profile', completeProfile);
router.post('/select-role', selectRole);

export default router;
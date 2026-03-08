import { Router } from 'express';
import {
  verifyNinHandler,
  uploadSelfieHandler,
  submitDocumentsHandler,
} from '../controllers/verification.controller';

const router = Router();

router.post('/nin', verifyNinHandler);
router.post('/selfie', uploadSelfieHandler);
router.post('/submit', submitDocumentsHandler);

export default router;
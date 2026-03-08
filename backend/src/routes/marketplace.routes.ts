import { Router } from 'express';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';
import { userAuthMiddleware } from '../middlewares/userAuth.middleware';
import { companyAuthMiddleware } from '../middlewares/companyAuth.middleware';
import {
  companyRegisterHandler, companyLoginHandler, companyProfileHandler,
  companyGetJobsHandler, companyCreateJobHandler,
  companyGetApplicationsHandler, companyUpdateApplicationHandler,
  companyGetTalentHandler,
  userGetJobsHandler, userGetJobHandler,
  userApplyJobHandler, userGetApplicationsHandler,
  adminGetCompaniesHandler, adminUpdateCompanyHandler,
  adminGetJobsHandler, adminUpdateJobHandler, adminCreateJobHandler,
} from '../controllers/marketplace.controller';

const router = Router();

// ─── Company Auth ─────────────────────────────────────────────────────────────
router.post('/company/register', companyRegisterHandler);
router.post('/company/login', companyLoginHandler);
router.get('/company/profile', companyAuthMiddleware, companyProfileHandler);

// ─── Company: Jobs ────────────────────────────────────────────────────────────
router.get('/company/jobs', companyAuthMiddleware, companyGetJobsHandler);
router.post('/company/jobs', companyAuthMiddleware, companyCreateJobHandler);
router.get('/company/jobs/:jobId/applications', companyAuthMiddleware, companyGetApplicationsHandler);
router.put('/company/applications/:id', companyAuthMiddleware, companyUpdateApplicationHandler);
router.get('/company/talent', companyAuthMiddleware, companyGetTalentHandler);

// ─── User: Jobs ───────────────────────────────────────────────────────────────
router.get('/jobs', userAuthMiddleware, userGetJobsHandler);
router.get('/jobs/:id', userAuthMiddleware, userGetJobHandler);
router.post('/jobs/:id/apply', userAuthMiddleware, userApplyJobHandler);
router.get('/applications', userAuthMiddleware, userGetApplicationsHandler);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/admin/companies', adminAuthMiddleware, adminGetCompaniesHandler);
router.put('/admin/companies/:id', adminAuthMiddleware, adminUpdateCompanyHandler);
router.get('/admin/jobs', adminAuthMiddleware, adminGetJobsHandler);
router.put('/admin/jobs/:id', adminAuthMiddleware, adminUpdateJobHandler);
router.post('/admin/jobs', adminAuthMiddleware, adminCreateJobHandler);

export default router;
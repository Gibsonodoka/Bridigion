import { Router } from 'express';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';
import { userAuthMiddleware } from '../middlewares/userAuth.middleware';
import { companyAuthMiddleware } from '../middlewares/companyAuth.middleware';
import {
  userGetFeedHandler, userCreatePostHandler, userGetPostHandler,
  userGetMyPostsHandler, userAddCommentHandler, userDeleteCommentHandler,
  userToggleReactionHandler, userFollowUserHandler, userFollowCompanyHandler,
  companyCreatePostHandler, companyGetPostsHandler,
  companyAddCommentHandler, companyToggleReactionHandler,
  adminCreatePostHandler, adminGetPendingPostsHandler,
  adminGetAllPostsHandler, adminModeratePostHandler,
} from '../controllers/community.controller';

const router = Router();

// ─── User ──────────────────────────────────────────────────────────────────
router.get('/feed', userAuthMiddleware, userGetFeedHandler);
router.post('/posts', userAuthMiddleware, userCreatePostHandler);
router.get('/posts/mine', userAuthMiddleware, userGetMyPostsHandler);  // ← MUST be before /posts/:id
router.get('/posts/:id', userAuthMiddleware, userGetPostHandler);
router.post('/posts/:id/comments', userAuthMiddleware, userAddCommentHandler);
router.delete('/posts/:id/comments/:commentId', userAuthMiddleware, userDeleteCommentHandler);
router.post('/posts/:id/react', userAuthMiddleware, userToggleReactionHandler);
router.post('/follow/user/:userId', userAuthMiddleware, userFollowUserHandler);
router.post('/follow/company/:companyId', userAuthMiddleware, userFollowCompanyHandler);

// ─── Company ───────────────────────────────────────────────────────────────
router.post('/company/posts', companyAuthMiddleware, companyCreatePostHandler);
router.get('/company/posts', companyAuthMiddleware, companyGetPostsHandler);
router.post('/company/posts/:id/comments', companyAuthMiddleware, companyAddCommentHandler);
router.post('/company/posts/:id/react', companyAuthMiddleware, companyToggleReactionHandler);

// ─── Admin ─────────────────────────────────────────────────────────────────
router.post('/admin/posts', adminAuthMiddleware, adminCreatePostHandler);
router.get('/admin/posts/pending', adminAuthMiddleware, adminGetPendingPostsHandler);  // ← MUST be before /admin/posts/:id
router.get('/admin/posts', adminAuthMiddleware, adminGetAllPostsHandler);
router.put('/admin/posts/:id/moderate', adminAuthMiddleware, adminModeratePostHandler);

export default router;
import { Router } from 'express';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';
import { userAuthMiddleware } from '../middlewares/userAuth.middleware';
import {
  adminGetCoursesHandler, adminGetCourseHandler,
  adminCreateCourseHandler, adminUpdateCourseHandler, adminDeleteCourseHandler,
  adminCreateLessonHandler, adminUpdateLessonHandler, adminDeleteLessonHandler,
  adminCreateQuizQuestionHandler,
  userGetCoursesHandler, userGetCourseHandler, userEnrollHandler,
  userGetLessonHandler, userCompleteLessonHandler,
  userSubmitQuizHandler, userGetEnrollmentsHandler,
} from '../controllers/lms.controller';

const router = Router();

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get('/admin/courses', adminAuthMiddleware, adminGetCoursesHandler);
router.post('/admin/courses', adminAuthMiddleware, adminCreateCourseHandler);
router.get('/admin/courses/:id', adminAuthMiddleware, adminGetCourseHandler);
router.put('/admin/courses/:id', adminAuthMiddleware, adminUpdateCourseHandler);
router.delete('/admin/courses/:id', adminAuthMiddleware, adminDeleteCourseHandler);

router.post('/admin/courses/:courseId/lessons', adminAuthMiddleware, adminCreateLessonHandler);
router.put('/admin/courses/:courseId/lessons/:lessonId', adminAuthMiddleware, adminUpdateLessonHandler);
router.delete('/admin/courses/:courseId/lessons/:lessonId', adminAuthMiddleware, adminDeleteLessonHandler);

router.post('/admin/lessons/:lessonId/questions', adminAuthMiddleware, adminCreateQuizQuestionHandler);

// ─── User Routes ──────────────────────────────────────────────────────────────
router.get('/courses', userAuthMiddleware, userGetCoursesHandler);
router.get('/courses/:id', userAuthMiddleware, userGetCourseHandler);
router.post('/courses/:id/enroll', userAuthMiddleware, userEnrollHandler);
router.get('/enrollments', userAuthMiddleware, userGetEnrollmentsHandler);

router.get('/courses/:id/lessons/:lessonId', userAuthMiddleware, userGetLessonHandler);
router.post('/lessons/:lessonId/complete', userAuthMiddleware, userCompleteLessonHandler);
router.post('/lessons/:lessonId/quiz', userAuthMiddleware, userSubmitQuizHandler);

export default router;
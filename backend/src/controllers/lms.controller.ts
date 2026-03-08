import { Response, NextFunction } from 'express';
import { AdminRequest } from '../middlewares/adminAuth.middleware';
import { UserRequest } from '../middlewares/userAuth.middleware';
import {
  createCourse, updateCourse, deleteCourse,
  createLesson, updateLesson, deleteLesson,
  createQuizQuestion, getAllCoursesAdmin, getCourseWithLessons,
  getPublishedCourses, enrollUser, getCourseForUser,
  getLessonForUser, completeLesson, submitQuiz, getUserEnrollments,
} from '../services/lms.service';

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export const adminGetCoursesHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const result = await getAllCoursesAdmin(page);
    res.status(200).json({ status: 'success', data: result.data, meta: { total: result.total, page } });
  } catch (error) { next(error); }
};

export const adminGetCourseHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const course = await getCourseWithLessons(id);
    if (!course) { res.status(404).json({ status: 'error', message: 'Course not found.' }); return; }
    res.status(200).json({ status: 'success', data: course });
  } catch (error) { next(error); }
};

export const adminCreateCourseHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, thumbnail_url, role_target, duration_minutes } = req.body;
    if (!title) { res.status(400).json({ status: 'error', message: 'Title is required.' }); return; }
    const course = await createCourse({ title, description, thumbnail_url, role_target, duration_minutes, created_by: req.admin!.id });
    if (!course) { res.status(500).json({ status: 'error', message: 'Failed to create course.' }); return; }
    res.status(201).json({ status: 'success', message: 'Course created.', data: course });
  } catch (error) { next(error); }
};

export const adminUpdateCourseHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const course = await updateCourse(id, req.body);
    if (!course) { res.status(500).json({ status: 'error', message: 'Failed to update course.' }); return; }
    res.status(200).json({ status: 'success', message: 'Course updated.', data: course });
  } catch (error) { next(error); }
};

export const adminDeleteCourseHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const success = await deleteCourse(id);
    if (!success) { res.status(500).json({ status: 'error', message: 'Failed to delete course.' }); return; }
    res.status(200).json({ status: 'success', message: 'Course deleted.' });
  } catch (error) { next(error); }
};

export const adminCreateLessonHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content, video_url, type, order_index, duration_minutes } = req.body;
    const course_id = req.params.courseId as string;
    if (!title || !type) { res.status(400).json({ status: 'error', message: 'Title and type are required.' }); return; }
    const lesson = await createLesson({ course_id, title, content, video_url, type, order_index: order_index || 0, duration_minutes });
    if (!lesson) { res.status(500).json({ status: 'error', message: 'Failed to create lesson.' }); return; }
    res.status(201).json({ status: 'success', message: 'Lesson created.', data: lesson });
  } catch (error) { next(error); }
};

export const adminUpdateLessonHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.lessonId as string;
    const lesson = await updateLesson(id, req.body);
    if (!lesson) { res.status(500).json({ status: 'error', message: 'Failed to update lesson.' }); return; }
    res.status(200).json({ status: 'success', message: 'Lesson updated.', data: lesson });
  } catch (error) { next(error); }
};

export const adminDeleteLessonHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.lessonId as string;
    const success = await deleteLesson(id);
    if (!success) { res.status(500).json({ status: 'error', message: 'Failed to delete lesson.' }); return; }
    res.status(200).json({ status: 'success', message: 'Lesson deleted.' });
  } catch (error) { next(error); }
};

export const adminCreateQuizQuestionHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lesson_id = req.params.lessonId as string;
    const { question, options, correct_index, order_index } = req.body;
    if (!question || !options || correct_index === undefined) {
      res.status(400).json({ status: 'error', message: 'Question, options, and correct_index are required.' }); return;
    }
    const q = await createQuizQuestion({ lesson_id, question, options, correct_index, order_index: order_index || 0 });
    if (!q) { res.status(500).json({ status: 'error', message: 'Failed to create question.' }); return; }
    res.status(201).json({ status: 'success', message: 'Question created.', data: q });
  } catch (error) { next(error); }
};

// ─── USER ─────────────────────────────────────────────────────────────────────

export const userGetCoursesHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { data: user } = await import('../config/supabase').then(m =>
      m.supabaseAdmin.from('users').select('role').eq('id', userId).single()
    );
    const courses = await getPublishedCourses(userId, user?.role);
    res.status(200).json({ status: 'success', data: courses });
  } catch (error) { next(error); }
};

export const userGetCourseHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseId = req.params.id as string;
    const userId = req.user!.id;
    const course = await getCourseForUser(courseId, userId);
    if (!course) { res.status(404).json({ status: 'error', message: 'Course not found.' }); return; }
    res.status(200).json({ status: 'success', data: course });
  } catch (error) { next(error); }
};

export const userEnrollHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseId = req.params.id as string;
    const userId = req.user!.id;
    const enrollment = await enrollUser(userId, courseId);
    if (!enrollment) { res.status(500).json({ status: 'error', message: 'Failed to enroll.' }); return; }
    res.status(200).json({ status: 'success', message: 'Enrolled successfully.', data: enrollment });
  } catch (error) { next(error); }
};

export const userGetLessonHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lessonId = req.params.lessonId as string;
    const userId = req.user!.id;
    const lesson = await getLessonForUser(lessonId, userId);
    if (!lesson) { res.status(404).json({ status: 'error', message: 'Lesson not found.' }); return; }
    res.status(200).json({ status: 'success', data: lesson });
  } catch (error) { next(error); }
};

export const userCompleteLessonHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lessonId = req.params.lessonId as string;
    const { courseId } = req.body;
    const userId = req.user!.id;
    if (!courseId) { res.status(400).json({ status: 'error', message: 'courseId is required.' }); return; }
    const success = await completeLesson(userId, lessonId, courseId);
    if (!success) { res.status(500).json({ status: 'error', message: 'Failed to mark lesson complete.' }); return; }
    res.status(200).json({ status: 'success', message: 'Lesson marked as complete.' });
  } catch (error) { next(error); }
};

export const userSubmitQuizHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lessonId = req.params.lessonId as string;
    const { courseId, answers } = req.body;
    const userId = req.user!.id;
    if (!courseId || !answers) { res.status(400).json({ status: 'error', message: 'courseId and answers are required.' }); return; }
    const result = await submitQuiz(userId, lessonId, courseId, answers);
    if (!result) { res.status(500).json({ status: 'error', message: 'Failed to submit quiz.' }); return; }
    res.status(200).json({ status: 'success', data: result });
  } catch (error) { next(error); }
};

export const userGetEnrollmentsHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const enrollments = await getUserEnrollments(userId);
    res.status(200).json({ status: 'success', data: enrollments });
  } catch (error) { next(error); }
};
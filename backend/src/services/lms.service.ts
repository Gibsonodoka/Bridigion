import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/supabase';

dotenv.config();

// ─── ADMIN: Course Management ───────────────────────────────────────────────

export const createCourse = async (data: {
  title: string;
  description?: string;
  thumbnail_url?: string;
  role_target?: string;
  duration_minutes?: number;
  created_by: string;
}) => {
  const { data: course, error } = await supabaseAdmin
    .from('courses')
    .insert(data)
    .select()
    .single();

  if (error) { console.error('❌ Create course error:', error.message); return null; }
  return course;
};

export const updateCourse = async (id: string, data: {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  role_target?: string;
  status?: string;
  duration_minutes?: number;
}) => {
  const { data: course, error } = await supabaseAdmin
    .from('courses')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) { console.error('❌ Update course error:', error.message); return null; }
  return course;
};

export const deleteCourse = async (id: string) => {
  const { error } = await supabaseAdmin.from('courses').delete().eq('id', id);
  if (error) { console.error('❌ Delete course error:', error.message); return false; }
  return true;
};

export const createLesson = async (data: {
  course_id: string;
  title: string;
  content?: string;
  video_url?: string;
  type: string;
  order_index: number;
  duration_minutes?: number;
}) => {
  const { data: lesson, error } = await supabaseAdmin
    .from('lessons')
    .insert(data)
    .select()
    .single();

  if (error) { console.error('❌ Create lesson error:', error.message); return null; }
  return lesson;
};

export const updateLesson = async (id: string, data: {
  title?: string;
  content?: string;
  video_url?: string;
  type?: string;
  order_index?: number;
  duration_minutes?: number;
}) => {
  const { data: lesson, error } = await supabaseAdmin
    .from('lessons')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) { console.error('❌ Update lesson error:', error.message); return null; }
  return lesson;
};

export const deleteLesson = async (id: string) => {
  const { error } = await supabaseAdmin.from('lessons').delete().eq('id', id);
  if (error) { console.error('❌ Delete lesson error:', error.message); return false; }
  return true;
};

export const createQuizQuestion = async (data: {
  lesson_id: string;
  question: string;
  options: string[];
  correct_index: number;
  order_index: number;
}) => {
  const { data: question, error } = await supabaseAdmin
    .from('quiz_questions')
    .insert(data)
    .select()
    .single();

  if (error) { console.error('❌ Create quiz question error:', error.message); return null; }
  return question;
};

export const getAllCoursesAdmin = async (page = 1, limit = 20) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from('courses')
    .select('*, lessons(count)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) { console.error('❌ Get courses error:', error.message); return { data: [], total: 0 }; }
  return { data: data || [], total: count || 0 };
};

export const getCourseWithLessons = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select(`
      *,
      lessons (
        id, title, type, order_index, duration_minutes, content, video_url,
        quiz_questions (id, question, options, correct_index, order_index)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;

  // Sort lessons by order_index
  if (data.lessons) {
    data.lessons.sort((a: { order_index: number }, b: { order_index: number }) =>
      a.order_index - b.order_index
    );
  }

  return data;
};

// ─── USER: Course Browsing ───────────────────────────────────────────────────

export const getPublishedCourses = async (userId: string, role?: string) => {
  let query = supabaseAdmin
    .from('courses')
    .select(`
      id, title, description, thumbnail_url, role_target,
      duration_minutes, status, created_at,
      lessons(count),
      enrollments!left(id, status, progress_percent, user_id)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (role) {
    query = query.or(`role_target.eq.${role},role_target.is.null`);
  }

  const { data, error } = await query;
  if (error) { console.error('❌ Get published courses error:', error.message); return []; }

  // Filter enrollments to only current user
  return (data || []).map((course: Record<string, unknown>) => ({
    ...course,
    enrollment: Array.isArray(course.enrollments)
      ? (course.enrollments as Array<{ user_id: string }>).find((e) => e.user_id === userId) || null
      : null,
    enrollments: undefined,
  }));
};

export const enrollUser = async (userId: string, courseId: string) => {
  const { data, error } = await supabaseAdmin
    .from('enrollments')
    .upsert({ user_id: userId, course_id: courseId, status: 'enrolled' }, { onConflict: 'user_id,course_id' })
    .select()
    .single();

  if (error) { console.error('❌ Enroll error:', error.message); return null; }
  return data;
};

export const getCourseForUser = async (courseId: string, userId: string) => {
  const { data: course, error } = await supabaseAdmin
    .from('courses')
    .select(`
      *,
      lessons (
        id, title, type, order_index, duration_minutes,
        quiz_questions (id)
      )
    `)
    .eq('id', courseId)
    .eq('status', 'published')
    .single();

  if (error || !course) return null;

  // Get enrollment
  const { data: enrollment } = await supabaseAdmin
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  // Get lesson progress
  const { data: progress } = await supabaseAdmin
    .from('lesson_progress')
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .eq('course_id', courseId);

  const completedLessons = new Set((progress || []).filter((p: { completed: boolean }) => p.completed).map((p: { lesson_id: string }) => p.lesson_id));

  const lessons = (course.lessons || [])
    .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
    .map((lesson: Record<string, unknown>) => ({
      ...lesson,
      completed: completedLessons.has(lesson.id as string),
      has_quiz: Array.isArray(lesson.quiz_questions) && (lesson.quiz_questions as unknown[]).length > 0,
    }));

  return { ...course, lessons, enrollment };
};

export const getLessonForUser = async (lessonId: string, userId: string) => {
  const { data: lesson, error } = await supabaseAdmin
    .from('lessons')
    .select(`
      *,
      quiz_questions (id, question, options, order_index)
    `)
    .eq('id', lessonId)
    .single();

  if (error || !lesson) return null;

  // Get lesson progress
  const { data: progress } = await supabaseAdmin
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();

  // Get last quiz attempt
  const { data: quizAttempt } = await supabaseAdmin
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('attempted_at', { ascending: false })
    .limit(1)
    .single();

  // Sort quiz questions
  if (lesson.quiz_questions) {
    lesson.quiz_questions.sort((a: { order_index: number }, b: { order_index: number }) =>
      a.order_index - b.order_index
    );
  }

  return { ...lesson, progress: progress || null, lastQuizAttempt: quizAttempt || null };
};

export const completeLesson = async (userId: string, lessonId: string, courseId: string) => {
  // Mark lesson complete
  const { error } = await supabaseAdmin
    .from('lesson_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' });

  if (error) { console.error('❌ Complete lesson error:', error.message); return false; }

  // Recalculate course progress
  const { count: totalLessons } = await supabaseAdmin
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  const { count: completedLessons } = await supabaseAdmin
    .from('lesson_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('completed', true);

  const progressPercent = totalLessons
    ? Math.round(((completedLessons || 0) / totalLessons) * 100)
    : 0;

  const isComplete = progressPercent === 100;

  await supabaseAdmin
    .from('enrollments')
    .update({
      progress_percent: progressPercent,
      status: isComplete ? 'completed' : 'enrolled',
      completed_at: isComplete ? new Date().toISOString() : null,
    })
    .eq('user_id', userId)
    .eq('course_id', courseId);

  return true;
};

export const submitQuiz = async (
  userId: string,
  lessonId: string,
  courseId: string,
  answers: number[]
) => {
  // Get questions with correct answers
  const { data: questions, error } = await supabaseAdmin
    .from('quiz_questions')
    .select('id, correct_index, order_index')
    .eq('lesson_id', lessonId)
    .order('order_index');

  if (error || !questions) return null;

  const total = questions.length;
  let score = 0;

  questions.forEach((q: { correct_index: number }, index: number) => {
    if (answers[index] === q.correct_index) score++;
  });

  const passed = score / total >= 0.7; // 70% pass mark

  // Save attempt
  await supabaseAdmin.from('quiz_attempts').insert({
    user_id: userId,
    lesson_id: lessonId,
    score,
    total,
    passed,
  });

  // If passed, mark lesson complete
  if (passed) {
    await completeLesson(userId, lessonId, courseId);
  }

  return { score, total, passed, percentage: Math.round((score / total) * 100) };
};

export const getUserEnrollments = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('enrollments')
    .select(`
      id, status, progress_percent, enrolled_at, completed_at,
      courses (id, title, description, thumbnail_url, duration_minutes, role_target)
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });

  if (error) { console.error('❌ Get enrollments error:', error.message); return []; }
  return data || [];
};
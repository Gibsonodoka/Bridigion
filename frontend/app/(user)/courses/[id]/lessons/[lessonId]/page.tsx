'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { UserSidebar } from '@/components/user/UserSidebar';
import { VideoPlayer } from '@/components/lms/VideoPlayer';
import { QuizPlayer } from '@/components/lms/QuizPlayer';
import { Button } from '@/components/ui/button';

interface Lesson {
  id: string;
  title: string;
  type: string;
  content?: string;
  video_url?: string;
  duration_minutes?: number;
  course_id: string;
  quiz_questions?: Array<{ id: string; question: string; options: string[] }>;
  progress?: { completed: boolean } | null;
  lastQuizAttempt?: { score: number; total: number; passed: boolean } | null;
}

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const getToken = () => localStorage.getItem('user_token') || '';

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }

    authApi.lmsGetLesson(token, courseId, lessonId)
      .then(res => setLesson(res.data.data as Lesson))
      .catch(() => router.push(`/courses/${courseId}`))
      .finally(() => setLoading(false));
  }, [courseId, lessonId, router]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await authApi.lmsCompleteLesson(getToken(), lessonId, courseId);
      router.push(`/courses/${courseId}`);
    } finally {
      setCompleting(false);
    }
  };

  const handleQuizSubmit = async (answers: number[]) => {
    const res = await authApi.lmsSubmitQuiz(getToken(), lessonId, courseId, answers);
    return res.data.data as { score: number; total: number; passed: boolean; percentage: number };
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar />
      <main className="flex-1 p-8">
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="text-sm text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-1"
        >
          ← Back to Course
        </button>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-slate-200 rounded-xl h-32 animate-pulse" />)}
          </div>
        ) : lesson ? (
          <div className="max-w-3xl space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span className="capitalize">{lesson.type}</span>
                {lesson.duration_minutes && <span>· {lesson.duration_minutes} min</span>}
                {lesson.progress?.completed && (
                  <span className="text-green-600 font-medium">· ✓ Completed</span>
                )}
              </div>
            </div>

            {/* Video */}
            {lesson.type === 'video' && lesson.video_url && (
              <VideoPlayer url={lesson.video_url} title={lesson.title} />
            )}

            {/* Text Content */}
            {lesson.content && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                {lesson.content}
              </div>
            )}

            {/* Quiz */}
            {lesson.quiz_questions && lesson.quiz_questions.length > 0 && (
              <QuizPlayer
                questions={lesson.quiz_questions}
                onSubmit={handleQuizSubmit}
                lastAttempt={lesson.lastQuizAttempt}
              />
            )}

            {/* Complete Button */}
            {lesson.type !== 'quiz' && !lesson.progress?.completed && (
              <Button onClick={handleComplete} disabled={completing} className="w-full">
                {completing ? 'Marking complete...' : '✅ Mark as Complete'}
              </Button>
            )}

            {lesson.progress?.completed && lesson.type !== 'quiz' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-700 font-medium text-sm">
                ✅ Lesson completed! Go back to continue the course.
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500">Lesson not found.</p>
        )}
      </main>
    </div>
  );
}
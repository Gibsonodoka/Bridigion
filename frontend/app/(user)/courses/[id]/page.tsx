'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { UserSidebar } from '@/components/user/UserSidebar';
import { LessonList } from '@/components/lms/LessonList';
import { ProgressBar } from '@/components/lms/ProgressBar';
import { Button } from '@/components/ui/button';

interface Course {
  id: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  role_target?: string;
  lessons: Array<{ id: string; title: string; type: string; duration_minutes?: number; completed?: boolean; has_quiz?: boolean }>;
  enrollment?: { status: string; progress_percent: number } | null;
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const getToken = () => localStorage.getItem('user_token') || '';

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }

    authApi.lmsGetCourse(token, id)
      .then(res => setCourse(res.data.data as Course))
      .catch(() => router.push('/courses'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await authApi.lmsEnroll(getToken(), id);
      const res = await authApi.lmsGetCourse(getToken(), id);
      setCourse(res.data.data as Course);
    } finally {
      setEnrolling(false);
    }
  };

  const firstLesson = course?.lessons?.[0];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar />
      <main className="flex-1 p-8">
        <button
          onClick={() => router.push('/courses')}
          className="text-sm text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-1"
        >
          ← Back to Courses
        </button>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-slate-200 rounded-xl h-32 animate-pulse" />)}
          </div>
        ) : course ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left — Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{course.title}</h1>
                    {course.description && (
                      <p className="text-slate-600 text-sm">{course.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                      <span>📖 {course.lessons?.length || 0} lessons</span>
                      {course.duration_minutes && <span>⏱ {course.duration_minutes} min</span>}
                      {course.role_target && <span className="capitalize">👤 {course.role_target}s</span>}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                {course.enrollment && (
                  <div className="mt-4">
                    <ProgressBar percent={course.enrollment.progress_percent} />
                  </div>
                )}

                {/* CTA */}
                <div className="mt-4">
                  {!course.enrollment ? (
                    <Button onClick={handleEnroll} disabled={enrolling}>
                      {enrolling ? 'Enrolling...' : '🎓 Enroll Now — Free'}
                    </Button>
                  ) : course.enrollment.status === 'completed' ? (
                    <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                      <span>✅ Course Completed!</span>
                    </div>
                  ) : firstLesson ? (
                    <Button onClick={() => router.push(`/courses/${id}/lessons/${firstLesson.id}`)}>
                      {course.enrollment.progress_percent > 0 ? '▶ Continue Learning' : '▶ Start Course'}
                    </Button>
                  ) : null}
                </div>
              </div>

              {/* Lessons */}
              <LessonList
                courseId={id}
                lessons={course.lessons || []}
                enrolled={!!course.enrollment}
              />
            </div>

            {/* Right — Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Course Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lessons</span>
                    <span className="font-medium">{course.lessons?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration</span>
                    <span className="font-medium">{course.duration_minutes || 0} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Role</span>
                    <span className="font-medium capitalize">{course.role_target || 'All'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className="font-medium capitalize">{course.enrollment?.status || 'Not enrolled'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500">Course not found.</p>
        )}
      </main>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { UserSidebar } from '@/components/user/UserSidebar';
import { CourseCard } from '@/components/lms/CourseCard';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'enrolled' | 'completed'>('all');

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (!token) { router.push('/login'); return; }

    authApi.lmsGetCourses(token)
      .then(res => setCourses((res.data.data as unknown[]) || []))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = (courses as Array<{ enrollment?: { status: string } | null }>).filter(c => {
    if (filter === 'enrolled') return c.enrollment && c.enrollment.status === 'enrolled';
    if (filter === 'completed') return c.enrollment?.status === 'completed';
    return true;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="text-slate-500 text-sm mt-1">Browse and enroll in training courses</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'enrolled', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-200 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-3">📚</div>
            <p className="font-medium text-slate-900">No courses found</p>
            <p className="text-slate-500 text-sm mt-1">
              {filter === 'all' ? 'No published courses available yet.' : `No ${filter} courses.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <CourseCard key={(course as { id: string }).id} course={course as Parameters<typeof CourseCard>[0]['course']} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
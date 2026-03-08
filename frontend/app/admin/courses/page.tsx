'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';

interface Course {
  id: string;
  title: string;
  status: string;
  role_target?: string;
  duration_minutes?: number;
  created_at: string;
  lessons?: { count: number }[];
}

const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-slate-100 text-slate-500',
};

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }

    setLoading(true);
    authApi.adminLmsGetCourses(token)
      .then(res => {
        const raw = res.data as unknown as { data: Course[]; meta: { total: number } };
        setCourses(raw.data || []);
        setTotal(raw.meta?.total || 0);
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
            <p className="text-slate-500 text-sm mt-1">{total} total courses</p>
          </div>
          <Button onClick={() => router.push('/admin/courses/new')}>
            + New Course
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-slate-200 rounded-xl h-16 animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-3">📚</div>
            <p className="font-medium text-slate-900">No courses yet</p>
            <p className="text-slate-500 text-sm mt-1">Create your first course to get started</p>
            <Button className="mt-4" onClick={() => router.push('/admin/courses/new')}>
              Create Course
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Course</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Target</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Lessons</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Created</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map(course => (
                  <tr key={course.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 text-sm">{course.title}</p>
                      {course.duration_minutes && (
                        <p className="text-slate-400 text-xs mt-0.5">{course.duration_minutes} min</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[course.status]}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                      {course.role_target || 'All'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {course.lessons?.[0]?.count || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(course.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/admin/courses/${course.id}`)}
                        className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        Edit →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
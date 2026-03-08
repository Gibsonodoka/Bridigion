'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    role_target: '',
    duration_minutes: '',
    thumbnail_url: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title) { setError('Title is required.'); return; }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token') || '';
      const res = await authApi.adminLmsCreateCourse(token, {
        title: form.title,
        description: form.description || undefined,
        role_target: form.role_target || undefined,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
        thumbnail_url: form.thumbnail_url || undefined,
      });
      const course = (res.data as unknown as { data: { id: string } }).data;
      router.push(`/admin/courses/${course.id}`);
    } catch {
      setError('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <button
          onClick={() => router.push('/admin/courses')}
          className="text-sm text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-1"
        >
          ← Back to Courses
        </button>

        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Create New Course</h1>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div className="space-y-2">
              <Label>Course Title *</Label>
              <Input
                placeholder="e.g. Security Guard Fundamentals"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                placeholder="What will students learn in this course?"
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Role</Label>
                <select
                  value={form.role_target}
                  onChange={e => handleChange('role_target', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <option value="">All Roles</option>
                  <option value="guard">Guard</option>
                  <option value="driver">Driver</option>
                  <option value="bouncer">Bouncer</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 60"
                  value={form.duration_minutes}
                  onChange={e => handleChange('duration_minutes', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <Input
                placeholder="https://..."
                value={form.thumbnail_url}
                onChange={e => handleChange('thumbnail_url', e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Create Course'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/courses')}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
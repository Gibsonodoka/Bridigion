'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { CompanySidebar } from '@/components/marketplace/CompanySidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', role_required: 'guard', location: '', salary_range: '', job_type: 'full-time', slots: '1', expires_at: '' });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location) { setError('Title, description and location are required.'); return; }
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('company_token') || '';
      await authApi.companyCreateJob(token, { ...form, slots: Number(form.slots) });
      router.push('/company/dashboard');
    } catch { setError('Failed to post job. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CompanySidebar />
      <main className="flex-1 p-8">
        <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-1">← Back</button>

        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Post a Job</h1>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div className="space-y-1"><Label>Job Title *</Label><Input placeholder="e.g. Armed Security Guard" value={form.title} onChange={e => set('title', e.target.value)} /></div>

            <div className="space-y-1">
              <Label>Description *</Label>
              <textarea placeholder="Describe the role, requirements, responsibilities..." value={form.description} onChange={e => set('description', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-slate-300" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Role Required *</Label>
                <select value={form.role_required} onChange={e => set('role_required', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                  <option value="guard">Guard</option>
                  <option value="driver">Driver</option>
                  <option value="bouncer">Bouncer</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Job Type</Label>
                <select value={form.job_type} onChange={e => set('job_type', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Location *</Label><Input placeholder="e.g. Lagos, Nigeria" value={form.location} onChange={e => set('location', e.target.value)} /></div>
              <div className="space-y-1"><Label>Salary Range</Label><Input placeholder="e.g. ₦80,000 - ₦120,000" value={form.salary_range} onChange={e => set('salary_range', e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Slots Available</Label><Input type="number" min="1" value={form.slots} onChange={e => set('slots', e.target.value)} /></div>
              <div className="space-y-1"><Label>Expires At</Label><Input type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} /></div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit for Approval'}</Button>
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-3 text-center">Jobs are reviewed by admin before going live.</p>
        </div>
      </main>
    </div>
  );
}
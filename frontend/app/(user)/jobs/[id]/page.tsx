'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { UserSidebar } from '@/components/user/UserSidebar';
import { Button } from '@/components/ui/button';

interface Job {
  id: string; title: string; description: string;
  role_required: string; location: string; salary_range?: string;
  job_type?: string; slots?: number; created_at: string;
  companies?: { name: string; description?: string; address?: string } | null;
  application?: { id: string; status: string } | null;
}

const appStatusColors: Record<string, string> = {
  applied: 'bg-yellow-100 text-yellow-700',
  shortlisted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  hired: 'bg-emerald-100 text-emerald-700',
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('user_token') || '';

  const fetchJob = useCallback(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    authApi.userGetJob(token, id)
      .then(res => setJob(res.data.data as Job))
      .catch(() => router.push('/jobs'))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  const handleApply = async () => {
    setApplying(true); setError(null);
    try {
      await authApi.userApplyJob(getToken(), id, coverNote);
      fetchJob();
      setShowApply(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to apply. Make sure your profile is verified.');
    } finally { setApplying(false); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar />
      <main className="flex-1 p-8">
        <button onClick={() => router.push('/jobs')} className="text-sm text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-1">← Back to Jobs</button>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-slate-200 rounded-xl h-32 animate-pulse" />)}</div>
        ) : job ? (
          <div className="max-w-2xl space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                  <p className="text-slate-500 mt-1">{job.companies?.name || 'Bridigion'}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-500">
                    <span>📍 {job.location}</span>
                    {job.job_type && <span className="capitalize">· {job.job_type}</span>}
                    {job.salary_range && <span>· {job.salary_range}</span>}
                    {job.slots && <span>· {job.slots} slot{job.slots > 1 ? 's' : ''}</span>}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-700 flex-shrink-0">{job.role_required}</span>
              </div>

              {/* Application status or CTA */}
              <div className="mt-5">
                {job.application ? (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${appStatusColors[job.application.status]}`}>
                    Application status: <span className="capitalize">{job.application.status}</span>
                  </div>
                ) : showApply ? (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Add a cover note (optional)..."
                      value={coverNote}
                      onChange={e => setCoverNote(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex gap-3">
                      <Button onClick={handleApply} disabled={applying}>{applying ? 'Applying...' : 'Submit Application'}</Button>
                      <Button variant="outline" onClick={() => setShowApply(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setShowApply(true)}>Apply Now</Button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Job Description</h3>
              <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </div>

            {/* Company Info */}
            {job.companies && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-3">About the Company</h3>
                {job.companies.description && <p className="text-slate-600 text-sm mb-2">{job.companies.description}</p>}
                {job.companies.address && <p className="text-slate-400 text-xs">📍 {job.companies.address}</p>}
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500">Job not found.</p>
        )}
      </main>
    </div>
  );
}
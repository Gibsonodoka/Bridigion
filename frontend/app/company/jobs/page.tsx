'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { CompanySidebar } from '@/components/marketplace/CompanySidebar';

interface Job {
  id: string;
  title: string;
  location: string;
  job_type: string;
  role_required: string;
  slots: number;
  status: string;
  created_at: string;
  expires_at?: string;
  salary_range?: string;
}

const statusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  closed: 'bg-slate-100 text-slate-600',
};

export default function CompanyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('company_token') || '';

  const fetchJobs = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push('/company/login'); return; }
    setLoading(true);
    try {
      const res = await authApi.companyGetJobs(token);
      setJobs((res.data.data as Job[]) || []);
    } catch (err) {
      console.error('Fetch jobs error:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CompanySidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Jobs</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your job postings</p>
          </div>
          <button
            onClick={() => router.push('/company/jobs/new')}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            + Post New Job
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-200 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-4xl mb-3">💼</p>
            <p className="font-medium text-slate-900">No jobs posted yet</p>
            <p className="text-slate-500 text-sm mt-1 mb-6">Post your first job to start finding security personnel</p>
            <button
              onClick={() => router.push('/company/jobs/new')}
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              Post a Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{job.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0 ${statusColors[job.status] || 'bg-slate-100 text-slate-600'}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>📍 {job.location}</span>
                      <span>👤 {job.role_required}</span>
                      <span>⏰ {job.job_type}</span>
                      <span>🪑 {job.slots} slot{job.slots !== 1 ? 's' : ''}</span>
                      {job.salary_range && <span>💰 {job.salary_range}</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                      {job.expires_at && ` · Expires ${new Date(job.expires_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => router.push(`/company/jobs/${job.id}`)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      View Applicants
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { UserSidebar } from '@/components/user/UserSidebar';
import { JobCard } from '@/components/marketplace/JobCard';

export default function UserJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');

  const getToken = () => localStorage.getItem('user_token') || '';

  const fetchJobs = useCallback(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    setLoading(true);
    authApi.userGetJobs(token, role || undefined)
      .then(res => setJobs((res.data.data as unknown[]) || []))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [role, router]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Job Listings</h1>
          <p className="text-slate-500 text-sm mt-1">Find security jobs that match your role</p>
        </div>

        <div className="flex gap-2 mb-6">
          {[{ value: '', label: 'All' }, { value: 'guard', label: 'Guard' }, { value: 'driver', label: 'Driver' }, { value: 'bouncer', label: 'Bouncer' }].map(f => (
            <button key={f.value} onClick={() => setRole(f.value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${role === f.value ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-slate-200 rounded-xl h-40 animate-pulse" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-4xl mb-3">💼</p>
            <p className="font-medium text-slate-900">No jobs available</p>
            <p className="text-slate-500 text-sm mt-1">Check back soon for new listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(job => (
              <JobCard key={(job as { id: string }).id} job={job as Parameters<typeof JobCard>[0]['job']} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
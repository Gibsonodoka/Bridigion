'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { CompanySidebar } from '@/components/marketplace/CompanySidebar';
import { Button } from '@/components/ui/button';

interface Job { id: string; title: string; status: string; role_required: string; location: string; created_at: string; job_applications?: { count: number }[]; }
interface Company { name: string; email: string; status: string; }

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('company_token') || '';

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push('/company/login'); return; }
    try {
      const [profileRes, jobsRes] = await Promise.all([
        authApi.companyProfile(token),
        authApi.companyGetJobs(token),
      ]);
      setCompany(profileRes.data.data as Company);
      setJobs((jobsRes.data.data as Job[]) || []);
    } catch { router.push('/company/login'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statusColors: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    closed: 'bg-slate-100 text-slate-500',
  };

  const stats = {
    total: jobs.length,
    approved: jobs.filter(j => j.status === 'approved').length,
    pending: jobs.filter(j => j.status === 'pending').length,
    applications: jobs.reduce((sum, j) => sum + (j.job_applications?.[0]?.count || 0), 0),
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CompanySidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {company?.name || '...'}</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your job listings and applications</p>
          </div>
          <Button onClick={() => router.push('/company/jobs/new')}>+ Post Job</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Jobs', value: stats.total, icon: '💼' },
            { label: 'Live Jobs', value: stats.approved, icon: '✅' },
            { label: 'Pending Review', value: stats.pending, icon: '⏳' },
            { label: 'Total Applications', value: stats.applications, icon: '📋' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Jobs</h3>
            <button onClick={() => router.push('/company/jobs')} className="text-sm text-slate-500 hover:text-slate-900">View all →</button>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">💼</p>
              <p className="font-medium text-slate-900">No jobs posted yet</p>
              <Button className="mt-4" onClick={() => router.push('/company/jobs/new')}>Post Your First Job</Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {jobs.slice(0, 5).map(job => (
                <div key={job.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 cursor-pointer" onClick={() => router.push(`/company/jobs/${job.id}`)}>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{job.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">{job.role_required} · {job.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{job.job_applications?.[0]?.count || 0} applicants</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[job.status]}`}>{job.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
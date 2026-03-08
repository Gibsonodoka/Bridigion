'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';

interface Job { id: string; title: string; status: string; role_required: string; location: string; created_at: string; companies?: { name: string } | null; }

const statusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  closed: 'bg-slate-100 text-slate-500',
};

export default function AdminMarketplaceJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('admin_token') || '';

  const fetchJobs = useCallback(() => {
    const token = getToken();
    if (!token) { router.push('/admin/login'); return; }
    setLoading(true);
    authApi.adminGetMarketplaceJobs(token, filter || undefined)
      .then(res => {
        const raw = res.data as unknown as { data: Job[] };
        setJobs(raw.data || []);
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [filter, router]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleUpdate = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await authApi.adminUpdateMarketplaceJob(getToken(), id, status);
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
    } finally { setUpdating(null); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Job Listings</h1>
            <p className="text-slate-500 text-sm mt-1">{jobs.length} jobs</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {[{ value: '', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f.value ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-slate-200 rounded-xl h-16 animate-pulse" />)}</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-4xl mb-3">💼</p>
            <p className="font-medium text-slate-900">No jobs found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Job', 'Company', 'Role', 'Location', 'Status', 'Posted', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900 text-sm">{job.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{job.companies?.name || 'Admin'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 capitalize">{job.role_required}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{job.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[job.status]}`}>{job.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(job.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {job.status === 'pending' && (
                          <>
                            <button onClick={() => handleUpdate(job.id, 'approved')} disabled={updating === job.id} className="text-xs font-medium text-green-600 hover:text-green-700 disabled:opacity-50">Approve</button>
                            <button onClick={() => handleUpdate(job.id, 'rejected')} disabled={updating === job.id} className="text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50">Reject</button>
                          </>
                        )}
                        {job.status === 'approved' && (
                          <button onClick={() => handleUpdate(job.id, 'closed')} disabled={updating === job.id} className="text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50">Close</button>
                        )}
                      </div>
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
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { UserSidebar } from '@/components/user/UserSidebar';
import { ApplicationCard } from '@/components/marketplace/ApplicationCard';

export default function UserApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(() => {
    const token = localStorage.getItem('user_token');
    if (!token) { router.push('/login'); return; }
    authApi.userGetApplications(token)
      .then(res => setApplications((res.data.data as unknown[]) || []))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-500 text-sm mt-1">Track your job applications</p>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="bg-slate-200 rounded-xl h-28 animate-pulse" />)}</div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium text-slate-900">No applications yet</p>
            <p className="text-slate-500 text-sm mt-1">Browse jobs and start applying</p>
            <button onClick={() => router.push('/jobs')} className="mt-4 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl">
            {applications.map(app => (
              <ApplicationCard key={(app as { id: string }).id} application={app as Parameters<typeof ApplicationCard>[0]['application']} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
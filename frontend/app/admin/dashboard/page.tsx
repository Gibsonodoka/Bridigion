'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { AdminStats } from '@/types';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { StatsCard } from '@/components/admin/StatsCard';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<{ full_name: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    if (userStr) {
      setAdmin(JSON.parse(userStr) as { full_name: string; role: string });
    }

    authApi.adminGetStats(token)
      .then(res => setStats(res.data.data!))
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, {admin?.full_name || 'Admin'} · {admin?.role?.replace('_', ' ')}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-slate-200 rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatsCard label="Total Users" value={stats.total} icon="👥" color="blue" />
            <StatsCard label="Pending Review" value={stats.pending} icon="⏳" color="yellow" />
            <StatsCard label="Verified" value={stats.verified} icon="✅" color="green" />
            <StatsCard label="Rejected" value={stats.rejected} icon="❌" color="red" />
            <StatsCard label="Flagged" value={stats.flagged} icon="🚩" color="orange" />
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div
            className="bg-white rounded-xl border border-slate-200 p-6 cursor-pointer hover:border-slate-300 transition-colors"
            onClick={() => router.push('/admin/verifications')}
          >
            <div className="text-3xl mb-3">🪪</div>
            <h3 className="font-semibold text-slate-900">Review Verifications</h3>
            <p className="text-slate-500 text-sm mt-1">{stats?.pending || 0} pending reviews</p>
          </div>
          <div
            className="bg-white rounded-xl border border-slate-200 p-6 cursor-pointer hover:border-slate-300 transition-colors"
            onClick={() => router.push('/admin/users')}
          >
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-semibold text-slate-900">Manage Users</h3>
            <p className="text-slate-500 text-sm mt-1">{stats?.total || 0} total users</p>
          </div>
        </div>
      </main>
    </div>
  );
}
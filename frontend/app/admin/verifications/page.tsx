'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { VerificationUser } from '@/types';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { VerificationTable } from '@/components/admin/VerificationTable';

export default function VerificationsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<VerificationUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchVerifications = useCallback(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }

    setLoading(true);
    authApi.adminGetVerifications(token, page)
      .then(res => {
        const raw = res.data as unknown as { data: VerificationUser[]; meta: { total: number } };
        setUsers(raw.data || []);
        setTotal(raw.meta?.total || 0);
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [page, router]);

  useEffect(() => { fetchVerifications(); }, [fetchVerifications]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Pending Verifications</h1>
          <p className="text-slate-500 text-sm mt-1">{total} users awaiting review</p>
        </div>

        <VerificationTable users={users} loading={loading} />

        {total > 20 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
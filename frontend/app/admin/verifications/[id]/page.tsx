'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { VerificationUser } from '@/types';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { UserReviewPanel } from '@/components/admin/UserReviewPanel';

export default function UserReviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<VerificationUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const getToken = () => localStorage.getItem('admin_token') || '';

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/admin/login'); return; }

    authApi.adminGetUser(token, id)
      .then(res => setUser(res.data.data!))
      .catch(() => router.push('/admin/verifications'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await authApi.adminApprove(getToken(), id);
      router.push('/admin/verifications');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    setActionLoading(true);
    try {
      await authApi.adminReject(getToken(), id, reason);
      router.push('/admin/verifications');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async (reason: string) => {
    setActionLoading(true);
    try {
      await authApi.adminFlag(getToken(), id, reason);
      router.push('/admin/verifications');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/verifications')}
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4 flex items-center gap-1"
          >
            ← Back to Verifications
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Review User</h1>
          <p className="text-slate-500 text-sm mt-1">ID: {id}</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-200 rounded-xl h-40 animate-pulse" />
            ))}
          </div>
        ) : user ? (
          <UserReviewPanel
            user={user}
            onApprove={handleApprove}
            onReject={handleReject}
            onFlag={handleFlag}
            loading={actionLoading}
          />
        ) : (
          <p className="text-slate-500">User not found.</p>
        )}
      </main>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { VerificationUser } from '@/types';
import { UserSidebar } from '@/components/user/UserSidebar';
import { VerificationStatusCard } from '@/components/user/VerificationStatusCard';

interface VerificationProgress {
  status: string;
  steps: { key: string; label: string; done: boolean }[];
  manualReview: boolean;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<VerificationUser | null>(null);
  const [progress, setProgress] = useState<VerificationProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const userData = localStorage.getItem('user_data');
    if (!token) { router.push('/login'); return; }
    if (userData) setUser(JSON.parse(userData) as VerificationUser);

    Promise.all([
      authApi.userGetProfile(token),
      authApi.userGetStatus(token),
    ])
      .then(([profileRes, statusRes]) => {
        setUser(profileRes.data.data!);
        setProgress(statusRes.data.data!);
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const statusConfig: Record<string, { message: string; color: string }> = {
    pending: { message: 'Your documents are under review. We\'ll notify you once verified.', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    verified: { message: 'Your account is fully verified! You can now access all features.', color: 'bg-green-50 border-green-200 text-green-700' },
    rejected: { message: 'Your verification was rejected. Please contact support.', color: 'bg-red-50 border-red-200 text-red-700' },
    flagged: { message: 'Your account has been flagged for manual review. Our team will reach out.', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  };

  const currentStatus = statusConfig[progress?.status || 'pending'];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar />
      <main className="flex-1 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here's your account overview
          </p>
        </div>

        {/* Status Banner */}
        {!loading && currentStatus && (
          <div className={`rounded-xl border p-4 mb-6 text-sm font-medium ${currentStatus.color}`}>
            {currentStatus.message}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-200 rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left — Verification Status */}
            <div className="lg:col-span-2">
              {progress && (
                <VerificationStatusCard
                  status={progress.status}
                  steps={progress.steps}
                  manualReview={progress.manualReview}
                />
              )}
            </div>

            {/* Right — Quick Info */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Account Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone</span>
                    <span className="font-medium">{user?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role</span>
                    <span className="font-medium capitalize">{user?.role || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className="font-medium capitalize">{progress?.status || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
                <h3 className="font-semibold text-slate-900 mb-2">Quick Links</h3>
                {[
                  { label: '👤 Edit Profile', href: '/profile' },
                  { label: '🪪 View Verification', href: '/verification' },
                  { label: '📚 Browse Courses', href: '/courses' },
                  { label: '🛒 Marketplace', href: '/marketplace' },
                ].map(link => (
                  <button
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className="w-full text-left text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
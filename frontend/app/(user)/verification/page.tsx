'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { UserSidebar } from '@/components/user/UserSidebar';
import { VerificationStatusCard } from '@/components/user/VerificationStatusCard';

interface VerificationProgress {
  status: string;
  steps: { key: string; label: string; done: boolean }[];
  manualReview: boolean;
}

export default function VerificationPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<VerificationProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (!token) { router.push('/login'); return; }

    authApi.userGetStatus(token)
      .then(res => setProgress(res.data.data!))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Verification Status</h1>
          <p className="text-slate-500 text-sm mt-1">Track your verification progress</p>
        </div>

        {loading ? (
          <div className="bg-slate-200 rounded-xl h-64 animate-pulse" />
        ) : progress ? (
          <div className="max-w-2xl">
            <VerificationStatusCard
              status={progress.status}
              steps={progress.steps}
              manualReview={progress.manualReview}
            />

            {progress.status === 'rejected' && (
              <div className="mt-4 bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">What to do next?</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Your verification was rejected. This may be due to incorrect NIN, unclear selfie, or mismatched information.
                </p>
                <button
                  onClick={() => router.push('/register')}
                  className="text-sm font-medium text-slate-900 underline"
                >
                  Re-submit verification →
                </button>
              </div>
            )}

            {progress.status === 'verified' && (
              <div className="mt-4 bg-green-50 rounded-xl border border-green-200 p-6">
                <h3 className="font-semibold text-green-800 mb-2">🎉 You're verified!</h3>
                <p className="text-sm text-green-700">
                  Your account is fully verified. You can now access courses, apply for jobs, and use the marketplace.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500">Failed to load verification status.</p>
        )}
      </main>
    </div>
  );
}
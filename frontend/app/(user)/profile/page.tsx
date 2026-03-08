'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { VerificationUser } from '@/types';
import { UserSidebar } from '@/components/user/UserSidebar';
import { ProfileCard } from '@/components/user/ProfileCard';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<VerificationUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (!token) { router.push('/login'); return; }

    authApi.userGetProfile(token)
      .then(res => setUser(res.data.data!))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">View and update your personal information</p>
        </div>

        {loading ? (
          <div className="bg-slate-200 rounded-xl h-64 animate-pulse" />
        ) : user ? (
          <div className="max-w-2xl">
            <ProfileCard user={user} onUpdated={setUser} />
          </div>
        ) : (
          <p className="text-slate-500">Failed to load profile.</p>
        )}
      </main>
    </div>
  );
}
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { CompanySidebar } from '@/components/marketplace/CompanySidebar';
import { TalentCard } from '@/components/marketplace/TalentCard';

export default function TalentPoolPage() {
  const router = useRouter();
  const [talent, setTalent] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');

  const getToken = () => localStorage.getItem('company_token') || '';

  const fetchTalent = useCallback(() => {
    const token = getToken();
    if (!token) { router.push('/company/login'); return; }
    setLoading(true);
    authApi.companyGetTalent(token, role || undefined)
      .then(res => setTalent((res.data.data as unknown[]) || []))
      .catch(() => router.push('/company/login'))
      .finally(() => setLoading(false));
  }, [role, router]);

  useEffect(() => { fetchTalent(); }, [fetchTalent]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CompanySidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Talent Pool</h1>
          <p className="text-slate-500 text-sm mt-1">Browse verified security personnel</p>
        </div>

        {/* Role filter */}
        <div className="flex gap-2 mb-6">
          {[{ value: '', label: 'All' }, { value: 'guard', label: 'Guards' }, { value: 'driver', label: 'Drivers' }, { value: 'bouncer', label: 'Bouncers' }].map(f => (
            <button key={f.value} onClick={() => setRole(f.value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${role === f.value ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-slate-200 rounded-xl h-24 animate-pulse" />)}
          </div>
        ) : talent.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-medium text-slate-900">No verified personnel found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {talent.map((person) => (
              <TalentCard key={(person as { id: string }).id} person={person as Parameters<typeof TalentCard>[0]['person']} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
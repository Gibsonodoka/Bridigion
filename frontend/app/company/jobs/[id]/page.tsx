'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { CompanySidebar } from '@/components/marketplace/CompanySidebar';

interface Application {
  id: string; status: string; cover_note?: string; created_at: string;
  users?: { id: string; full_name: string; phone: string; role: string; identity_verifications?: { selfie_url?: string } | { selfie_url?: string }[] };
}

const statusColors: Record<string, string> = {
  applied: 'bg-yellow-100 text-yellow-700',
  shortlisted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  hired: 'bg-emerald-100 text-emerald-700',
};

export default function CompanyJobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('company_token') || '';

  const fetchApplications = useCallback(() => {
    const token = getToken();
    if (!token) { router.push('/company/login'); return; }
    authApi.companyGetApplications(token, jobId)
      .then(res => setApplications((res.data.data as Application[]) || []))
      .catch(() => router.push('/company/dashboard'))
      .finally(() => setLoading(false));
  }, [jobId, router]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleUpdate = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await authApi.companyUpdateApplication(getToken(), id, status);
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } finally { setUpdating(null); }
  };

  const getSelfie = (iv: Application['users']) => {
    if (!iv?.identity_verifications) return null;
    const v = Array.isArray(iv.identity_verifications) ? iv.identity_verifications[0] : iv.identity_verifications;
    return v?.selfie_url || null;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CompanySidebar />
      <main className="flex-1 p-8">
        <button onClick={() => router.push('/company/dashboard')} className="text-sm text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-1">← Back to Dashboard</button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <span className="text-sm text-slate-500">{applications.length} total</span>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-slate-200 rounded-xl h-24 animate-pulse" />)}</div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium text-slate-900">No applications yet</p>
            <p className="text-slate-500 text-sm mt-1">Applications will appear here once candidates apply</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                    {getSelfie(app.users)
                      ? <img src={getSelfie(app.users)!} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-400">{app.users?.full_name?.[0]}</div>}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{app.users?.full_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">{app.users?.role} · {app.users?.phone}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[app.status]}`}>{app.status}</span>
                    </div>

                    {app.cover_note && (
                      <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{app.cover_note}</p>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      {app.status !== 'shortlisted' && app.status !== 'hired' && (
                        <button
                          onClick={() => handleUpdate(app.id, 'shortlisted')}
                          disabled={updating === app.id}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          ⭐ Shortlist
                        </button>
                      )}
                      {app.status !== 'hired' && (
                        <button
                          onClick={() => handleUpdate(app.id, 'hired')}
                          disabled={updating === app.id}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          ✅ Mark Hired
                        </button>
                      )}
                      {app.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdate(app.id, 'rejected')}
                          disabled={updating === app.id}
                          className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">Applied {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
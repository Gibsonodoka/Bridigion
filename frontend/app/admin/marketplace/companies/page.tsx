'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

interface Company { id: string; name: string; email: string; phone?: string; status: string; created_at: string; }

const statusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-slate-100 text-slate-500',
};

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('admin_token') || '';

  const fetchCompanies = useCallback(() => {
    const token = getToken();
    if (!token) { router.push('/admin/login'); return; }
    authApi.adminGetCompanies(token)
      .then(res => {
        const raw = res.data as unknown as { data: Company[] };
        setCompanies(raw.data || []);
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleUpdate = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await authApi.adminUpdateCompany(getToken(), id, status);
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } finally { setUpdating(null); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
          <p className="text-slate-500 text-sm mt-1">{companies.length} registered companies</p>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-slate-200 rounded-xl h-16 animate-pulse" />)}</div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-4xl mb-3">🏢</p>
            <p className="font-medium text-slate-900">No companies registered yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Company', 'Email', 'Phone', 'Status', 'Registered', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map(company => (
                  <tr key={company.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900 text-sm">{company.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{company.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{company.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[company.status]}`}>{company.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(company.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {company.status !== 'approved' && (
                          <button onClick={() => handleUpdate(company.id, 'approved')} disabled={updating === company.id} className="text-xs font-medium text-green-600 hover:text-green-700 disabled:opacity-50">Approve</button>
                        )}
                        {company.status === 'approved' && (
                          <button onClick={() => handleUpdate(company.id, 'suspended')} disabled={updating === company.id} className="text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50">Suspend</button>
                        )}
                        {company.status === 'pending' && (
                          <button onClick={() => handleUpdate(company.id, 'rejected')} disabled={updating === company.id} className="text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50">Reject</button>
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
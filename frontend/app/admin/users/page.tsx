'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { VerificationUser } from '@/types';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  flagged: 'bg-orange-100 text-orange-700',
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<VerificationUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = useCallback(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }

    setLoading(true);
    const filters: Record<string, string> = {};
    if (statusFilter) filters.status = statusFilter;
    if (roleFilter) filters.role = roleFilter;
    if (search) filters.search = search;

    authApi.adminGetUsers(token, page, filters)
      .then(res => {
        const raw = res.data as unknown as { data: VerificationUser[]; meta: { total: number } };
        setUsers(raw.data || []);
        setTotal(raw.meta?.total || 0);
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [page, statusFilter, roleFilter, search, router]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">All Users</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total users</p>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="guard">Guard</option>
            <option value="driver">Driver</option>
            <option value="bouncer">Bouncer</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No users found.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Phone</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Joined</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 text-sm">{user.full_name || '—'}</p>
                      <p className="text-slate-400 text-xs">{user.email || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.phone}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">{user.role || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[user.verification_status]}`}>
                        {user.verification_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/admin/verifications/${user.id}`)}
                        className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

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
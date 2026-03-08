'use client';

import { useRouter } from 'next/navigation';
import { VerificationUser, IdentityVerification } from '@/types';

interface VerificationTableProps {
  users: VerificationUser[];
  loading: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  flagged: 'bg-orange-100 text-orange-700',
};

const roleColors: Record<string, string> = {
  guard: 'bg-blue-100 text-blue-700',
  driver: 'bg-purple-100 text-purple-700',
  bouncer: 'bg-slate-100 text-slate-700',
};

const getIdentity = (iv: VerificationUser['identity_verifications']): IdentityVerification | undefined => {
  if (!iv) return undefined;
  if (Array.isArray(iv)) return iv[0];
  return iv;
};

export const VerificationTable = ({ users, loading }: VerificationTableProps) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-400">Loading verifications...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-slate-600 font-medium">No pending verifications</p>
        <p className="text-slate-400 text-sm mt-1">All users have been reviewed</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">NIN</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => {
            const nin = getIdentity(user.identity_verifications);
            return (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900 text-sm">{user.full_name || '—'}</p>
                  <p className="text-slate-400 text-xs">{user.email || '—'}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.phone}</td>
                <td className="px-6 py-4">
                  {user.role ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${nin?.nin_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {nin?.nin_verified ? '✓ Verified' : '✗ Unverified'}
                  </span>
                </td>
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
                    Review →
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
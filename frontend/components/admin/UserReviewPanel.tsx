'use client';

import { useState } from 'react';
import { VerificationUser, IdentityVerification } from '@/types';
import { Button } from '@/components/ui/button';

interface UserReviewPanelProps {
  user: VerificationUser;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onFlag: (reason: string) => Promise<void>;
  loading: boolean;
}

const getIdentity = (iv: VerificationUser['identity_verifications']): IdentityVerification | undefined => {
  if (!iv) return undefined;
  if (Array.isArray(iv)) return iv[0];
  return iv;
};

export const UserReviewPanel = ({
  user,
  onApprove,
  onReject,
  onFlag,
  loading,
}: UserReviewPanelProps) => {
  const [action, setAction] = useState<'approve' | 'reject' | 'flag' | null>(null);
  const [reason, setReason] = useState('');

  const nin = getIdentity(user.identity_verifications);

  const handleConfirm = async () => {
    if (action === 'approve') await onApprove();
    if (action === 'reject') await onReject(reason);
    if (action === 'flag') await onFlag(reason);
    setAction(null);
    setReason('');
  };

  return (
    <div className="space-y-6">

      {/* Profile */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Full Name</p>
            <p className="font-medium text-slate-900">{user.full_name || '—'}</p>
          </div>
          <div>
            <p className="text-slate-400">Phone</p>
            <p className="font-medium text-slate-900">{user.phone}</p>
          </div>
          <div>
            <p className="text-slate-400">Email</p>
            <p className="font-medium text-slate-900">{user.email || '—'}</p>
          </div>
          <div>
            <p className="text-slate-400">Date of Birth</p>
            <p className="font-medium text-slate-900">{user.date_of_birth || '—'}</p>
          </div>
          <div>
            <p className="text-slate-400">Role Applied</p>
            <p className="font-medium text-slate-900 capitalize">{user.role || '—'}</p>
          </div>
          <div>
            <p className="text-slate-400">Registered</p>
            <p className="font-medium text-slate-900">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* NIN Verification */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Identity Verification</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">NIN</p>
            <p className="font-medium text-slate-900 font-mono">{nin?.nin || '—'}</p>
          </div>
          <div>
            <p className="text-slate-400">NIN Status</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${nin?.nin_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {nin?.nin_verified ? '✓ Verified' : '✗ Not Verified'}
            </span>
          </div>
          <div>
            <p className="text-slate-400">Verification Attempts</p>
            <p className="font-medium text-slate-900">{nin?.nin_attempts ?? 0} / 3</p>
          </div>
          <div>
            <p className="text-slate-400">Manual Review</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${nin?.manual_review ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
              {nin?.manual_review ? 'Required' : 'Not Required'}
            </span>
          </div>
        </div>
      </div>

      {/* Selfie */}
      {nin?.selfie_url && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Selfie</h3>
          <img
            src={nin.selfie_url}
            alt="User selfie"
            className="w-48 h-48 object-cover rounded-xl border border-slate-200"
          />
        </div>
      )}

      {/* Actions */}
      {user.verification_status === 'pending' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Review Decision</h3>

          {!action && (
            <div className="flex gap-3">
              <Button
                onClick={() => setAction('approve')}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                ✅ Approve
              </Button>
              <Button
                onClick={() => setAction('reject')}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
              >
                ❌ Reject
              </Button>
              <Button
                onClick={() => setAction('flag')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={loading}
              >
                🚩 Flag
              </Button>
            </div>
          )}

          {action && action !== 'approve' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700 capitalize">
                {action === 'reject' ? '❌ Rejection' : '🚩 Flag'} Reason
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Enter reason for ${action}ing...`}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
              <div className="flex gap-3">
                <Button onClick={handleConfirm} disabled={loading || !reason.trim()}>
                  {loading ? 'Processing...' : `Confirm ${action}`}
                </Button>
                <Button variant="outline" onClick={() => { setAction(null); setReason(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {action === 'approve' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Are you sure you want to approve this user?</p>
              <div className="flex gap-3">
                <Button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? 'Processing...' : 'Confirm Approval'}
                </Button>
                <Button variant="outline" onClick={() => setAction(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Already reviewed */}
      {user.verification_status !== 'pending' && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
          <p className="text-slate-500 text-sm">
            This user has already been{' '}
            <span className="font-semibold capitalize">{user.verification_status}</span>.
          </p>
        </div>
      )}
    </div>
  );
};
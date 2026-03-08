'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VerificationUser } from '@/types';

interface ProfileCardProps {
  user: VerificationUser;
  onUpdated: (user: VerificationUser) => void;
}

const roleIcons: Record<string, string> = {
  guard: '🛡️',
  driver: '🚗',
  bouncer: '🚪',
};

export const ProfileCard = ({ user, onUpdated }: ProfileCardProps) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user.full_name || '');
  const [email, setEmail] = useState(user.email || '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('user_token') || '';
      const res = await authApi.userUpdateProfile(token, {
        full_name: fullName,
        email,
      });
      onUpdated(res.data.data!);
      setEditing(false);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-900">Profile Information</h3>
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            ✏️ Edit
          </Button>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold">
          {user.full_name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{user.full_name || 'No name set'}</p>
          <p className="text-slate-500 text-sm">{user.phone}</p>
          {user.role && (
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full capitalize">
              {roleIcons[user.role]} {user.role}
            </span>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                setFullName(user.full_name || '');
                setEmail(user.email || '');
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
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
            <p className="text-slate-400">Role</p>
            <p className="font-medium text-slate-900 capitalize">{user.role || '—'}</p>
          </div>
          <div>
            <p className="text-slate-400">Member Since</p>
            <p className="font-medium text-slate-900">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
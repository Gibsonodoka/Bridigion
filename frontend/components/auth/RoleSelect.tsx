'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/types';

const roles = [
  {
    value: 'guard' as UserRole,
    label: 'Security Guard',
    description: 'Protect properties, assets, and people on-site.',
    icon: '🛡️',
  },
  {
    value: 'driver' as UserRole,
    label: 'Security Driver',
    description: 'Provide secure transportation and escort services.',
    icon: '🚗',
  },
  {
    value: 'bouncer' as UserRole,
    label: 'Bouncer',
    description: 'Manage access control at events and venues.',
    icon: '🚪',
  },
];

interface RoleSelectProps {
  onSubmit: (role: UserRole) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const RoleSelect = ({ onSubmit, loading, error }: RoleSelectProps) => {
  const [selected, setSelected] = useState<UserRole | null>(null);

  const handleSubmit = async () => {
    if (!selected) return;
    await onSubmit(selected);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Select Your Role</CardTitle>
        <CardDescription>
          Choose the role that best describes your profession on Bridigion.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelected(role.value)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selected === role.value
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{role.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900">{role.label}</p>
                  <p className="text-sm text-slate-500">{role.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {!selected && (
          <p className="text-sm text-slate-400 text-center">Select a role to continue</p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={!selected || loading}
        >
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </CardContent>
    </Card>
  );
};
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CompanyLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Email and password required.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await authApi.companyLogin(form);
      const data = res.data.data as { token: string };
      localStorage.setItem('company_token', data.token);
      router.push('/company/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-sm w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900">Company Login</h1>
          <p className="text-slate-500 text-sm mt-1">Access your company portal</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1"><Label>Email</Label><Input type="email" placeholder="info@company.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          <div className="space-y-1"><Label>Password</Label><Input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} /></div>
        </div>

        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

        <Button className="w-full mt-6" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        <p className="text-center text-sm text-slate-500 mt-4">
          New company?{' '}
          <button onClick={() => router.push('/company/register')} className="text-slate-900 font-medium hover:underline">Register here</button>
        </p>
      </div>
    </div>
  );
}
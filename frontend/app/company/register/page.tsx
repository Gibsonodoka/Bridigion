'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CompanyRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', description: '' });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required.'); return; }
    setLoading(true); setError(null);
    try {
      await authApi.companyRegister(form);
      setSuccess(true);
    } catch {
      setError('Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Registration Submitted!</h2>
          <p className="text-slate-500 text-sm mb-6">Your company account is pending admin approval. You'll be able to log in once approved.</p>
          <Button onClick={() => router.push('/company/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900">Register Company</h1>
          <p className="text-slate-500 text-sm mt-1">Post jobs and find verified security personnel</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1"><Label>Company Name *</Label><Input placeholder="e.g. SecureNg Ltd" value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div className="space-y-1"><Label>Email *</Label><Input type="email" placeholder="info@company.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div className="space-y-1"><Label>Password *</Label><Input type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} /></div>
          <div className="space-y-1"><Label>Phone</Label><Input placeholder="080XXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          <div className="space-y-1"><Label>Address</Label><Input placeholder="Company address" value={form.address} onChange={e => set('address', e.target.value)} /></div>
          <div className="space-y-1">
            <Label>Description</Label>
            <textarea placeholder="Brief company description..." value={form.description} onChange={e => set('description', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-slate-300" />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

        <Button className="w-full mt-6" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Register Company'}
        </Button>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already approved?{' '}
          <button onClick={() => router.push('/company/login')} className="text-slate-900 font-medium hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  );
}
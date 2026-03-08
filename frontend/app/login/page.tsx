'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!phone) { setError('Phone number is required.'); return; }
    setLoading(true);
    setError(null);
    try {
      await authApi.userLoginSendOtp({ phone });
      setStep('otp');
    } catch {
      setError('No account found with this number. Please register first.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) { setError('Please enter the OTP.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.userLoginVerifyOtp({ phone, otp });
      const { token, user } = res.data.data!;
      localStorage.setItem('user_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
      router.push('/dashboard');
    } catch {
      setError('Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">BRIDIGION</h1>
        <p className="text-slate-500 text-sm mt-1">Security Personnel Training Platform</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {step === 'phone' ? 'Sign In' : 'Verify OTP'}
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          {step === 'phone'
            ? 'Enter your registered phone number'
            : `Enter the 6-digit code sent to ${phone}`}
        </p>

        <div className="space-y-4">
          {step === 'phone' && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08130752704"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              />
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            onClick={step === 'phone' ? handleSendOtp : handleVerifyOtp}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Please wait...' : step === 'phone' ? 'Send OTP' : 'Sign In'}
          </Button>

          {step === 'otp' && (
            <button
              onClick={() => { setStep('phone'); setOtp(''); setError(null); }}
              className="w-full text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              ← Change phone number
            </button>
          )}

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-slate-900 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
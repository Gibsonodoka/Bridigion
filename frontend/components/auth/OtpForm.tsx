'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain numbers only'),
});

type OtpFormData = z.infer<typeof otpSchema>;

interface OtpFormProps {
  phone: string;
  onSubmit: (otp: string) => Promise<boolean>;
  onResend: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const OtpForm = ({ phone, onSubmit, onResend, loading, error }: OtpFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const handleFormSubmit = async (data: OtpFormData) => {
    await onSubmit(data.otp);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Verify Your Number</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to <span className="font-semibold text-slate-700">{phone}</span> via SMS and email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              {...register('otp')}
              className={errors.otp ? 'border-red-500' : ''}
            />
            {errors.otp && (
              <p className="text-sm text-red-500">{errors.otp.message}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </Button>

          <p className="text-center text-sm text-slate-500">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={onResend}
              disabled={loading}
              className="text-slate-900 font-semibold underline disabled:opacity-50"
            >
              Resend OTP
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
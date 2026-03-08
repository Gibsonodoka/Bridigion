'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ninSchema = z.object({
  nin: z
    .string()
    .length(11, 'NIN must be exactly 11 digits')
    .regex(/^\d+$/, 'NIN must contain numbers only'),
});

type NinFormData = z.infer<typeof ninSchema>;

interface NinFormProps {
  onSubmit: (nin: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const NinForm = ({ onSubmit, loading, error }: NinFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NinFormData>({
    resolver: zodResolver(ninSchema),
  });

  const handleFormSubmit = async (data: NinFormData) => {
    await onSubmit(data.nin);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Identity Verification</CardTitle>
        <CardDescription>
          Enter your 11-digit National Identification Number (NIN) to verify your identity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="nin">National Identification Number (NIN)</Label>
            <Input
              id="nin"
              type="text"
              placeholder="Enter your 11-digit NIN"
              maxLength={11}
              {...register('nin')}
              className={errors.nin ? 'border-red-500' : ''}
            />
            {errors.nin && (
              <p className="text-sm text-red-500">{errors.nin.message}</p>
            )}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
            <p className="font-medium mb-1">📋 Where to find your NIN:</p>
            <ul className="space-y-1 text-xs">
              <li>• Your National ID Card</li>
              <li>• NIMC Mobile App</li>
              <li>• NIN slip from any NIMC office</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify NIN'}
          </Button>

          <p className="text-xs text-center text-slate-400">
            You have up to 3 attempts to verify your NIN.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
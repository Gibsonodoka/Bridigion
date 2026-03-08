'use client';

import { useAuth } from '@/hooks/useAuth';
import { PhoneForm } from '@/components/auth/PhoneForm';
import { OtpForm } from '@/components/auth/OtpForm';
import { ProfileForm } from '@/components/auth/ProfileForm';
import { RoleSelect } from '@/components/auth/RoleSelect';
import { NinForm } from '@/components/auth/NinForm';
import { SelfieCapture } from '@/components/auth/SelfieCapture';

const steps = ['phone', 'otp', 'profile', 'role', 'identity', 'selfie', 'complete'];

const getStepNumber = (step: string) => steps.indexOf(step) + 1;
const totalSteps = steps.length;

export default function RegisterPage() {
  const {
    step,
    phone,
    loading,
    error,
    handleSendOtp,
    handleVerifyOtp,
    handleCompleteProfile,
    handleSelectRole,
    handleVerifyNin,
    handleSubmitSelfie,
  } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          BRIDIGION
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Security Personnel Training Platform
        </p>
      </div>

      {/* Step Indicator */}
      <div className="w-full max-w-md mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500 font-medium">
            Step {getStepNumber(step)} of {totalSteps}
          </span>
          <span className="text-sm text-slate-500 capitalize font-medium">
            {step === 'phone' && 'Phone Verification'}
            {step === 'otp' && 'OTP Verification'}
            {step === 'profile' && 'Profile Setup'}
            {step === 'role' && 'Role Selection'}
            {step === 'identity' && 'Identity Verification'}
            {step === 'selfie' && 'Liveness Check'}
            {step === 'complete' && 'Complete'}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-slate-900 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(getStepNumber(step) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Step Forms */}
      {step === 'phone' && (
        <PhoneForm
          onSubmit={handleSendOtp}
          loading={loading}
          error={error}
        />
      )}

      {step === 'otp' && (
        <OtpForm
          phone={phone}
          onSubmit={handleVerifyOtp}
          onResend={() => handleSendOtp(phone)}
          loading={loading}
          error={error}
        />
      )}

      {step === 'profile' && (
        <ProfileForm
          onSubmit={handleCompleteProfile}
          loading={loading}
          error={error}
        />
      )}

      {step === 'role' && (
        <RoleSelect
          onSubmit={handleSelectRole}
          loading={loading}
          error={error}
        />
      )}

      {step === 'identity' && (
        <NinForm
          onSubmit={handleVerifyNin}
          loading={loading}
          error={error}
        />
      )}

      {step === 'selfie' && (
        <SelfieCapture
          onSubmit={handleSubmitSelfie}
          loading={loading}
          error={error}
        />
      )}

      {step === 'complete' && (
        <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Submission Complete!
          </h2>
          <p className="text-slate-500 text-sm">
            Your documents have been submitted for review. You will be notified once verified.
          </p>
        </div>
      )}

    </div>
  );
}
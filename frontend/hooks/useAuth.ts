import { useState } from 'react';
import { authApi } from '@/lib/api';
import { UserRole, RegistrationStep } from '@/types';

export const useAuth = () => {
  const [step, setStep] = useState<RegistrationStep>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (phoneNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.sendOtp({ phone: phoneNumber });
      setPhone(phoneNumber);
      setStep('otp');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.verifyOtp({ phone, otp });
      setStep('profile');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid OTP';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (name: string, email: string, dob: string) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.completeProfile({ name, email, dob, phone });
      setStep('role');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.selectRole({ role, phone });
      setStep('identity');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to select role';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyNin = async (nin: string) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.verifyNin({ nin, phone });
      setStep('selfie');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'NIN verification failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSelfie = async (imageData: string) => {
  setLoading(true);
  setError(null);
  try {
    // Upload selfie first
    await authApi.uploadSelfie({ phone, imageData });
    // Then submit documents
    await authApi.submitDocuments({ phone });
    setStep('complete');
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Submission failed';
    setError(message);
    return false;
  } finally {
    setLoading(false);
  }
};

  return {
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
  };
};
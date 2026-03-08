import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/supabase';

dotenv.config();

export interface UserTokenPayload {
  id: string;
  phone: string;
}

export const getUserByPhone = async (phone: string) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error || !data) return null;
  return data;
};

export const getUserById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select(`
      id, phone, email, full_name, date_of_birth, role,
      verification_status, is_active, created_at,
      identity_verifications (
        id, nin_verified, nin_attempts, manual_review,
        selfie_url, document_url, created_at
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
};

export const issueUserToken = (id: string, phone: string): string => {
  const secret = process.env.USER_JWT_SECRET!;
  const expiresIn = process.env.USER_JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id, phone }, secret, { expiresIn } as jwt.SignOptions);
};

export const updateUserProfile = async (
  id: string,
  updates: { full_name?: string; email?: string; date_of_birth?: string }
) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('❌ Update profile error:', error.message);
    return null;
  }
  return data;
};

export const getVerificationProgress = async (userId: string) => {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*, identity_verifications(*)')
    .eq('id', userId)
    .single();

  if (!user) return null;

  const identity = user.identity_verifications?.[0];

  const steps = [
    { key: 'phone', label: 'Phone Verified', done: true },
    { key: 'profile', label: 'Profile Completed', done: !!user.full_name && !!user.email },
    { key: 'role', label: 'Role Selected', done: !!user.role },
    { key: 'nin', label: 'NIN Verified', done: !!identity?.nin_verified },
    { key: 'selfie', label: 'Selfie Submitted', done: !!identity?.id },
    {
      key: 'review',
      label: 'Under Review',
      done: ['pending', 'verified', 'rejected', 'flagged'].includes(user.verification_status),
    },
    { key: 'verified', label: 'Account Verified', done: user.verification_status === 'verified' },
  ];

  return {
    status: user.verification_status,
    steps,
    manualReview: identity?.manual_review || false,
  };
};
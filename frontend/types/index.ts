export type UserRole = 'guard' | 'driver' | 'bouncer';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'flagged';

export interface User {
  id: string;
  phone: string;
  email?: string;
  full_name?: string;
  date_of_birth?: string;
  role?: UserRole;
  verification_status: VerificationStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface OtpPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface ProfilePayload {
  name: string;
  email: string;
  dob: string;
  phone: string;
}

export interface RolePayload {
  role: UserRole;
  phone: string;
}

export interface NinPayload {
  nin: string;
  phone: string;
}

export interface SubmitDocumentsPayload {
  phone: string;
}

export type RegistrationStep =
  | 'phone'
  | 'otp'
  | 'profile'
  | 'role'
  | 'identity'
  | 'selfie'
  | 'complete';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'reviewer' | 'support';
}

export interface IdentityVerification {
  id?: string;
  nin?: string;
  nin_verified?: boolean;
  nin_attempts?: number;
  manual_review?: boolean;
  selfie_url?: string;
  document_url?: string;
  created_at?: string;
}

export interface VerificationUser {
  id: string;
  phone: string;
  email?: string;
  full_name?: string;
  date_of_birth?: string;
  role?: UserRole;
  verification_status: VerificationStatus;
  created_at: string;
  identity_verifications?: IdentityVerification | IdentityVerification[];
}

export interface AdminStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  flagged: number;
}
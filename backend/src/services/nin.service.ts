import { supabaseAdmin } from '../config/supabase';

export interface NinVerificationResult {
  valid: boolean;
  message: string;
  data?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
  };
}

// TODO: Replace with real NIN verification provider (Smile Identity / Dojah)
export const verifyNin = async (nin: string): Promise<NinVerificationResult> => {
  try {
    // Validate NIN format (11 digits)
    if (!nin || !/^\d{11}$/.test(nin)) {
      return { valid: false, message: 'NIN must be exactly 11 digits.' };
    }

    // DEV MODE: Simulate NIN verification
    if (process.env.NODE_ENV === 'development') {
      console.log(`🪪 DEV NIN verification for: ${nin}`);

      // Simulate invalid NIN for testing
      if (nin === '00000000000') {
        return { valid: false, message: 'NIN not found. Please check and try again.' };
      }

      return {
        valid: true,
        message: 'NIN verified successfully.',
        data: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        },
      };
    }

    // PRODUCTION: Integrate real NIN API here
    return { valid: false, message: 'NIN verification service not configured.' };
  } catch (error) {
    console.error('❌ NIN verification error:', error);
    return { valid: false, message: 'NIN verification failed. Please try again.' };
  }
};

export const saveNinVerification = async (
  userId: string,
  nin: string,
  verified: boolean,
  attempts: number
): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('identity_verifications')
      .upsert({
        user_id: userId,
        nin,
        nin_verified: verified,
        nin_attempts: attempts,
        manual_review: attempts >= 3 && !verified,
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('❌ Failed to save NIN verification:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Save NIN verification exception:', error);
    return false;
  }
};

export const getUserByPhone = async (phone: string) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error || !data) return null;
  return data;
};
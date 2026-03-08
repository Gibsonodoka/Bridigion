import { supabaseAdmin } from '../config/supabase';
import { sendSmsOtp } from './termii.service';

// Generate a 6-digit OTP
export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to database
export const saveOtp = async (phone: string, otp: string): Promise<boolean> => {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate any existing OTPs for this phone
    const { error: invalidateError } = await supabaseAdmin
      .from('otp_logs')
      .update({ is_used: true })
      .eq('phone', phone)
      .eq('is_used', false);

    if (invalidateError) {
      console.error('❌ Failed to invalidate old OTPs:', invalidateError.message);
    }

    // Save new OTP
    const { error } = await supabaseAdmin.from('otp_logs').insert({
      phone,
      channel: 'sms',
      otp_code: otp,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      console.error('❌ Failed to save OTP to DB:', error.message);
      return false;
    }

    console.log(`✅ OTP saved to DB for ${phone}`);
    return true;
  } catch (error) {
    console.error('❌ Save OTP exception:', error);
    return false;
  }
};

// Verify OTP from database
export const verifyOtpCode = async (phone: string, otp: string): Promise<{
  valid: boolean;
  message: string;
}> => {
  try {
    // Check if account is locked
    const { data: lockData } = await supabaseAdmin
      .from('otp_logs')
      .select('*')
      .eq('phone', phone)
      .eq('is_locked', true)
      .gt('locked_until', new Date().toISOString())
      .single();

    if (lockData) {
      return { valid: false, message: 'Account locked. Try again in 15 minutes.' };
    }

    // Find valid OTP
    const { data, error } = await supabaseAdmin
      .from('otp_logs')
      .select('*')
      .eq('phone', phone)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error('❌ OTP lookup error:', error?.message);
      return { valid: false, message: 'OTP expired. Request a new one.' };
    }

    // Check failed attempts
    if (data.failed_attempts >= 3) {
      await supabaseAdmin
        .from('otp_logs')
        .update({
          is_locked: true,
          locked_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        })
        .eq('id', data.id);

      return { valid: false, message: 'Too many failed attempts. Account locked for 15 minutes.' };
    }

    // Check if OTP matches
    if (data.otp_code !== otp) {
      await supabaseAdmin
        .from('otp_logs')
        .update({ failed_attempts: data.failed_attempts + 1 })
        .eq('id', data.id);

      const remaining = 2 - data.failed_attempts;
      return { valid: false, message: `Invalid OTP. ${remaining} attempt(s) remaining.` };
    }

    // Mark OTP as used
    await supabaseAdmin
      .from('otp_logs')
      .update({ is_used: true })
      .eq('id', data.id);

    console.log(`✅ OTP verified for ${phone}`);
    return { valid: true, message: 'OTP verified successfully.' };
  } catch (error) {
    console.error('❌ Verify OTP exception:', error);
    return { valid: false, message: 'Verification failed. Please try again.' };
  }
};

// Send OTP via SMS
export const sendOtp = async (phone: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const otp = generateOtp();
    console.log(`🔑 Generated OTP: ${otp} for ${phone}`);

    const saved = await saveOtp(phone, otp);
    console.log(`💾 OTP saved to DB: ${saved}`);

    if (!saved) {
      return { success: false, message: 'Failed to generate OTP. Try again.' };
    }

    const sent = await sendSmsOtp(phone, otp);
    console.log(`📤 Termii SMS sent: ${sent}`);

    if (!sent) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 DEV OTP for ${phone}: ${otp}`);
        return { success: true, message: 'OTP sent successfully.' };
      }
      return { success: false, message: 'Failed to send OTP. Try again.' };
    }

    return { success: true, message: 'OTP sent successfully.' };
  } catch (error) {
    console.error('❌ Send OTP exception:', error);
    return { success: false, message: 'Failed to send OTP. Try again.' };
  }
};
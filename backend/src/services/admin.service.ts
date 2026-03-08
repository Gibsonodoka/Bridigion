import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/supabase';

dotenv.config();

export interface AdminTokenPayload {
  id: string;
  email: string;
  role: string;
}

export const loginAdmin = async (email: string, password: string): Promise<{
  success: boolean;
  token?: string;
  admin?: object;
  message: string;
}> => {
  try {
    console.log(`🔐 Admin login attempt: ${email}`);

    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    console.log(`👤 Admin found:`, admin ? 'yes' : 'no');
    console.log(`❌ DB error:`, error?.message || 'none');

    if (error || !admin) {
      return { success: false, message: 'Invalid email or password.' };
    }

    console.log(`🔑 Comparing password...`);
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    console.log(`✅ Password valid:`, validPassword);

    if (!validPassword) {
      return { success: false, message: 'Invalid email or password.' };
    }

    await supabaseAdmin
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    console.log(`🎟️ Generating JWT...`);

    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      secret,
      { expiresIn } as jwt.SignOptions
    );

    console.log(`✅ JWT generated successfully`);

    return {
      success: true,
      token,
      message: 'Login successful.',
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      },
    };
  } catch (error) {
    console.error('❌ Admin login exception:', error);
    return { success: false, message: 'Login failed. Please try again.' };
  }
};

export const getStats = async () => {
  const [total, pending, verified, rejected, flagged] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('verification_status', 'rejected'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('verification_status', 'flagged'),
  ]);

  return {
    total: total.count || 0,
    pending: pending.count || 0,
    verified: verified.count || 0,
    rejected: rejected.count || 0,
    flagged: flagged.count || 0,
  };
};

export const getPendingVerifications = async (page = 1, limit = 20) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from('users')
    .select(`
      id, phone, email, full_name, date_of_birth, role,
      verification_status, created_at,
      identity_verifications (
        id, nin, nin_verified, nin_attempts, manual_review,
        selfie_url, document_url, created_at
      )
    `, { count: 'exact' })
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('❌ Get verifications error:', error.message);
    return { data: [], total: 0 };
  }

  return { data: data || [], total: count || 0 };
};

export const getUserById = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select(`
      id, phone, email, full_name, date_of_birth, role,
      verification_status, is_active, created_at,
      identity_verifications (
        id, nin, nin_verified, nin_attempts,
        manual_review, selfie_url, document_url, created_at
      )
    `)
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data;
};

export const updateVerificationStatus = async (
  userId: string,
  status: 'verified' | 'rejected' | 'flagged',
  adminId: string,
  reason?: string
) => {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ verification_status: status })
    .eq('id', userId);

  if (error) {
    console.error('❌ Update status error:', error.message);
    return false;
  }

  await supabaseAdmin.from('audit_logs').insert({
    admin_id: adminId,
    action: `verification_${status}`,
    target_user_id: userId,
    details: { reason: reason || null, status },
  });

  await supabaseAdmin
    .from('identity_verifications')
    .update({
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return true;
};

export const getAllUsers = async (
  page = 1,
  limit = 20,
  status?: string,
  role?: string,
  search?: string
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('users')
    .select('id, phone, email, full_name, role, verification_status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status) query = query.eq('verification_status', status);
  if (role) query = query.eq('role', role);
  if (search) query = query.or(`phone.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`);

  const { data, error, count } = await query;

  if (error) {
    console.error('❌ Get users error:', error.message);
    return { data: [], total: 0 };
  }

  return { data: data || [], total: count || 0 };
};
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';

const COMPANY_JWT_SECRET = process.env.COMPANY_JWT_SECRET || 'company_jwt_secret';

// ─── COMPANY AUTH ─────────────────────────────────────────────────────────────

export const registerCompany = async (data: {
  name: string; email: string; password: string;
  phone?: string; address?: string; description?: string;
}) => {
  const password_hash = await bcrypt.hash(data.password, 12);
  const { data: company, error } = await supabaseAdmin
    .from('companies')
    .insert({ ...data, password: undefined, password_hash })
    .select('id, name, email, status')
    .single();
  if (error) { console.error('❌ Register company:', error.message); return null; }
  return company;
};

export const loginCompany = async (email: string, password: string) => {
  const { data: company, error } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('email', email)
    .single();
  if (error || !company) return null;
  const valid = await bcrypt.compare(password, company.password_hash);
  if (!valid) return null;
  if (company.status !== 'approved') return { error: company.status };
  const token = jwt.sign({ id: company.id, email: company.email, type: 'company' }, COMPANY_JWT_SECRET, { expiresIn: '7d' });
  return { token, company: { id: company.id, name: company.name, email: company.email, status: company.status } };
};

export const getCompanyById = async (id: string) => {
  const { data } = await supabaseAdmin.from('companies').select('*').eq('id', id).single();
  return data;
};

export const verifyCompanyToken = (token: string) => {
  try { return jwt.verify(token, COMPANY_JWT_SECRET) as { id: string; email: string }; }
  catch { return null; }
};

// ─── ADMIN: COMPANY MANAGEMENT ───────────────────────────────────────────────

export const getAllCompanies = async (page = 1, limit = 20) => {
  const from = (page - 1) * limit;
  const { data, error, count } = await supabaseAdmin
    .from('companies')
    .select('id, name, email, phone, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);
  if (error) return { data: [], total: 0 };
  return { data: data || [], total: count || 0 };
};

export const updateCompanyStatus = async (id: string, status: string, adminId: string) => {
  const { data, error } = await supabaseAdmin
    .from('companies')
    .update({ status, approved_by: adminId, approved_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return data;
};

// ─── JOBS ─────────────────────────────────────────────────────────────────────

export const createJob = async (data: {
  company_id?: string; posted_by_admin?: string;
  title: string; description: string; role_required: string;
  location: string; salary_range?: string; job_type?: string;
  slots?: number; expires_at?: string;
}) => {
  // Admin-posted jobs auto-approved
  const status = data.posted_by_admin ? 'approved' : 'pending';
  const { data: job, error } = await supabaseAdmin
    .from('jobs')
    .insert({ ...data, status })
    .select()
    .single();
  if (error) { console.error('❌ Create job:', error.message); return null; }
  return job;
};

export const getAllJobsAdmin = async (status?: string, page = 1) => {
  const from = (page - 1) * 20;
  let query = supabaseAdmin
    .from('jobs')
    .select('*, companies(id, name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + 19);
  if (status) query = query.eq('status', status);
  const { data, error, count } = await query;
  if (error) return { data: [], total: 0 };
  return { data: data || [], total: count || 0 };
};

export const updateJobStatus = async (id: string, status: string, adminId: string) => {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .update({ status, approved_by: adminId, approved_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return data;
};

export const getApprovedJobs = async (role?: string, page = 1) => {
  const from = (page - 1) * 20;
  let query = supabaseAdmin
    .from('jobs')
    .select('*, companies(id, name, logo_url)', { count: 'exact' })
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(from, from + 19);
  if (role) query = query.eq('role_required', role);
  const { data, error, count } = await query;
  if (error) return { data: [], total: 0 };
  return { data: data || [], total: count || 0 };
};

export const getJobById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select('*, companies(id, name, logo_url, description, address)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
};

export const getCompanyJobs = async (companyId: string) => {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select('*, job_applications(count)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
};

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

export const applyToJob = async (userId: string, jobId: string, coverNote?: string) => {
  const { data, error } = await supabaseAdmin
    .from('job_applications')
    .insert({ user_id: userId, job_id: jobId, cover_note: coverNote })
    .select()
    .single();
  if (error) { console.error('❌ Apply to job:', error.message); return null; }
  return data;
};

export const getUserApplications = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('job_applications')
    .select('*, jobs(id, title, location, job_type, role_required, companies(name, logo_url))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
};

export const getJobApplications = async (jobId: string, companyId: string) => {
  // Verify job belongs to company
  const { data: job } = await supabaseAdmin
    .from('jobs').select('company_id').eq('id', jobId).single();
  if (!job || job.company_id !== companyId) return null;

  const { data, error } = await supabaseAdmin
    .from('job_applications')
    .select(`
      *, users(id, full_name, phone, role,
        identity_verifications(nin_verified, selfie_url)
      )
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
};

export const updateApplicationStatus = async (
  id: string, status: string, companyId: string
) => {
  const { data, error } = await supabaseAdmin
    .from('job_applications')
    .update({ status, reviewed_by: companyId, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return data;
};

// ─── TALENT POOL ──────────────────────────────────────────────────────────────

export const getVerifiedPersonnel = async (role?: string, page = 1) => {
  const from = (page - 1) * 20;
  let query = supabaseAdmin
    .from('users')
    .select('id, full_name, role, created_at, identity_verifications(nin_verified, selfie_url)', { count: 'exact' })
    .eq('verification_status', 'verified')
    .order('created_at', { ascending: false })
    .range(from, from + 19);
  if (role) query = query.eq('role', role);
  const { data, error, count } = await query;
  if (error) return { data: [], total: 0 };
  return { data: data || [], total: count || 0 };
};
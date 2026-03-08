import { Request, Response, NextFunction } from 'express';
import { AdminRequest } from '../middlewares/adminAuth.middleware';
import { UserRequest } from '../middlewares/userAuth.middleware';
import { CompanyRequest } from '../middlewares/companyAuth.middleware';
import { supabaseAdmin } from '../config/supabase';
import {
  registerCompany, loginCompany,
  getAllCompanies, updateCompanyStatus,
  createJob, getAllJobsAdmin, updateJobStatus,
  getApprovedJobs, getJobById, getCompanyJobs,
  applyToJob, getUserApplications,
  getJobApplications, updateApplicationStatus,
  getVerifiedPersonnel,
} from '../services/marketplace.service';
import {
  notifyJobApplicationUpdate,
  notifyNewJobPosted,
  notifyCompanyStatusUpdate,
} from '../services/notification.service';

// ─── COMPANY AUTH ─────────────────────────────────────────────────────────────

export const companyRegisterHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone, address, description } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ status: 'error', message: 'Name, email and password are required.' }); return;
    }
    const company = await registerCompany({ name, email, password, phone, address, description });
    if (!company) { res.status(409).json({ status: 'error', message: 'Email already registered.' }); return; }
    res.status(201).json({ status: 'success', message: 'Registration submitted. Await admin approval.', data: company });
  } catch (error) { next(error); }
};

export const companyLoginHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ status: 'error', message: 'Email and password required.' }); return; }
    const result = await loginCompany(email, password);
    if (!result) { res.status(401).json({ status: 'error', message: 'Invalid credentials.' }); return; }
    if ('error' in result) {
      const messages: Record<string, string> = {
        pending: 'Your account is pending admin approval.',
        rejected: 'Your account has been rejected.',
        suspended: 'Your account has been suspended.',
      };
      res.status(403).json({ status: 'error', message: messages[result.error] || 'Account not active.' }); return;
    }
    res.status(200).json({ status: 'success', data: result });
  } catch (error) { next(error); }
};

export const companyProfileHandler = async (req: CompanyRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data } = await supabaseAdmin.from('companies').select('id, name, email, phone, address, description, logo_url, status').eq('id', req.company!.id).single();
    res.status(200).json({ status: 'success', data });
  } catch (error) { next(error); }
};

// ─── COMPANY: JOBS ────────────────────────────────────────────────────────────

export const companyGetJobsHandler = async (req: CompanyRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobs = await getCompanyJobs(req.company!.id);
    res.status(200).json({ status: 'success', data: jobs });
  } catch (error) { next(error); }
};

export const companyCreateJobHandler = async (req: CompanyRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, role_required, location, salary_range, job_type, slots, expires_at } = req.body;
    if (!title || !description || !role_required || !location) {
      res.status(400).json({ status: 'error', message: 'Title, description, role and location are required.' }); return;
    }
    const job = await createJob({ company_id: req.company!.id, title, description, role_required, location, salary_range, job_type, slots, expires_at });
    if (!job) { res.status(500).json({ status: 'error', message: 'Failed to create job.' }); return; }
    res.status(201).json({ status: 'success', message: 'Job submitted for admin approval.', data: job });
  } catch (error) { next(error); }
};

export const companyGetApplicationsHandler = async (req: CompanyRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobId = req.params.jobId as string;
    const applications = await getJobApplications(jobId, req.company!.id);
    if (applications === null) { res.status(403).json({ status: 'error', message: 'Access denied.' }); return; }
    res.status(200).json({ status: 'success', data: applications });
  } catch (error) { next(error); }
};

export const companyUpdateApplicationHandler = async (req: CompanyRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const app = await updateApplicationStatus(id, status, req.company!.id);
    if (!app) { res.status(500).json({ status: 'error', message: 'Failed to update application.' }); return; }

    // Notify applicant
    if (['shortlisted', 'hired', 'rejected'].includes(status)) {
      await notifyJobApplicationUpdate(id, status as 'shortlisted' | 'hired' | 'rejected');
    }

    res.status(200).json({ status: 'success', message: 'Application updated.', data: app });
  } catch (error) { next(error); }
};

export const companyGetTalentHandler = async (req: CompanyRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = req.query.role as string | undefined;
    const page = Number(req.query.page) || 1;
    const result = await getVerifiedPersonnel(role, page);
    res.status(200).json({ status: 'success', data: result.data, meta: { total: result.total, page } });
  } catch (error) { next(error); }
};

// ─── USER: JOBS ───────────────────────────────────────────────────────────────

export const userGetJobsHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = req.query.role as string | undefined;
    const page = Number(req.query.page) || 1;
    const result = await getApprovedJobs(role, page);
    res.status(200).json({ status: 'success', data: result.data, meta: { total: result.total, page } });
  } catch (error) { next(error); }
};

export const userGetJobHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const job = await getJobById(id);
    if (!job) { res.status(404).json({ status: 'error', message: 'Job not found.' }); return; }
    const { data: existing } = await supabaseAdmin
      .from('job_applications')
      .select('id, status')
      .eq('user_id', req.user!.id)
      .eq('job_id', id)
      .single();
    res.status(200).json({ status: 'success', data: { ...job, application: existing || null } });
  } catch (error) { next(error); }
};

export const userApplyJobHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const { data: user } = await supabaseAdmin.from('users').select('verification_status').eq('id', userId).single();
    if (!user || user.verification_status !== 'verified') {
      res.status(403).json({ status: 'error', message: 'You must be verified to apply for jobs.' }); return;
    }
    const { cover_note } = req.body;
    const application = await applyToJob(userId, id, cover_note);
    if (!application) { res.status(409).json({ status: 'error', message: 'You have already applied to this job.' }); return; }
    res.status(201).json({ status: 'success', message: 'Application submitted!', data: application });
  } catch (error) { next(error); }
};

export const userGetApplicationsHandler = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const applications = await getUserApplications(req.user!.id);
    res.status(200).json({ status: 'success', data: applications });
  } catch (error) { next(error); }
};

// ─── ADMIN: COMPANIES ─────────────────────────────────────────────────────────

export const adminGetCompaniesHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const result = await getAllCompanies(page);
    res.status(200).json({ status: 'success', data: result.data, meta: { total: result.total, page } });
  } catch (error) { next(error); }
};

export const adminUpdateCompanyHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const company = await updateCompanyStatus(id, status, req.admin!.id);
    if (!company) { res.status(500).json({ status: 'error', message: 'Failed to update company.' }); return; }

    // Notify company
    if (['approved', 'rejected', 'suspended'].includes(status)) {
      await notifyCompanyStatusUpdate(id, status as 'approved' | 'rejected' | 'suspended');
    }

    res.status(200).json({ status: 'success', message: `Company ${status}.`, data: company });
  } catch (error) { next(error); }
};

export const adminGetJobsHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const page = Number(req.query.page) || 1;
    const result = await getAllJobsAdmin(status, page);
    res.status(200).json({ status: 'success', data: result.data, meta: { total: result.total, page } });
  } catch (error) { next(error); }
};

export const adminUpdateJobHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const job = await updateJobStatus(id, status, req.admin!.id);
    if (!job) { res.status(500).json({ status: 'error', message: 'Failed to update job.' }); return; }

    // Notify users when job is approved
    if (status === 'approved') {
      await notifyNewJobPosted(id);
    }

    res.status(200).json({ status: 'success', message: `Job ${status}.`, data: job });
  } catch (error) { next(error); }
};

export const adminCreateJobHandler = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, role_required, location, salary_range, job_type, slots, expires_at } = req.body;
    if (!title || !description || !role_required || !location) {
      res.status(400).json({ status: 'error', message: 'Title, description, role and location are required.' }); return;
    }

    // Create job first (without status)
    const job = await createJob({ posted_by_admin: req.admin!.id, title, description, role_required, location, salary_range, job_type, slots, expires_at });
    if (!job) { res.status(500).json({ status: 'error', message: 'Failed to create job.' }); return; }

    // Auto-approve since admin posted it
    const { data: approvedJob } = await supabaseAdmin
      .from('jobs')
      .update({ status: 'approved', approved_by: req.admin!.id, approved_at: new Date().toISOString() })
      .eq('id', job.id)
      .select()
      .single();

    // Notify matching users
    await notifyNewJobPosted(job.id);

    res.status(201).json({ status: 'success', message: 'Job posted.', data: approvedJob || job });
  } catch (error) { next(error); }
};
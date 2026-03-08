import { supabaseAdmin } from '../config/supabase';
import axios from 'axios';

// ─── DB NOTIFICATIONS ─────────────────────────────────────────────────────────

export const createNotification = async (data: {
  recipient_type: 'user' | 'company' | 'admin';
  user_id?: string;
  company_id?: string;
  admin_id?: string;
  type: string;
  title: string;
  message: string;
}) => {
  const { error } = await supabaseAdmin.from('notifications').insert(data);
  if (error) console.error('❌ Create notification:', error.message);
};

export const getNotifications = async (
  recipient_type: 'user' | 'company' | 'admin',
  id: string,
  page = 1
) => {
  const from = (page - 1) * 20;
  const field = recipient_type === 'user' ? 'user_id'
    : recipient_type === 'company' ? 'company_id' : 'admin_id';

  const { data, error, count } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq(field, id)
    .order('created_at', { ascending: false })
    .range(from, from + 19);

  if (error) return { data: [], total: 0, unread: 0 };

  const { count: unread } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq(field, id)
    .eq('is_read', false);

  return { data: data || [], total: count || 0, unread: unread || 0 };
};

export const markAllRead = async (
  recipient_type: 'user' | 'company' | 'admin',
  id: string
) => {
  const field = recipient_type === 'user' ? 'user_id'
    : recipient_type === 'company' ? 'company_id' : 'admin_id';

  await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq(field, id)
    .eq('is_read', false);
};

export const markOneRead = async (notificationId: string) => {
  await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
};

// ─── TERMII SMS ───────────────────────────────────────────────────────────────

const sendSms = async (to: string, message: string) => {
  try {
    await axios.post(`${process.env.TERMII_BASE_URL}/api/sms/send`, {
      to,
      from: process.env.TERMII_SENDER_ID,
      sms: message,
      type: 'plain',
      channel: 'generic',
      api_key: process.env.TERMII_API_KEY,
    });
    console.log(`📱 SMS sent to ${to}`);
  } catch (err) {
    console.error('❌ SMS failed:', err);
  }
};

// ─── TERMII EMAIL ─────────────────────────────────────────────────────────────

const sendEmail = async (to: string, subject: string, body: string) => {
  try {
    await axios.post(`${process.env.TERMII_BASE_URL}/api/email/otp/send`, {
      api_key: process.env.TERMII_API_KEY,
      message_type: 'NUMERIC',
      to,
      from: process.env.TERMII_SENDER_ID || 'Bridigion',
      channel: 'email',
      subject,
      message: body,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Email failed:', err);
  }
};

// ─── NOTIFICATION TRIGGERS ────────────────────────────────────────────────────

export const notifyVerificationUpdate = async (
  userId: string,
  status: 'verified' | 'rejected' | 'flagged',
  reason?: string
) => {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('full_name, phone, email')
    .eq('id', userId)
    .single();

  if (!user) return;

  const titles: Record<string, string> = {
    verified: '✅ Verification Approved',
    rejected: '❌ Verification Rejected',
    flagged: '⚠️ Account Flagged for Review',
  };

  const messages: Record<string, string> = {
    verified: `Congratulations ${user.full_name}! Your identity has been verified. You now have full access to Bridigion.`,
    rejected: `Hi ${user.full_name}, your verification was rejected.${reason ? ` Reason: ${reason}` : ''} Please resubmit with correct documents.`,
    flagged: `Hi ${user.full_name}, your account has been flagged for manual review.${reason ? ` Reason: ${reason}` : ''} We will contact you shortly.`,
  };

  const title = titles[status];
  const message = messages[status];

  // In-app
  await createNotification({
    recipient_type: 'user',
    user_id: userId,
    type: `verification_${status}`,
    title,
    message,
  });

  // SMS
  if (user.phone) await sendSms(user.phone, `Bridigion: ${message}`);

  // Email
  if (user.email) await sendEmail(user.email, title, message);
};

export const notifyJobApplicationUpdate = async (
  applicationId: string,
  status: 'shortlisted' | 'hired' | 'rejected'
) => {
  const { data: app } = await supabaseAdmin
    .from('job_applications')
    .select('user_id, jobs(title, companies(name))')
    .eq('id', applicationId)
    .single();

  if (!app) return;

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('full_name, phone, email')
    .eq('id', app.user_id)
    .single();

  if (!user) return;

  const job = app.jobs as unknown as { title: string; companies: { name: string } };
  const company = job?.companies?.name || 'the company';
  const jobTitle = job?.title || 'a job';

  const titles: Record<string, string> = {
    shortlisted: '🎯 You\'ve Been Shortlisted!',
    hired: '🎉 Job Offer — Congratulations!',
    rejected: 'Application Update',
  };

  const messages: Record<string, string> = {
    shortlisted: `Great news ${user.full_name}! You've been shortlisted for ${jobTitle} at ${company}. Expect to hear from them soon.`,
    hired: `Congratulations ${user.full_name}! You've been hired for ${jobTitle} at ${company}. Check your dashboard for next steps.`,
    rejected: `Hi ${user.full_name}, your application for ${jobTitle} at ${company} was not successful this time. Keep applying!`,
  };

  const title = titles[status];
  const message = messages[status];

  await createNotification({
    recipient_type: 'user',
    user_id: app.user_id,
    type: `application_${status}`,
    title,
    message,
  });

  if (user.phone) await sendSms(user.phone, `Bridigion: ${message}`);
  if (user.email) await sendEmail(user.email, title, message);
};

export const notifyCommunityPostUpdate = async (
  postId: string,
  status: 'approved' | 'rejected'
) => {
  const { data: post } = await supabaseAdmin
    .from('community_posts')
    .select('user_id, company_id, poster_type, content')
    .eq('id', postId)
    .single();

  if (!post) return;

  const preview = (post.content as string).slice(0, 60) + '...';
  const title = status === 'approved' ? '✅ Post Published' : '❌ Post Rejected';
  const message = status === 'approved'
    ? `Your post "${preview}" has been approved and is now live on the community feed.`
    : `Your post "${preview}" was rejected by a moderator.`;

  if (post.poster_type === 'user' && post.user_id) {
    const { data: user } = await supabaseAdmin
      .from('users').select('phone, email').eq('id', post.user_id).single();

    await createNotification({
      recipient_type: 'user',
      user_id: post.user_id,
      type: `post_${status}`,
      title,
      message,
    });

    if (user?.phone) await sendSms(user.phone, `Bridigion: ${message}`);
    if (user?.email) await sendEmail(user.email, title, message);
  }

  if (post.poster_type === 'company' && post.company_id) {
    const { data: company } = await supabaseAdmin
      .from('companies').select('email').eq('id', post.company_id).single();

    await createNotification({
      recipient_type: 'company',
      company_id: post.company_id,
      type: `post_${status}`,
      title,
      message,
    });

    if (company?.email) await sendEmail(company.email, title, message);
  }
};

export const notifyNewJobPosted = async (jobId: string) => {
  const { data: job } = await supabaseAdmin
    .from('jobs')
    .select('title, location, role_required, companies(name)')
    .eq('id', jobId)
    .single();

  if (!job) return;

  const company = (job.companies as unknown as { name: string })?.name || 'A company';
  const title = '💼 New Job Available';
  const message = `${company} is hiring a ${job.role_required} for "${job.title}" in ${job.location}. Apply now on Bridigion!`;

  // Notify all verified users matching the role
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, phone, email')
    .eq('role', job.role_required)
    .eq('verification_status', 'verified');

  if (!users) return;

  // Batch insert in-app notifications
  const notifs = users.map(u => ({
    recipient_type: 'user' as const,
    user_id: u.id,
    type: 'new_job',
    title,
    message,
  }));

  if (notifs.length > 0) {
    const { error } = await supabaseAdmin.from('notifications').insert(notifs);
    if (error) console.error('❌ Batch job notifications:', error.message);
  }

  // SMS/Email only first 50 to avoid rate limits
  for (const user of users.slice(0, 50)) {
    if (user.phone) await sendSms(user.phone, `Bridigion: ${message}`);
    if (user.email) await sendEmail(user.email, title, message);
  }
};

export const notifyCompanyStatusUpdate = async (
  companyId: string,
  status: 'approved' | 'rejected' | 'suspended'
) => {
  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('name, email')
    .eq('id', companyId)
    .single();

  if (!company) return;

  const titles: Record<string, string> = {
    approved: '✅ Company Account Approved',
    rejected: '❌ Company Application Rejected',
    suspended: '⚠️ Company Account Suspended',
  };

  const messages: Record<string, string> = {
    approved: `Congratulations! ${company.name} has been approved on Bridigion. You can now post jobs and connect with security personnel.`,
    rejected: `We're sorry, ${company.name}'s application was not approved. Please contact support for more information.`,
    suspended: `${company.name}'s account has been suspended. Please contact support to resolve this.`,
  };

  const title = titles[status];
  const message = messages[status];

  await createNotification({
    recipient_type: 'company',
    company_id: companyId,
    type: `company_${status}`,
    title,
    message,
  });

  if (company.email) await sendEmail(company.email, title, message);
};
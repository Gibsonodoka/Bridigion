'use client';

import { useRouter } from 'next/navigation';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    location: string;
    job_type?: string;
    salary_range?: string;
    role_required: string;
    slots?: number;
    created_at: string;
    companies?: { name: string; logo_url?: string } | null;
    application?: { status: string } | null;
  };
  href?: string;
}

const roleColors: Record<string, string> = {
  guard: 'bg-blue-100 text-blue-700',
  driver: 'bg-purple-100 text-purple-700',
  bouncer: 'bg-slate-100 text-slate-700',
};

const appStatusColors: Record<string, string> = {
  applied: 'bg-yellow-100 text-yellow-700',
  shortlisted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  hired: 'bg-emerald-100 text-emerald-700',
};

export const JobCard = ({ job, href }: JobCardProps) => {
  const router = useRouter();
  const daysAgo = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000);

  return (
    <div
      onClick={() => router.push(href || `/jobs/${job.id}`)}
      className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Company logo */}
        <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-lg font-bold text-slate-500">
          {job.companies?.logo_url
            ? <img src={job.companies.logo_url} className="w-full h-full rounded-lg object-cover" alt="" />
            : (job.companies?.name?.[0] || '🏢')}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm truncate">{job.title}</h3>
          <p className="text-slate-500 text-xs mt-0.5">{job.companies?.name || 'Bridigion'}</p>
        </div>

        {job.application && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0 ${appStatusColors[job.application.status]}`}>
            {job.application.status}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[job.role_required] || 'bg-slate-100 text-slate-600'}`}>
          {job.role_required}
        </span>
        <span className="text-xs text-slate-400">📍 {job.location}</span>
        {job.job_type && <span className="text-xs text-slate-400 capitalize">· {job.job_type}</span>}
        {job.salary_range && <span className="text-xs text-slate-400">· {job.salary_range}</span>}
      </div>

      <div className="flex items-center justify-between mt-3">
        {job.slots && <span className="text-xs text-slate-400">{job.slots} slot{job.slots > 1 ? 's' : ''}</span>}
        <span className="text-xs text-slate-400 ml-auto">{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
      </div>
    </div>
  );
};
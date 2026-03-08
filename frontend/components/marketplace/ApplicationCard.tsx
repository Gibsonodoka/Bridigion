interface ApplicationCardProps {
  application: {
    id: string;
    status: string;
    cover_note?: string;
    created_at: string;
    jobs?: {
      title: string;
      location: string;
      job_type?: string;
      role_required: string;
      companies?: { name: string } | null;
    } | null;
  };
}

const statusColors: Record<string, string> = {
  applied: 'bg-yellow-100 text-yellow-700',
  shortlisted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  hired: 'bg-emerald-100 text-emerald-700',
};

const statusLabels: Record<string, string> = {
  applied: '⏳ Applied',
  shortlisted: '⭐ Shortlisted',
  rejected: '✕ Rejected',
  hired: '✅ Hired',
};

export const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const job = application.jobs;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">{job?.title || 'Job'}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{job?.companies?.name || 'Bridigion'}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span>📍 {job?.location}</span>
            {job?.job_type && <span className="capitalize">· {job.job_type}</span>}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusColors[application.status]}`}>
          {statusLabels[application.status] || application.status}
        </span>
      </div>
      {application.cover_note && (
        <p className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg p-3 line-clamp-2">
          {application.cover_note}
        </p>
      )}
      <p className="text-xs text-slate-400 mt-3">
        Applied {new Date(application.created_at).toLocaleDateString()}
      </p>
    </div>
  );
};
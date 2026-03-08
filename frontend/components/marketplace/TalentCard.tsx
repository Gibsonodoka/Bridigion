interface TalentCardProps {
  person: {
    id: string;
    full_name: string;
    role: string;
    created_at: string;
    identity_verifications?: { selfie_url?: string } | { selfie_url?: string }[] | null;
  };
}

const roleColors: Record<string, string> = {
  guard: 'bg-blue-100 text-blue-700',
  driver: 'bg-purple-100 text-purple-700',
  bouncer: 'bg-slate-100 text-slate-700',
};

export const TalentCard = ({ person }: TalentCardProps) => {
  const iv = Array.isArray(person.identity_verifications)
    ? person.identity_verifications[0]
    : person.identity_verifications;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
          {iv?.selfie_url
            ? <img src={iv.selfie_url} alt={person.full_name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">{person.full_name[0]}</div>}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{person.full_name}</p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[person.role] || 'bg-slate-100 text-slate-600'}`}>
            {person.role}
          </span>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">✓ Verified</span>
        </div>
      </div>
    </div>
  );
};
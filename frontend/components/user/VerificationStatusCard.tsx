interface Step {
  key: string;
  label: string;
  done: boolean;
}

interface VerificationStatusCardProps {
  status: string;
  steps: Step[];
  manualReview: boolean;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: 'Under Review', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: '⏳' },
  verified: { label: 'Verified', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: '✅' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: '❌' },
  flagged: { label: 'Flagged for Review', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: '🚩' },
};

export const VerificationStatusCard = ({ status, steps, manualReview }: VerificationStatusCardProps) => {
  const config = statusConfig[status] || statusConfig.pending;
  const completedSteps = steps.filter(s => s.done).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-900">Verification Progress</h3>
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.bg} ${config.color}`}>
          {config.icon} {config.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>{completedSteps} of {steps.length} steps completed</span>
          <span>{Math.round((completedSteps / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-slate-900 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              step.done
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}>
              {step.done ? '✓' : index + 1}
            </div>
            <span className={`text-sm ${step.done ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {manualReview && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700 font-medium">🔍 Manual Review Required</p>
          <p className="text-xs text-orange-600 mt-1">
            Your NIN verification requires manual review. Our team will contact you within 24–48 hours.
          </p>
        </div>
      )}
    </div>
  );
};
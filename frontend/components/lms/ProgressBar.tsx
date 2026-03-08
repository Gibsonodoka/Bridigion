interface ProgressBarProps {
  percent: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const ProgressBar = ({ percent, showLabel = true, size = 'md' }: ProgressBarProps) => {
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>{percent}% complete</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full ${height}`}>
        <div
          className={`bg-slate-900 ${height} rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
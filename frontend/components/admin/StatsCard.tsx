interface StatsCardProps {
  label: string;
  value: number;
  icon: string;
  color: 'blue' | 'yellow' | 'green' | 'red' | 'orange';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
};

export const StatsCard = ({ label, value, icon, color }: StatsCardProps) => {
  return (
    <div className={`rounded-xl border p-6 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-black">{value.toLocaleString()}</p>
      <p className="text-sm font-medium mt-1 opacity-80">{label}</p>
    </div>
  );
};
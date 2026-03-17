import Sparkline from './Sparkline';

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number[];
  color?: string;
}

export default function KPICard({ title, value, subtitle, trend, color = 'blue' }: Props) {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    yellow: 'border-yellow-500',
    red: 'border-red-500',
    purple: 'border-purple-500',
  };

  return (
    <div className={`bg-slate-800 rounded-lg p-4 border-l-4 ${colorMap[color] || colorMap.blue}`}>
      <p className="text-xs text-slate-400 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      {trend && trend.length > 1 && (
        <div className="mt-2">
          <Sparkline data={trend} color={color} />
        </div>
      )}
    </div>
  );
}

import { Alert } from '../types';

interface Props {
  alerts: Alert[];
}

export default function AlertBanner({ alerts }: Props) {
  const alertStyles: Record<string, string> = {
    alert: 'bg-red-900/30 border-red-500 text-red-300',
    warn: 'bg-yellow-900/30 border-yellow-500 text-yellow-300',
    info: 'bg-blue-900/30 border-blue-500 text-blue-300',
  };

  const icons: Record<string, string> = {
    alert: '!!',
    warn: '!',
    info: 'i',
  };

  // Show most recent alerts (last 5)
  const recentAlerts = alerts.slice(-5);

  return (
    <div className="mb-6 space-y-2">
      {recentAlerts.map((alert, i) => (
        <div
          key={i}
          className={`border-l-4 rounded p-3 flex items-start gap-3 ${alertStyles[alert.alert_type] || alertStyles.info}`}
        >
          <span className="text-xs font-bold mt-0.5 bg-slate-700/50 px-1.5 py-0.5 rounded">
            {icons[alert.alert_type]}
          </span>
          <div>
            <span className="text-xs text-slate-400 mr-2">{alert.week_label}</span>
            <span className="text-sm">{alert.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

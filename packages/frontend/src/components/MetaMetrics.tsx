import { useState } from 'react';
import { WeekData } from '../types';
import { api } from '../api';
import { fmtCurrency, fmtPercent, fmtNumber } from '../utils/formatting';

interface Props {
  weeks: WeekData[];
  onSync: () => void;
}

export default function MetaMetrics({ weeks, onSync }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await api.syncAllMeta();
      setSyncResult(`Synced ${result.synced} weeks from Meta.`);
      await onSync();
    } catch (err: any) {
      setSyncResult(`Sync failed: ${err.message}`);
    }
    setSyncing(false);
  };

  const handleSyncWeek = async (label: string) => {
    setSyncing(true);
    setSyncResult(null);
    try {
      await api.syncMeta([label]);
      setSyncResult(`Synced ${label} from Meta.`);
      await onSync();
    } catch (err: any) {
      setSyncResult(`Sync failed: ${err.message}`);
    }
    setSyncing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Meta Ad Metrics</h2>
        <button
          onClick={handleSyncAll}
          disabled={syncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded text-sm"
        >
          {syncing ? 'Syncing...' : 'Sync All from Meta'}
        </button>
      </div>

      {syncResult && (
        <div className={`mb-4 p-3 rounded text-sm ${syncResult.includes('failed') ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'}`}>
          {syncResult}
        </div>
      )}

      <div className="bg-slate-800 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
              <th className="text-left p-3">Week</th>
              <th className="text-right p-3">Spend</th>
              <th className="text-right p-3">Impressions</th>
              <th className="text-right p-3">Clicks</th>
              <th className="text-right p-3">CPM</th>
              <th className="text-right p-3">CTR</th>
              <th className="text-right p-3">CPC</th>
              <th className="text-right p-3">Leads</th>
              <th className="text-right p-3">CPL</th>
              <th className="text-right p-3">Connect Rate</th>
              <th className="text-right p-3">Last Synced</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {weeks.map(w => (
              <tr key={w.week_label} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="p-3 text-white font-medium">{w.week_label}</td>
                <td className="p-3 text-right">{fmtCurrency(w.spend)}</td>
                <td className="p-3 text-right">{fmtNumber(w.impressions)}</td>
                <td className="p-3 text-right">{fmtNumber(w.clicks)}</td>
                <td className="p-3 text-right">{fmtCurrency(w.cpm)}</td>
                <td className="p-3 text-right">{fmtPercent(w.ctr)}</td>
                <td className="p-3 text-right">{fmtCurrency(w.cpc)}</td>
                <td className="p-3 text-right">{fmtNumber(w.leads)}</td>
                <td className="p-3 text-right">{fmtCurrency(w.cost_per_lead)}</td>
                <td className="p-3 text-right">{fmtPercent(w.connect_rate)}</td>
                <td className="p-3 text-right text-xs text-slate-500">
                  {w.meta_last_synced_at ? new Date(w.meta_last_synced_at).toLocaleDateString() : '—'}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleSyncWeek(w.week_label)}
                    disabled={syncing}
                    className="text-blue-400 hover:text-blue-300 text-xs disabled:text-slate-600"
                  >
                    Sync
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

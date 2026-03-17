import { WeekData, Summary } from '../types';
import { fmtCurrency, fmtPercent, fmtNumber, fmtRatio } from '../utils/formatting';

interface Props {
  weeks: WeekData[];
  summary: Summary | null;
}

export default function FullFunnel({ weeks, summary }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Full Funnel View</h2>

      {summary && (
        <div className="bg-slate-800 rounded-lg p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">Aggregate Totals</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Total Spend</span>
              <p className="text-white font-bold">{fmtCurrency(summary.totalSpend)}</p>
            </div>
            <div>
              <span className="text-slate-400">Total Leads</span>
              <p className="text-white font-bold">{fmtNumber(summary.totalLeads)}</p>
            </div>
            <div>
              <span className="text-slate-400">Total Clients</span>
              <p className="text-white font-bold">{fmtNumber(summary.totalClients)}</p>
            </div>
            <div>
              <span className="text-slate-400">Total Revenue</span>
              <p className="text-white font-bold">{fmtCurrency(summary.totalRevenue)}</p>
            </div>
            <div>
              <span className="text-slate-400">ROAS</span>
              <p className="text-white font-bold">{fmtRatio(summary.overallROAS)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
              <th className="text-left p-3 sticky left-0 bg-slate-800">Week</th>
              <th className="text-right p-3">Spend</th>
              <th className="text-right p-3">Leads</th>
              <th className="text-right p-3">CPL</th>
              <th className="text-right p-3">Attendees</th>
              <th className="text-right p-3">Attend %</th>
              <th className="text-right p-3">Total Appts</th>
              <th className="text-right p-3">Live Calls</th>
              <th className="text-right p-3">Close Rate</th>
              <th className="text-right p-3">Clients</th>
              <th className="text-right p-3">CPA</th>
              <th className="text-right p-3">Revenue</th>
              <th className="text-right p-3">ROAS</th>
              <th className="text-right p-3">Proj Sales</th>
              <th className="text-right p-3">Proj CPA</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map(w => (
              <tr key={w.week_label} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="p-3 text-white font-medium sticky left-0 bg-slate-800">{w.week_label}</td>
                <td className="p-3 text-right">{fmtCurrency(w.spend)}</td>
                <td className="p-3 text-right">{fmtNumber(w.leads)}</td>
                <td className="p-3 text-right">{fmtCurrency(w.cost_per_lead)}</td>
                <td className="p-3 text-right">{fmtNumber(w.attendees)}</td>
                <td className="p-3 text-right">{fmtPercent(w.attendee_pct, true)}</td>
                <td className="p-3 text-right">{fmtNumber(w.total_appts)}</td>
                <td className="p-3 text-right">{fmtNumber(w.live_calls)}</td>
                <td className="p-3 text-right">{fmtPercent(w.close_rate, true)}</td>
                <td className="p-3 text-right">{fmtNumber(w.new_clients)}</td>
                <td className="p-3 text-right">{fmtCurrency(w.cpa)}</td>
                <td className="p-3 text-right">{fmtCurrency(w.revenue)}</td>
                <td className="p-3 text-right">{fmtRatio(w.roas)}</td>
                <td className="p-3 text-right">{w.total_sales_proj?.toFixed(1) ?? '—'}</td>
                <td className="p-3 text-right">{fmtCurrency(w.proj_cpa)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

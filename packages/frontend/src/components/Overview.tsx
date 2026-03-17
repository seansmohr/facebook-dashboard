import { WeekData, Summary } from '../types';
import { fmtCurrency, fmtPercent, fmtNumber, fmtRatio } from '../utils/formatting';
import KPICard from './KPICard';

interface Props {
  weeks: WeekData[];
  summary: Summary | null;
}

export default function Overview({ weeks, summary }: Props) {
  if (!summary) return <p className="text-slate-400">No data available.</p>;

  const spendTrend = weeks.map(w => w.spend ?? 0);
  const leadsTrend = weeks.map(w => w.leads ?? 0);
  const clientsTrend = weeks.map(w => w.new_clients ?? 0);
  const revenueTrend = weeks.map(w => w.revenue ?? 0);

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Campaign Overview</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Total Spend"
          value={fmtCurrency(summary.totalSpend)}
          trend={spendTrend}
          color="red"
        />
        <KPICard
          title="Total Leads"
          value={fmtNumber(summary.totalLeads)}
          subtitle={`Avg CPL: ${fmtCurrency(summary.avgCPL)}`}
          trend={leadsTrend}
          color="blue"
        />
        <KPICard
          title="New Clients"
          value={fmtNumber(summary.totalClients)}
          subtitle={`Avg CPA: ${fmtCurrency(summary.avgCPA)}`}
          trend={clientsTrend}
          color="green"
        />
        <KPICard
          title="Total Revenue"
          value={fmtCurrency(summary.totalRevenue)}
          subtitle={`ROAS: ${fmtRatio(summary.overallROAS)}`}
          trend={revenueTrend}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard title="Total Appts" value={fmtNumber(summary.totalAppts)} color="yellow" />
        <KPICard title="Live Calls" value={fmtNumber(summary.totalLiveCalls)} color="blue" />
        <KPICard title="Close Rate" value={fmtPercent(summary.overallCloseRate, true)} color="green" />
        <KPICard title="Overall ROAS" value={fmtRatio(summary.overallROAS)} color="purple" />
      </div>

      <h3 className="text-md font-semibold text-white mb-3">Weekly Breakdown</h3>
      <div className="bg-slate-800 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase">
              <th className="text-left p-3">Week</th>
              <th className="text-right p-3">Spend</th>
              <th className="text-right p-3">Leads</th>
              <th className="text-right p-3">CPL</th>
              <th className="text-right p-3">Clients</th>
              <th className="text-right p-3">Revenue</th>
              <th className="text-right p-3">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map(w => (
              <tr key={w.week_label} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="p-3 text-white font-medium">{w.week_label}</td>
                <td className="p-3 text-right">{fmtCurrency(w.spend)}</td>
                <td className="p-3 text-right">{fmtNumber(w.leads)}</td>
                <td className="p-3 text-right">{fmtCurrency(w.cost_per_lead)}</td>
                <td className="p-3 text-right">{fmtNumber(w.new_clients)}</td>
                <td className="p-3 text-right">{fmtCurrency(w.revenue)}</td>
                <td className="p-3 text-right">{fmtRatio(w.roas)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

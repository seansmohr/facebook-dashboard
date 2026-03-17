import { useState, useEffect } from 'react';
import { api } from './api';
import { WeekData, Alert, Summary } from './types';
import Layout from './components/Layout';
import Overview from './components/Overview';
import WeeklyDataEntry from './components/WeeklyDataEntry';
import MetaMetrics from './components/MetaMetrics';
import FullFunnel from './components/FullFunnel';
import AlertBanner from './components/AlertBanner';

type Tab = 'overview' | 'entry' | 'meta' | 'funnel';

export default function App() {
  const [tab, setTab] = useState<Tab>('overview');
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [weeksData, summaryData, alertsData] = await Promise.all([
        api.getWeeks(),
        api.getSummary(),
        api.getAlerts(),
      ]);
      setWeeks(weeksData);
      setSummary(summaryData);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <Layout tab={tab} setTab={setTab}>
      {alerts.length > 0 && <AlertBanner alerts={alerts} />}
      {tab === 'overview' && <Overview weeks={weeks} summary={summary} />}
      {tab === 'entry' && <WeeklyDataEntry weeks={weeks} onSave={loadData} />}
      {tab === 'meta' && <MetaMetrics weeks={weeks} onSync={loadData} />}
      {tab === 'funnel' && <FullFunnel weeks={weeks} summary={summary} />}
    </Layout>
  );
}

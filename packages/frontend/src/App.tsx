import { useState, useEffect } from 'react';
import { api, getToken, setToken, clearToken } from './api';
import { WeekData, Alert, Summary } from './types';
import Layout from './components/Layout';
import Overview from './components/Overview';
import WeeklyDataEntry from './components/WeeklyDataEntry';
import MetaMetrics from './components/MetaMetrics';
import FullFunnel from './components/FullFunnel';
import AlertBanner from './components/AlertBanner';

type Tab = 'overview' | 'entry' | 'meta' | 'funnel';

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setToken(password);
    try {
      await api.getWeeks();
      onLogin();
    } catch {
      clearToken();
      setError('Invalid password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold text-white mb-2">Mohr Ads Dashboard</h1>
        <p className="text-slate-400 text-sm mb-6">Enter password to continue</p>
        {error && <div className="bg-red-900/30 text-red-300 text-sm p-3 rounded mb-4">{error}</div>}
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-500"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white py-2 rounded font-medium"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('overview');
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

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
      setAuthenticated(true);
    } catch (err: any) {
      if (err.message === 'Unauthorized') {
        clearToken();
        setAuthenticated(false);
      } else {
        console.error('Failed to load data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (getToken()) {
      loadData();
    } else {
      setLoading(false);
      setAuthenticated(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginScreen onLogin={loadData} />;
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

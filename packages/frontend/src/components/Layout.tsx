import { ReactNode } from 'react';

type Tab = 'overview' | 'entry' | 'meta' | 'funnel';

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'entry', label: 'Weekly Data Entry' },
  { id: 'meta', label: 'Meta Metrics' },
  { id: 'funnel', label: 'Full Funnel' },
];

interface Props {
  tab: Tab;
  setTab: (t: Tab) => void;
  children: ReactNode;
}

export default function Layout({ tab, setTab, children }: Props) {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Mohr Ads Dashboard</h1>
            <p className="text-sm text-slate-400">Medicare Webinar Campaign Tracker</p>
          </div>
        </div>
      </header>
      <nav className="bg-slate-800 border-b border-slate-700 px-6">
        <div className="max-w-7xl mx-auto flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium rounded-t transition-colors ${
                tab === t.id
                  ? 'bg-slate-900 text-white border-t-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}

import { useState } from 'react';
import { WeekData } from '../types';
import { api } from '../api';
import { calculateDerivedFields } from '../utils/calculations';
import { fmtCurrency, fmtPercent, fmtRatio } from '../utils/formatting';

interface Props {
  weeks: WeekData[];
  onSave: () => void;
}

interface FieldDef {
  key: string;
  label: string;
  type: 'number' | 'text';
  readOnly?: boolean;
  format?: (v: number | null) => string;
}

const manualFields: FieldDef[] = [
  { key: 'attendees', label: '# of Attendees', type: 'number' },
  { key: 'autobooked_appts', label: '# of Autobooked Appts', type: 'number' },
  { key: 'total_appts', label: '# of Total Appts', type: 'number' },
  { key: 'appts_due', label: 'Appts Due', type: 'number' },
  { key: 'live_calls', label: '# of Live Calls', type: 'number' },
  { key: 'new_clients', label: '# of New Clients', type: 'number' },
  { key: 'future_sales', label: 'Future Sales in Pipeline', type: 'number' },
  { key: 'proj_close_rate', label: 'Proj Close Rate (%)', type: 'number' },
  { key: 'revenue', label: 'Revenue', type: 'number' },
  { key: 'avg_fyc', label: 'Avg FYC per Client', type: 'number' },
  { key: 'notes', label: 'Notes', type: 'text' },
];

const derivedFields: FieldDef[] = [
  { key: 'attendee_pct', label: 'Attendee %', type: 'number', readOnly: true, format: v => fmtPercent(v, true) },
  { key: 'autobook_rate', label: 'Autobook Rate', type: 'number', readOnly: true, format: v => fmtPercent(v, true) },
  { key: 'lead_to_appt_rate', label: 'Lead to Appt Rate', type: 'number', readOnly: true, format: v => fmtPercent(v, true) },
  { key: 'cost_per_appt', label: 'Cost per Appt', type: 'number', readOnly: true, format: v => fmtCurrency(v) },
  { key: 'appt_to_live_rate', label: 'Appt to Live Rate', type: 'number', readOnly: true, format: v => fmtPercent(v, true) },
  { key: 'close_rate', label: 'Close Rate', type: 'number', readOnly: true, format: v => fmtPercent(v, true) },
  { key: 'cpa', label: 'CPA', type: 'number', readOnly: true, format: v => fmtCurrency(v) },
  { key: 'roas', label: 'ROAS', type: 'number', readOnly: true, format: v => fmtRatio(v) },
];

export default function WeeklyDataEntry({ weeks, onSave }: Props) {
  const [selectedWeek, setSelectedWeek] = useState(weeks.length > 0 ? weeks[weeks.length - 1].week_label : '');
  const [form, setForm] = useState<Record<string, any>>(() => {
    const w = weeks.find(w => w.week_label === selectedWeek);
    return w ? { ...w } : {};
  });
  const [saving, setSaving] = useState(false);
  const [newWeekLabel, setNewWeekLabel] = useState('');

  const selectWeek = (label: string) => {
    setSelectedWeek(label);
    const w = weeks.find(w => w.week_label === label);
    setForm(w ? { ...w } : {});
  };

  const updateField = (key: string, value: string) => {
    const updated = { ...form };
    if (key === 'notes') {
      updated[key] = value;
    } else {
      updated[key] = value === '' ? null : parseFloat(value);
    }
    const derived = calculateDerivedFields(updated);
    setForm({ ...updated, ...derived });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveWeek(selectedWeek, form);
      await onSave();
    } catch (err) {
      console.error('Save failed:', err);
    }
    setSaving(false);
  };

  const handleAddWeek = async () => {
    if (!newWeekLabel.trim()) return;
    const label = newWeekLabel.trim();
    await api.saveWeek(label, { proj_close_rate: 65 });
    setNewWeekLabel('');
    await onSave();
    setSelectedWeek(label);
    setForm({ proj_close_rate: 65 });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Weekly Data Entry</h2>

      <div className="flex gap-4 mb-6 items-end flex-wrap">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Select Week</label>
          <select
            value={selectedWeek}
            onChange={e => selectWeek(e.target.value)}
            className="bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600"
          >
            {weeks.map(w => (
              <option key={w.week_label} value={w.week_label}>{w.week_label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 3/16 - 3/22"
            value={newWeekLabel}
            onChange={e => setNewWeekLabel(e.target.value)}
            className="bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 w-36"
          />
          <button
            onClick={handleAddWeek}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
          >
            Add Week
          </button>
        </div>
      </div>

      {selectedWeek && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">Manual Input</h3>
            <div className="space-y-3">
              {manualFields.map(f => (
                <div key={f.key} className="flex items-center gap-3">
                  <label className="text-sm text-slate-400 w-48 shrink-0">{f.label}</label>
                  {f.type === 'text' ? (
                    <textarea
                      value={form[f.key] ?? ''}
                      onChange={e => updateField(f.key, e.target.value)}
                      className="bg-slate-700 text-white rounded px-3 py-1.5 text-sm border border-slate-600 flex-1"
                      rows={2}
                    />
                  ) : (
                    <input
                      type="number"
                      step="any"
                      value={form[f.key] ?? ''}
                      onChange={e => updateField(f.key, e.target.value)}
                      className="bg-slate-700 text-white rounded px-3 py-1.5 text-sm border border-slate-600 w-32"
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white px-6 py-2 rounded text-sm font-medium"
            >
              {saving ? 'Saving...' : 'Save Week'}
            </button>
          </div>

          <div className="bg-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">Auto-Calculated</h3>
            <div className="space-y-3">
              {derivedFields.map(f => (
                <div key={f.key} className="flex items-center gap-3">
                  <label className="text-sm text-slate-400 w-48 shrink-0">{f.label}</label>
                  <span className="text-white text-sm font-medium">
                    {f.format ? f.format(form[f.key] ?? null) : (form[f.key] ?? '—')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

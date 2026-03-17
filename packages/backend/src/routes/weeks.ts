import { Router } from 'express';
import db from '../db';
import { calculateDerivedFields } from '../services/calculations';

const router = Router();

const MANUAL_FIELDS = [
  'spend', 'impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'leads',
  'cost_per_lead', 'landing_page_views', 'connect_rate',
  'attendees', 'autobooked_appts', 'total_appts', 'appts_due',
  'live_calls', 'new_clients', 'future_sales', 'proj_close_rate',
  'revenue', 'avg_fyc', 'notes',
];

const DERIVED_FIELDS = [
  'attendee_pct', 'autobook_rate', 'lead_to_appt_rate', 'cost_per_appt',
  'appt_to_live_rate', 'close_rate', 'cpa', 'total_sales_proj',
  'proj_cpa', 'conversion_rate', 'proj_conversion_rate', 'roas',
];

// GET /api/weeks
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM weeks ORDER BY id ASC').all();
  res.json({ success: true, data: rows });
});

// GET /api/weeks/summary — must be before /:label
router.get('/summary', (_req, res) => {
  const row = db.prepare(`
    SELECT
      SUM(spend) as totalSpend,
      SUM(leads) as totalLeads,
      SUM(new_clients) as totalClients,
      SUM(revenue) as totalRevenue,
      SUM(total_appts) as totalAppts,
      SUM(live_calls) as totalLiveCalls
    FROM weeks
  `).get() as Record<string, any>;

  const totalSpend = row.totalSpend || 0;
  const totalLeads = row.totalLeads || 0;
  const totalClients = row.totalClients || 0;
  const totalRevenue = row.totalRevenue || 0;
  const totalLiveCalls = row.totalLiveCalls || 0;

  res.json({
    success: true,
    data: {
      totalSpend,
      totalLeads,
      totalClients,
      totalRevenue,
      totalAppts: row.totalAppts || 0,
      totalLiveCalls,
      avgCPL: totalLeads > 0 ? totalSpend / totalLeads : null,
      avgCPA: totalClients > 0 ? totalSpend / totalClients : null,
      overallROAS: totalSpend > 0 ? totalRevenue / totalSpend : null,
      overallCloseRate: totalLiveCalls > 0 ? totalClients / totalLiveCalls : null,
    },
  });
});

// GET /api/weeks/:label
router.get('/:label', (req, res) => {
  const label = decodeURIComponent(req.params.label);
  const row = db.prepare('SELECT * FROM weeks WHERE week_label = ?').get(label);
  res.json({ success: true, data: row || null });
});

// PUT /api/weeks/:label
router.put('/:label', (req, res) => {
  const label = decodeURIComponent(req.params.label);
  const data = req.body;

  const derived = calculateDerivedFields(data);
  const merged = { ...data, ...derived };

  const allFields = [...MANUAL_FIELDS, ...DERIVED_FIELDS];
  const existing = db.prepare('SELECT id FROM weeks WHERE week_label = ?').get(label) as any;

  if (existing) {
    const setClauses = allFields
      .filter(f => merged[f] !== undefined)
      .map(f => `${f} = @${f}`);
    setClauses.push("updated_at = datetime('now')");

    const params: Record<string, any> = { week_label: label };
    for (const f of allFields) {
      if (merged[f] !== undefined) {
        params[f] = merged[f] ?? null;
      }
    }

    db.prepare(`UPDATE weeks SET ${setClauses.join(', ')} WHERE week_label = @week_label`).run(params);
  } else {
    const fields = ['week_label', 'year', ...allFields.filter(f => merged[f] !== undefined)];
    const placeholders = fields.map(f => `@${f}`);

    const params: Record<string, any> = {
      week_label: label,
      year: data.year || 2026,
    };
    for (const f of allFields) {
      if (merged[f] !== undefined) {
        params[f] = merged[f] ?? null;
      }
    }

    db.prepare(`INSERT INTO weeks (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`).run(params);
  }

  const row = db.prepare('SELECT * FROM weeks WHERE week_label = ?').get(label);
  res.json({ success: true, data: row });
});

// DELETE /api/weeks/:label
router.delete('/:label', (req, res) => {
  const label = decodeURIComponent(req.params.label);
  db.prepare('DELETE FROM weeks WHERE week_label = ?').run(label);
  res.json({ success: true });
});

export default router;

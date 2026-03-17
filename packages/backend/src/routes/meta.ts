import { Router } from 'express';
import db from '../db';
import { fetchMetaInsights, weekLabelToDateRange, validateToken, exchangeForLongLivedToken } from '../services/metaApi';
import { calculateDerivedFields } from '../services/calculations';

const router = Router();

// POST /api/meta/sync
router.post('/sync', async (req, res) => {
  try {
    const { weekLabel, weekLabels } = req.body;
    const labels: string[] = weekLabels || (weekLabel ? [weekLabel] : []);

    if (labels.length === 0) {
      return res.status(400).json({ success: false, error: 'Provide weekLabel or weekLabels' });
    }

    const token = process.env.META_ACCESS_TOKEN;
    const adAccountId = process.env.META_AD_ACCOUNT_ID;

    if (!token || !adAccountId) {
      return res.status(400).json({ success: false, error: 'Meta API credentials not configured' });
    }

    const results: Array<{ weekLabel: string; success: boolean; error?: string }> = [];

    for (const label of labels) {
      try {
        const timeRange = weekLabelToDateRange(label);
        const insights = await fetchMetaInsights({ adAccountId, accessToken: token, timeRange });

        const existing = db.prepare('SELECT * FROM weeks WHERE week_label = ?').get(label) as Record<string, any> | undefined;
        const merged = { ...(existing || {}), ...insights, landing_page_views: insights.landingPageViews };
        const derived = calculateDerivedFields(merged);

        if (existing) {
          db.prepare(`
            UPDATE weeks SET
              spend = ?, impressions = ?, clicks = ?, cpm = ?, ctr = ?, cpc = ?,
              leads = ?, cost_per_lead = ?, landing_page_views = ?, connect_rate = ?,
              attendee_pct = ?, autobook_rate = ?, lead_to_appt_rate = ?, cost_per_appt = ?,
              appt_to_live_rate = ?, close_rate = ?, cpa = ?, total_sales_proj = ?,
              proj_cpa = ?, conversion_rate = ?, proj_conversion_rate = ?, roas = ?,
              meta_last_synced_at = datetime('now'), updated_at = datetime('now')
            WHERE week_label = ?
          `).run(
            insights.spend, insights.impressions, insights.clicks, insights.cpm,
            insights.ctr, insights.cpc, insights.leads, insights.costPerLead,
            insights.landingPageViews, insights.connectRate,
            derived.attendee_pct, derived.autobook_rate, derived.lead_to_appt_rate,
            derived.cost_per_appt, derived.appt_to_live_rate, derived.close_rate,
            derived.cpa, derived.total_sales_proj, derived.proj_cpa,
            derived.conversion_rate, derived.proj_conversion_rate, derived.roas,
            label
          );
        } else {
          db.prepare(`
            INSERT INTO weeks (week_label, year, spend, impressions, clicks, cpm, ctr, cpc,
              leads, cost_per_lead, landing_page_views, connect_rate, meta_last_synced_at)
            VALUES (?, 2026, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          `).run(label, insights.spend, insights.impressions, insights.clicks,
            insights.cpm, insights.ctr, insights.cpc, insights.leads,
            insights.costPerLead, insights.landingPageViews, insights.connectRate);
        }

        results.push({ weekLabel: label, success: true });
      } catch (err: any) {
        results.push({ weekLabel: label, success: false, error: err.message });
      }
    }

    db.prepare('INSERT INTO meta_sync_log (weeks_synced, status) VALUES (?, ?)').run(
      results.filter(r => r.success).length,
      results.every(r => r.success) ? 'success' : 'partial'
    );

    res.json({ success: true, data: { synced: results.filter(r => r.success).length, results } });
  } catch (error: any) {
    db.prepare('INSERT INTO meta_sync_log (weeks_synced, status, error) VALUES (0, ?, ?)').run('error', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/meta/sync-all
router.post('/sync-all', async (req, res) => {
  try {
    const rows = db.prepare('SELECT week_label FROM weeks').all() as Array<{ week_label: string }>;
    const labels = rows.map(r => r.week_label);

    if (labels.length === 0) {
      return res.json({ success: true, data: { synced: 0, message: 'No weeks to sync' } });
    }

    // Forward to sync handler
    req.body = { weekLabels: labels };
    const token = process.env.META_ACCESS_TOKEN;
    const adAccountId = process.env.META_AD_ACCOUNT_ID;

    if (!token || !adAccountId) {
      return res.status(400).json({ success: false, error: 'Meta API credentials not configured' });
    }

    const results: Array<{ weekLabel: string; success: boolean; error?: string }> = [];

    for (const label of labels) {
      try {
        const timeRange = weekLabelToDateRange(label);
        const insights = await fetchMetaInsights({ adAccountId, accessToken: token, timeRange });

        db.prepare(`
          UPDATE weeks SET
            spend = ?, impressions = ?, clicks = ?, cpm = ?, ctr = ?, cpc = ?,
            leads = ?, cost_per_lead = ?, landing_page_views = ?, connect_rate = ?,
            meta_last_synced_at = datetime('now'), updated_at = datetime('now')
          WHERE week_label = ?
        `).run(
          insights.spend, insights.impressions, insights.clicks, insights.cpm,
          insights.ctr, insights.cpc, insights.leads, insights.costPerLead,
          insights.landingPageViews, insights.connectRate, label
        );

        results.push({ weekLabel: label, success: true });
      } catch (err: any) {
        results.push({ weekLabel: label, success: false, error: err.message });
      }
    }

    res.json({ success: true, data: { synced: results.filter(r => r.success).length, results } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/meta/status
router.get('/status', async (_req, res) => {
  try {
    const token = process.env.META_ACCESS_TOKEN;
    if (!token) {
      return res.json({ success: true, data: { connected: false, reason: 'No access token configured' } });
    }

    const tokenInfo = await validateToken(token);
    res.json({
      success: true,
      data: {
        connected: tokenInfo.isValid,
        expiresAt: tokenInfo.expiresAt,
        scopes: tokenInfo.scopes,
        adAccountId: process.env.META_AD_ACCOUNT_ID || 'not set',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/meta/exchange-token
router.post('/exchange-token', async (req, res) => {
  try {
    const { shortLivedToken } = req.body;
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!appId || !appSecret) {
      return res.status(400).json({ success: false, error: 'META_APP_ID and META_APP_SECRET must be set' });
    }
    if (!shortLivedToken) {
      return res.status(400).json({ success: false, error: 'shortLivedToken is required' });
    }

    const longLivedToken = await exchangeForLongLivedToken(appId, appSecret, shortLivedToken);
    res.json({ success: true, data: { accessToken: longLivedToken } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

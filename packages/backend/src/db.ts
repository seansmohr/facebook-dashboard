import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'mohr-ads.db');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

db.exec(`
  CREATE TABLE IF NOT EXISTS weeks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_label TEXT UNIQUE NOT NULL,
    year INTEGER NOT NULL DEFAULT 2026,
    spend REAL,
    impressions INTEGER,
    clicks INTEGER,
    cpm REAL,
    ctr REAL,
    cpc REAL,
    leads INTEGER,
    cost_per_lead REAL,
    landing_page_views INTEGER,
    connect_rate REAL,
    attendees INTEGER,
    autobooked_appts INTEGER,
    total_appts INTEGER,
    appts_due INTEGER,
    live_calls INTEGER,
    new_clients INTEGER,
    future_sales INTEGER,
    proj_close_rate REAL DEFAULT 65,
    revenue REAL,
    avg_fyc REAL,
    notes TEXT,
    attendee_pct REAL,
    autobook_rate REAL,
    lead_to_appt_rate REAL,
    cost_per_appt REAL,
    appt_to_live_rate REAL,
    close_rate REAL,
    cpa REAL,
    total_sales_proj REAL,
    proj_cpa REAL,
    conversion_rate REAL,
    proj_conversion_rate REAL,
    roas REAL,
    meta_last_synced_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS meta_sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    synced_at TEXT DEFAULT (datetime('now')),
    weeks_synced INTEGER,
    status TEXT,
    error TEXT
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_label TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    dismissed INTEGER DEFAULT 0
  );
`);

export default db;

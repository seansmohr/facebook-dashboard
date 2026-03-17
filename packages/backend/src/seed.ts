import db from './db';
import { calculateDerivedFields } from './services/calculations';

const seedData = [
  {
    week_label: '2/9 - 2/15', spend: 537.26, leads: 65, attendees: 5,
    autobooked_appts: 2, total_appts: 6, appts_due: 4, live_calls: 3,
    new_clients: 1, future_sales: 3, proj_close_rate: 65,
    revenue: 289.17, avg_fyc: 289.17,
  },
  {
    week_label: '2/16 - 2/22', spend: 1004.51, leads: 73, attendees: 13,
    autobooked_appts: 8, total_appts: 20, appts_due: 20, live_calls: 11,
    new_clients: 0, future_sales: 3, proj_close_rate: 65,
    revenue: 0, avg_fyc: 0,
  },
  {
    week_label: '2/23 - 3/1', spend: 1021.55, leads: 81, attendees: 44,
    autobooked_appts: 4, total_appts: 20, appts_due: 20, live_calls: 15,
    new_clients: 0, future_sales: 4, proj_close_rate: 65,
    revenue: 0, avg_fyc: 0, cpm: 81.79, ctr: 2.77, connect_rate: 84,
  },
  {
    week_label: '3/2 - 3/8', spend: 1046.90, leads: 53, attendees: 54,
    autobooked_appts: 6, total_appts: 45, appts_due: 45, live_calls: 6,
    new_clients: 4, future_sales: 2, proj_close_rate: 65,
    revenue: 3327.43, avg_fyc: 831.86, cpm: 89.17, ctr: 3.82, connect_rate: 73.21,
  },
  {
    week_label: '3/9 - 3/15', spend: 1166.66, leads: 54, attendees: 18,
    autobooked_appts: 3, total_appts: 26, appts_due: 26, live_calls: 11,
    new_clients: 2, future_sales: 2, proj_close_rate: 65,
    revenue: 1610.92, avg_fyc: 805.46, cpm: 101.15, ctr: 3.87, connect_rate: 68.61,
  },
];

export function seedDatabase() {
  const count = (db.prepare('SELECT COUNT(*) as cnt FROM weeks').get() as any).cnt;
  if (count > 0) return;

  console.log('Seeding database with initial data...');
  const insert = db.prepare(`
    INSERT INTO weeks (
      week_label, year, spend, impressions, clicks, cpm, ctr, cpc, leads,
      cost_per_lead, landing_page_views, connect_rate,
      attendees, autobooked_appts, total_appts, appts_due,
      live_calls, new_clients, future_sales, proj_close_rate,
      revenue, avg_fyc, notes,
      attendee_pct, autobook_rate, lead_to_appt_rate, cost_per_appt,
      appt_to_live_rate, close_rate, cpa, total_sales_proj,
      proj_cpa, conversion_rate, proj_conversion_rate, roas
    ) VALUES (
      @week_label, 2026, @spend, @impressions, @clicks, @cpm, @ctr, @cpc, @leads,
      @cost_per_lead, @landing_page_views, @connect_rate,
      @attendees, @autobooked_appts, @total_appts, @appts_due,
      @live_calls, @new_clients, @future_sales, @proj_close_rate,
      @revenue, @avg_fyc, @notes,
      @attendee_pct, @autobook_rate, @lead_to_appt_rate, @cost_per_appt,
      @appt_to_live_rate, @close_rate, @cpa, @total_sales_proj,
      @proj_cpa, @conversion_rate, @proj_conversion_rate, @roas
    )
  `);

  const insertMany = db.transaction((rows: any[]) => {
    for (const row of rows) {
      const derived = calculateDerivedFields(row);
      insert.run({
        week_label: row.week_label,
        spend: row.spend ?? null,
        impressions: row.impressions ?? null,
        clicks: row.clicks ?? null,
        cpm: row.cpm ?? null,
        ctr: row.ctr ?? null,
        cpc: row.cpc ?? null,
        leads: row.leads ?? null,
        cost_per_lead: derived.cost_per_lead ?? null,
        landing_page_views: row.landing_page_views ?? null,
        connect_rate: row.connect_rate ?? derived.connect_rate ?? null,
        attendees: row.attendees ?? null,
        autobooked_appts: row.autobooked_appts ?? null,
        total_appts: row.total_appts ?? null,
        appts_due: row.appts_due ?? null,
        live_calls: row.live_calls ?? null,
        new_clients: row.new_clients ?? null,
        future_sales: row.future_sales ?? null,
        proj_close_rate: row.proj_close_rate ?? 65,
        revenue: row.revenue ?? null,
        avg_fyc: row.avg_fyc ?? null,
        notes: row.notes ?? null,
        attendee_pct: derived.attendee_pct ?? null,
        autobook_rate: derived.autobook_rate ?? null,
        lead_to_appt_rate: derived.lead_to_appt_rate ?? null,
        cost_per_appt: derived.cost_per_appt ?? null,
        appt_to_live_rate: derived.appt_to_live_rate ?? null,
        close_rate: derived.close_rate ?? null,
        cpa: derived.cpa ?? null,
        total_sales_proj: derived.total_sales_proj ?? null,
        proj_cpa: derived.proj_cpa ?? null,
        conversion_rate: derived.conversion_rate ?? null,
        proj_conversion_rate: derived.proj_conversion_rate ?? null,
        roas: derived.roas ?? null,
      });
    }
  });

  insertMany(seedData);
  console.log(`Seeded ${seedData.length} weeks.`);
}

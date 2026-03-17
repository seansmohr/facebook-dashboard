export interface WeekData {
  week_label: string;
  year: number;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  cpm: number | null;
  ctr: number | null;
  cpc: number | null;
  leads: number | null;
  cost_per_lead: number | null;
  landing_page_views: number | null;
  connect_rate: number | null;
  attendees: number | null;
  autobooked_appts: number | null;
  total_appts: number | null;
  appts_due: number | null;
  live_calls: number | null;
  new_clients: number | null;
  future_sales: number | null;
  proj_close_rate: number;
  revenue: number | null;
  avg_fyc: number | null;
  notes: string;
  attendee_pct: number | null;
  autobook_rate: number | null;
  lead_to_appt_rate: number | null;
  cost_per_appt: number | null;
  appt_to_live_rate: number | null;
  close_rate: number | null;
  cpa: number | null;
  total_sales_proj: number | null;
  proj_cpa: number | null;
  conversion_rate: number | null;
  proj_conversion_rate: number | null;
  roas: number | null;
  meta_last_synced_at: string | null;
}

export interface Alert {
  id?: number;
  week_label: string;
  alert_type: 'alert' | 'warn' | 'info' | 'ok';
  message: string;
  dismissed?: boolean;
}

export interface Summary {
  totalSpend: number;
  totalLeads: number;
  totalClients: number;
  totalRevenue: number;
  totalAppts: number;
  totalLiveCalls: number;
  avgCPL: number | null;
  avgCPA: number | null;
  overallROAS: number | null;
  overallCloseRate: number | null;
}

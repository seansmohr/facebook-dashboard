export function calculateDerivedFields(data: Record<string, any>) {
  const s = data.spend ?? null;
  const l = data.leads ?? null;
  const att = data.attendees ?? null;
  const ab = data.autobooked_appts ?? null;
  const ta = data.total_appts ?? null;
  const ad = data.appts_due ?? null;
  const lc = data.live_calls ?? null;
  const nc = data.new_clients ?? null;
  const fs = data.future_sales ?? null;
  const pcr = data.proj_close_rate ?? 65;
  const rev = data.revenue ?? null;
  const clicks = data.clicks ?? null;
  const lpv = data.landing_page_views ?? null;

  const safe = (a: number | null, b: number | null) =>
    a !== null && b !== null && b !== 0 ? a / b : null;

  const cost_per_lead = safe(s, l);
  const attendee_pct = safe(att, l);
  const autobook_rate = safe(ab, att);
  const lead_to_appt_rate = safe(ta, l);
  const cost_per_appt = safe(s, ta);
  const appt_to_live_rate = safe(lc, ad);
  const close_rate = safe(nc, lc);
  const cpa = safe(s, nc);
  const total_sales_proj = (nc ?? 0) + (fs ?? 0) * (pcr / 100);
  const proj_cpa = s && total_sales_proj > 0 ? s / total_sales_proj : null;
  const conversion_rate = safe(nc, l);
  const proj_conversion_rate = l && total_sales_proj > 0 ? total_sales_proj / l : null;
  const roas = safe(rev, s);
  const connect_rate = clicks && lpv !== null ? (lpv / clicks) * 100 : null;

  return {
    cost_per_lead,
    attendee_pct,
    autobook_rate,
    lead_to_appt_rate,
    cost_per_appt,
    appt_to_live_rate,
    close_rate,
    cpa,
    total_sales_proj,
    proj_cpa,
    conversion_rate,
    proj_conversion_rate,
    roas,
    connect_rate,
  };
}

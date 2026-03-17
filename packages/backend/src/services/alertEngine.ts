interface WeekData {
  week_label: string;
  spend: number | null;
  leads: number | null;
  cpm: number | null;
  ctr: number | null;
  connect_rate: number | null;
  cost_per_lead: number | null;
  attendees: number | null;
  live_calls: number | null;
  new_clients: number | null;
  appts_due: number | null;
  revenue: number | null;
  attendee_pct: number | null;
  close_rate: number | null;
  cpa: number | null;
  roas: number | null;
}

interface Alert {
  week_label: string;
  alert_type: 'alert' | 'warn' | 'info';
  message: string;
}

export function generateAlerts(currentWeek: WeekData, previousWeek: WeekData | null): Alert[] {
  const alerts: Alert[] = [];
  const wk = currentWeek.week_label;

  if (!currentWeek.spend || !currentWeek.leads) return alerts;

  const cpl = currentWeek.cost_per_lead || (currentWeek.spend && currentWeek.leads ? currentWeek.spend / currentWeek.leads : null);

  if (previousWeek && previousWeek.spend && previousWeek.leads) {
    const prevCPL = previousWeek.cost_per_lead || (previousWeek.spend / previousWeek.leads);

    if (cpl && prevCPL && cpl > prevCPL * 1.15) {
      const pctIncrease = ((cpl / prevCPL - 1) * 100).toFixed(0);
      alerts.push({
        week_label: wk,
        alert_type: 'warn',
        message: `CPL increased ${pctIncrease}% week-over-week ($${prevCPL.toFixed(2)} → $${cpl.toFixed(2)})`,
      });
    }

    if (
      currentWeek.ctr && previousWeek.ctr &&
      currentWeek.ctr > previousWeek.ctr &&
      cpl && prevCPL && cpl > prevCPL
    ) {
      alerts.push({
        week_label: wk,
        alert_type: 'alert',
        message: 'CTR rising but CPL also rising — possible lead quality degradation from audience expansion',
      });
    }

    if (currentWeek.close_rate !== null && previousWeek.close_rate !== null) {
      if (currentWeek.close_rate < previousWeek.close_rate - 0.10) {
        alerts.push({
          week_label: wk,
          alert_type: 'warn',
          message: `Close rate dropped from ${(previousWeek.close_rate * 100).toFixed(1)}% to ${(currentWeek.close_rate * 100).toFixed(1)}%`,
        });
      }
    }
  }

  if (currentWeek.connect_rate !== null && currentWeek.connect_rate < 70) {
    alerts.push({
      week_label: wk,
      alert_type: 'alert',
      message: `Connect rate at ${currentWeek.connect_rate.toFixed(1)}% — check placement mix and landing page load time`,
    });
  }

  if (currentWeek.roas !== null && currentWeek.roas < 1.0) {
    alerts.push({
      week_label: wk,
      alert_type: 'warn',
      message: `ROAS below 1.0 (${currentWeek.roas.toFixed(2)}x) — spending more than earning this week`,
    });
  }

  if (currentWeek.attendee_pct !== null && currentWeek.attendee_pct < 0.20) {
    alerts.push({
      week_label: wk,
      alert_type: 'info',
      message: `Webinar attendance rate is ${(currentWeek.attendee_pct * 100).toFixed(1)}% — consider adding reminder sequence`,
    });
  }

  if (currentWeek.cpa !== null && currentWeek.cpa > 500) {
    alerts.push({
      week_label: wk,
      alert_type: 'alert',
      message: `CPA at $${currentWeek.cpa.toFixed(2)} — exceeds $500 threshold`,
    });
  }

  return alerts;
}

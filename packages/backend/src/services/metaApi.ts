interface MetaInsightsParams {
  adAccountId: string;
  accessToken: string;
  timeRange: { since: string; until: string };
  level?: 'account' | 'campaign' | 'adset' | 'ad';
}

interface MetaInsightsResponse {
  spend: number;
  impressions: number;
  clicks: number;
  cpm: number;
  ctr: number;
  cpc: number;
  leads: number;
  costPerLead: number;
  landingPageViews: number;
  connectRate: number;
}

const META_API_VERSION = 'v21.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export async function fetchMetaInsights(params: MetaInsightsParams): Promise<MetaInsightsResponse> {
  const { adAccountId, accessToken, timeRange, level = 'account' } = params;

  const fields = [
    'spend', 'impressions', 'cpm', 'ctr', 'cpc',
    'actions', 'cost_per_action_type',
  ].join(',');

  const url = new URL(`${META_BASE_URL}/${adAccountId}/insights`);
  url.searchParams.set('fields', fields);
  url.searchParams.set('time_range', JSON.stringify(timeRange));
  url.searchParams.set('level', level);
  url.searchParams.set('access_token', accessToken);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.json() as any;
    throw new Error(`Meta API Error: ${error.error?.message || response.statusText}`);
  }

  const json = await response.json() as any;
  if (!json.data || json.data.length === 0) {
    return {
      spend: 0, impressions: 0, clicks: 0, cpm: 0,
      ctr: 0, cpc: 0, leads: 0, costPerLead: 0,
      landingPageViews: 0, connectRate: 0,
    };
  }

  const row = json.data[0];
  const actions: Array<{ action_type: string; value: string }> = row.actions || [];
  const costPerAction: Array<{ action_type: string; value: string }> = row.cost_per_action_type || [];

  const getAction = (type: string): number => {
    const found = actions.find(a => a.action_type === type);
    return found ? parseFloat(found.value) : 0;
  };

  const getCostPerAction = (type: string): number => {
    const found = costPerAction.find(a => a.action_type === type);
    return found ? parseFloat(found.value) : 0;
  };

  const clicks = getAction('link_click');
  const leads = getAction('lead') || getAction('offsite_conversion.fb_pixel_lead');
  const landingPageViews = getAction('landing_page_view');
  const connectRate = clicks > 0 ? (landingPageViews / clicks) * 100 : 0;

  return {
    spend: parseFloat(row.spend) || 0,
    impressions: parseInt(row.impressions) || 0,
    clicks,
    cpm: parseFloat(row.cpm) || 0,
    ctr: parseFloat(row.ctr) || 0,
    cpc: parseFloat(row.cpc) || 0,
    leads,
    costPerLead: getCostPerAction('lead') || getCostPerAction('offsite_conversion.fb_pixel_lead'),
    landingPageViews,
    connectRate,
  };
}

export async function exchangeForLongLivedToken(
  appId: string,
  appSecret: string,
  shortLivedToken: string
): Promise<string> {
  const url = new URL(`${META_BASE_URL}/oauth/access_token`);
  url.searchParams.set('grant_type', 'fb_exchange_token');
  url.searchParams.set('client_id', appId);
  url.searchParams.set('client_secret', appSecret);
  url.searchParams.set('fb_exchange_token', shortLivedToken);

  const response = await fetch(url.toString());
  const json = await response.json() as any;
  if (json.error) {
    throw new Error(`Token exchange failed: ${json.error.message}`);
  }
  return json.access_token;
}

export async function validateToken(accessToken: string): Promise<{
  isValid: boolean;
  expiresAt: Date | null;
  scopes: string[];
}> {
  const url = new URL(`${META_BASE_URL}/debug_token`);
  url.searchParams.set('input_token', accessToken);
  url.searchParams.set('access_token', accessToken);

  try {
    const response = await fetch(url.toString());
    const json = await response.json() as any;
    const data = json.data;
    return {
      isValid: data?.is_valid || false,
      expiresAt: data?.expires_at ? new Date(data.expires_at * 1000) : null,
      scopes: data?.scopes || [],
    };
  } catch {
    return { isValid: false, expiresAt: null, scopes: [] };
  }
}

export function weekLabelToDateRange(weekLabel: string, year: number = 2026): { since: string; until: string } {
  const parts = weekLabel.split(' - ').map(s => s.trim());
  if (parts.length !== 2) throw new Error(`Invalid week label: ${weekLabel}`);

  const parseDate = (str: string): string => {
    const [month, day] = str.split('/').map(Number);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  return {
    since: parseDate(parts[0]),
    until: parseDate(parts[1]),
  };
}

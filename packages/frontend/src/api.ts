const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const AUTH_KEY = 'mohr_dashboard_token';

export function getToken(): string | null {
  return localStorage.getItem(AUTH_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(AUTH_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(AUTH_KEY);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (res.status === 401) {
    throw new Error('Unauthorized');
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'API request failed');
  return json.data;
}

export const api = {
  getWeeks: () => request<any[]>('/weeks'),
  getWeek: (label: string) => request<any>(`/weeks/${encodeURIComponent(label)}`),
  saveWeek: (label: string, data: any) =>
    request<any>(`/weeks/${encodeURIComponent(label)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getSummary: () => request<any>('/weeks/summary'),
  getAlerts: () => request<any[]>('/alerts'),
  syncMeta: (weekLabels: string[]) =>
    request<any>('/meta/sync', {
      method: 'POST',
      body: JSON.stringify({ weekLabels }),
    }),
  syncAllMeta: () =>
    request<any>('/meta/sync-all', { method: 'POST' }),
  getMetaStatus: () => request<any>('/meta/status'),
};

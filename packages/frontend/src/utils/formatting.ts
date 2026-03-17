export function fmtCurrency(val: number | null | undefined): string {
  if (val == null) return '—';
  return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtPercent(val: number | null | undefined, isDecimal = false): string {
  if (val == null) return '—';
  const pct = isDecimal ? val * 100 : val;
  return pct.toFixed(1) + '%';
}

export function fmtNumber(val: number | null | undefined): string {
  if (val == null) return '—';
  return val.toLocaleString('en-US');
}

export function fmtRatio(val: number | null | undefined): string {
  if (val == null) return '—';
  return val.toFixed(2) + 'x';
}

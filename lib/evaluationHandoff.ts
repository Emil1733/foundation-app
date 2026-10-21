'use client';

const KEY = 'foundationrisk:evaluation-address:v1';
const MAX_AGE = 10 * 60 * 1000;

/** Optional same-tab prefill; never put property addresses in new URLs. */
export function saveEvaluationAddress(value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(KEY);
    const address = value.trim();
    if (address.length < 5 || address.length > 200) return;
    window.sessionStorage.setItem(KEY, JSON.stringify({ address, savedAt: Date.now() }));
  } catch { /* Manual entry remains available when storage is blocked. */ }
}

export function takeEvaluationAddress(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const age = Date.now() - data.savedAt;
    if (typeof data.address !== 'string' || data.address.trim().length < 5
      || data.address.length > 200 || !Number.isFinite(data.savedAt)
      || age < 0 || age >= MAX_AGE) return null;
    return data.address.trim();
  } catch { return null; }
}

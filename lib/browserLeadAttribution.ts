'use client';

import { normalizeLeadAttribution, publicLandingPath, referralCategory, type LeadAttribution } from './leadAttribution';

const STORAGE_KEY = 'foundationrisk:landing:v1';
const MAX_AGE = 30 * 60 * 1000;
let memory: { capturedAt: number; data: LeadAttribution } | null = null;

export function getLeadAttribution(): LeadAttribution | null {
  if (typeof window === 'undefined') return null;
  const now = Date.now();
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const data = normalizeLeadAttribution(parsed.data);
      if (data && Number.isFinite(parsed.capturedAt) && now >= parsed.capturedAt && now - parsed.capturedAt < MAX_AGE) {
        memory = { capturedAt: parsed.capturedAt, data };
        return data;
      }
    }
  } catch {
    // Browser storage is optional; submissions must work without it.
  }
  if (memory && now - memory.capturedAt < MAX_AGE) return memory.data;
  const landingPath = publicLandingPath(window.location.pathname);
  if (!landingPath) return null;
  const params = new URLSearchParams(window.location.search);
  const data = normalizeLeadAttribution({
    version: 1, landingPath,
    referralCategory: referralCategory(document.referrer, window.location.origin),
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
  });
  if (!data) return null;
  memory = { capturedAt: now, data };
  try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memory)); } catch { /* optional */ }
  return data;
}

export type LeadAttribution = {
  version: 1;
  landingPath: string;
  referralCategory: 'search' | 'social' | 'referral' | 'direct_or_unknown';
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

// Restrict paths to public routes; never retain form query strings or addresses.
export function publicLandingPath(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 200) return null;
  if (/^\/(?:services\/foundation-repair\/[a-z0-9.-]+|learn(?:\/[a-z0-9.-]+(?:\/\d+)?)?|locations(?:\/[a-z-]+(?:\/page\/\d+)?)?|book-analysis|about|contact|reviews|quiz|privacy|terms|disclaimer)?$/.test(value)) return value;
  return null;
}

function campaignLabel(value: unknown): string | undefined {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? value : undefined;
}

export function normalizeLeadAttribution(input: unknown): LeadAttribution | null {
  if (!input || typeof input !== 'object') return null;
  const x = input as Record<string, unknown>;
  const landingPath = publicLandingPath(x.landingPath);
  if (!landingPath || x.version !== 1) return null;
  const categories = ['search', 'social', 'referral', 'direct_or_unknown'];
  return {
    version: 1,
    landingPath,
    referralCategory: categories.includes(String(x.referralCategory))
      ? x.referralCategory as LeadAttribution['referralCategory'] : 'direct_or_unknown',
    utmSource: campaignLabel(x.utmSource),
    utmMedium: campaignLabel(x.utmMedium),
    utmCampaign: campaignLabel(x.utmCampaign),
  };
}

export function referralCategory(referrer: string, origin: string): LeadAttribution['referralCategory'] {
  try {
    const url = new URL(referrer);
    if (url.origin === origin) return 'direct_or_unknown';
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (/^(?:google\.(?:com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})|bing\.com|search\.yahoo\.com|duckduckgo\.com)$/.test(host)) return 'search';
    if (/(^|\.)(facebook\.com|instagram\.com|linkedin\.com|pinterest\.com|reddit\.com|t\.co|x\.com)$/.test(host)) return 'social';
    return 'referral';
  } catch {
    return 'direct_or_unknown';
  }
}

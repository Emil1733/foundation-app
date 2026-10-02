import { hasUsableSoilRecord, shouldIndexServicePage } from '@/lib/serviceIndexability';
import { loadSitemapLocations } from '@/lib/sitemapData';
import { renderUrlSet, sitemapResponse, type SitemapEntry } from '@/lib/sitemapXml';

const BASE_URL = 'https://foundationrisk.org';

const STATE_ROUTES: Record<string, string> = {
    AZ: 'arizona',
    CO: 'colorado',
    FL: 'florida',
    GA: 'georgia',
    KS: 'kansas',
    LA: 'louisiana',
    MO: 'missouri',
    MS: 'mississippi',
    NC: 'north-carolina',
    NV: 'nevada',
    OK: 'oklahoma',
    SC: 'south-carolina',
    TN: 'tennessee',
    TX: 'texas',
    UT: 'utah',
    VA: 'virginia',
};

const CORE_ENTRIES: SitemapEntry[] = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/learn`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/locations`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/book-analysis`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/disclaimer`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
];

export const revalidate = 86400;

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ name: string }> },
) {
    const { name } = await params;
    if (!['core.xml', 'services.xml', 'soil-reports.xml'].includes(name)) {
        return new Response('Not found', { status: 404 });
    }

    const locations = await loadSitemapLocations();

    if (name === 'core.xml') {
        const availableStates = new Set(locations.map((location) => location.state));
        const stateEntries = Object.entries(STATE_ROUTES)
            .filter(([state]) => availableStates.has(state))
            .map(([, slug]): SitemapEntry => ({
                url: `${BASE_URL}/locations/${slug}`,
                changeFrequency: 'weekly',
                priority: 0.8,
            }));

        return sitemapResponse(renderUrlSet([...CORE_ENTRIES, ...stateEntries]));
    }

    if (name === 'services.xml') {
        const entries = locations
            .filter((location) => shouldIndexServicePage(location.slug, location.soil_cache))
            .map((location): SitemapEntry => ({
                url: `${BASE_URL}/services/foundation-repair/${location.slug}`,
                lastModified: location.created_at,
                changeFrequency: 'weekly',
                priority: 0.9,
            }));

        return sitemapResponse(renderUrlSet(entries));
    }

    const entries = locations
        .filter((location) => hasUsableSoilRecord(location.soil_cache))
        .map((location): SitemapEntry => ({
            url: `${BASE_URL}/learn/${location.slug}-soil-analysis`,
            lastModified: location.created_at,
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

    return sitemapResponse(renderUrlSet(entries));
}

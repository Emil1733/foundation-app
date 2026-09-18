import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { hasUsableSoilRecord, shouldIndexServicePage } from '@/lib/serviceIndexability';

const BASE_URL = 'https://foundationrisk.org';

export const revalidate = 86400; // ISR: Cache sitemap for 24 hours to prevent Supabase query exhaustion

type SitemapLocation = {
    slug: string;
    created_at: string;
    soil_cache:
        | { map_unit_name?: string | null }
        | Array<{ map_unit_name?: string | null }>
        | null;
};

const STATE_SLUGS = [
    'texas', 'florida', 'georgia', 'colorado', 'tennessee', 'north-carolina',
    'arizona', 'kansas', 'oklahoma', 'mississippi', 'louisiana', 'missouri',
    'south-carolina', 'virginia', 'nevada', 'utah',
];

const stateUrls: MetadataRoute.Sitemap = STATE_SLUGS.map((state) => ({
    url: `${BASE_URL}/locations/${state}`,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
}));

const coreUrls: MetadataRoute.Sitemap = [
    {
        url: BASE_URL,
        changeFrequency: 'daily',
        priority: 1,
    },
    {
        url: `${BASE_URL}/learn`,
        changeFrequency: 'daily',
        priority: 0.9,
    },
    {
        url: `${BASE_URL}/locations`,
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    {
        url: `${BASE_URL}/book-analysis`,
        changeFrequency: 'monthly',
        priority: 0.8,
    },
    {
        url: `${BASE_URL}/about`,
        changeFrequency: 'monthly',
        priority: 0.6,
    },
    {
        url: `${BASE_URL}/contact`,
        changeFrequency: 'monthly',
        priority: 0.6,
    },
    {
        url: `${BASE_URL}/disclaimer`,
        changeFrequency: 'yearly',
        priority: 0.3,
    },
    {
        url: `${BASE_URL}/privacy`,
        changeFrequency: 'yearly',
        priority: 0.3,
    },
    {
        url: `${BASE_URL}/terms`,
        changeFrequency: 'yearly',
        priority: 0.3,
    },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch all cities using pagination to bypass Supabase's 1,000-row response limit.
    let locations: SitemapLocation[] = [];
    let from = 0;
    const step = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('target_locations')
            .select('slug, created_at, soil_cache(map_unit_name)')
            .order('slug', { ascending: true })
            .range(from, from + step - 1);

        if (error || !data || data.length === 0) {
            hasMore = false;
        } else {
            locations = locations.concat(data);
            if (data.length < step) hasMore = false;
            from += step;
        }
    }

    // Keep important static pages discoverable even if Supabase is temporarily unavailable.
    if (locations.length === 0) return [...coreUrls, ...stateUrls];

    const cityUrls = locations
        .filter((loc) => shouldIndexServicePage(loc.slug, loc.soil_cache))
        .map((loc) => ({
            url: `${BASE_URL}/services/foundation-repair/${loc.slug}`,
            lastModified: new Date(loc.created_at),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }));

    // Soil reports depend on actual mapped soil data. Do not advertise fallback-only
    // reports in the sitemap while their soil record is missing or unusable.
    const articleUrls = locations
        .filter((loc) => hasUsableSoilRecord(loc.soil_cache))
        .map((loc) => ({
            url: `${BASE_URL}/learn/${loc.slug}-soil-analysis`,
            lastModified: new Date(loc.created_at),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

    return [...coreUrls, ...stateUrls, ...cityUrls, ...articleUrls];
}

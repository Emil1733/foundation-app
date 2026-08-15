import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

// TODO: Update this to your real custom domain when you buy one.
const BASE_URL = 'https://foundationrisk.org';

export const revalidate = 0; // CRITICAL: Force Next.js to dynamically render the sitemap so new cities appear instantly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Fetch all cities using a pagination loop to bypass the Supabase 1,000 row hard limit
    let locations: any[] = [];
    let from = 0;
    const step = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('target_locations')
            .select('slug, created_at')
            .range(from, from + step - 1);

        if (error || !data || data.length === 0) {
            hasMore = false;
        } else {
            locations = locations.concat(data);
            if (data.length < step) hasMore = false; // We reached the end
            from += step;
        }
    }

    if (locations.length === 0) return [];

    const cityUrls = locations.map((loc) => ({
        url: `${BASE_URL}/services/foundation-repair/${loc.slug}`,
        lastModified: new Date(loc.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.9, // Direct homepage links
    }));

    // NEW: Programmatic Soil Reports (/learn/...)
    const articleUrls = locations.map((loc) => ({
        url: `${BASE_URL}/learn/${loc.slug}-soil-analysis`,
        lastModified: new Date(loc.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8, // Deeper educational content
    }));

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/learn`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/locations`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...cityUrls,
        ...articleUrls,
    ];
}

import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

// TODO: Update this to your real custom domain when you buy one.
const BASE_URL = 'https://foundationrisk.org';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Fetch all cities 
    // We limit to 50,000 as that is the standard sitemap limit per file.
    // If we grow larger, we will need sitemap indices.
    const { data: locations } = await supabase
        .from('target_locations')
        .select('slug, created_at');

    if (!locations) return [];

    const cityUrls = locations.map((loc) => ({
        url: `${BASE_URL}/services/foundation-repair/${loc.slug}`,
        lastModified: new Date(loc.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.9, // Direct homepage links
    }));

    // NEW: Programmatic Soil Reports (/learn/...)
    const articleUrls = locations.map((loc) => ({
        url: `${BASE_URL}/learn/${loc.slug}-soil-analysis`,
        lastModified: new Date(),
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
        ...cityUrls,
        ...articleUrls,
    ];
}

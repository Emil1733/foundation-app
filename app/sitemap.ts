import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// TODO: Update this to your real custom domain when you buy one.
const BASE_URL = 'https://foundation-app-self.vercel.app';

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
        priority: 0.8,
    }));

    // NEW: Programmatic Soil Reports (/learn/...)
    const articleUrls = locations.map((loc) => ({
        url: `${BASE_URL}/learn/${loc.slug}-soil-analysis`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9, // Higher priority as these are our "Gold" content
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

import { supabase } from '@/lib/supabase';

export type SitemapLocation = {
    slug: string;
    state: string;
    created_at: string;
    soil_cache:
        | { map_unit_name?: string | null }
        | Array<{ map_unit_name?: string | null }>
        | null;
};

const PAGE_SIZE = 1000;

export async function loadSitemapLocations(): Promise<SitemapLocation[]> {
    const locations: SitemapLocation[] = [];

    for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
            .from('target_locations')
            .select('slug, state, created_at, soil_cache(map_unit_name)')
            .order('slug', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);

        if (error) {
            throw new Error(`Unable to build sitemap inventory: ${error.message}`);
        }

        if (!data || data.length === 0) break;
        locations.push(...data);
        if (data.length < PAGE_SIZE) break;
    }

    return locations;
}

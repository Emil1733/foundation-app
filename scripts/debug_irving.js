const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateArticlePage() {
    const slug = 'irving-tx-75039';
    console.log(`[Simulation] processing: ${slug}`);

    const { data: cityData, error } = await supabase
        .from('target_locations')
        .select(`
            *,
            soil_cache (*)
        `)
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('DB Error:', error);
        return;
    }

    if (!cityData) {
        console.error('No Data');
        return;
    }

    // Logic from ArticlePage
    const rawSoil = cityData.soil_cache;
    const soil = Array.isArray(rawSoil) ? rawSoil[0] : rawSoil;

    console.log('Soil Data:', JSON.stringify(soil, null, 2));

    const pi = Number(soil?.plasticity_index || 0);
    const validNeighborhoods = Array.isArray(cityData.neighborhoods) ? cityData.neighborhoods : [];
    const shrinkSwell = Number(soil?.shrink_swell_potential || 0).toFixed(1);

    const isHighRisk = pi > 25;
    const isModerate = pi > 15 && pi <= 25;

    console.log(`Render Stats:
        PI: ${pi} (toFixed: ${pi.toFixed(1)})
        ShrinkSwell: ${shrinkSwell}
        Neighborhoods: ${validNeighborhoods.join(', ')}
        MapUnit: ${soil?.map_unit_name}
    `);
}

simulateArticlePage();

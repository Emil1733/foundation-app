const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGarland() {
    const citySlug = 'garland-tx-75040';
    console.log(`Checking ${citySlug}...`);

    const { data, error } = await supabase
        .from('target_locations')
        .select(`
            *,
            soil_cache (*)
        `)
        .eq('slug', citySlug)
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('City Data:', JSON.stringify(data, null, 2));
        console.log('Soil Cache Type:', typeof data.soil_cache);
        console.log('Is Array?', Array.isArray(data.soil_cache));
    }
}

checkGarland();

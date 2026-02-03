
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listCities() {
    const { data, error } = await supabase
        .from('target_locations')
        .select('city, state, slug, neighborhoods')
        .order('state', { ascending: true })
        .order('city', { ascending: true });

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    console.log(`Found ${data.length} Cities:\n`);
    data.forEach(c => {
        const nCheck = Array.isArray(c.neighborhoods) ? c.neighborhoods.length : '0 (Raw)';
        console.log(`- ${c.city}, ${c.state} (Slug: ${c.slug}) | Neighborhoods: ${nCheck}`);
    });
}

listCities();

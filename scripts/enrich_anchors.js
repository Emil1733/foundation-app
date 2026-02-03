
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

// High-Value Neighborhoods for Missing Cities
const updates = [
    {
        slug: 'irving-tx-75039',
        city: 'Irving',
        neighborhoods: [
            { name: "Las Colinas", risk: "Severe", note: "Notorious for high-PI fill dirt used in 1980s developments." },
            { name: "Valley Ranch", risk: "High", note: "Canal proximity causes water table fluctuation." },
            { name: "Hackberry Creek", risk: "Severe", note: "Gated community on active expansive clay." },
            { name: "Hospital District", risk: "Moderate", note: "Older slab-on-grade homes showing age." }
        ]
    },
    {
        slug: 'allen-tx-75002',
        city: 'Allen',
        neighborhoods: [
            { name: "Twin Creeks", risk: "High", note: "Major creek system runs through development." },
            { name: "Starcreek", risk: "Moderate", note: "Newer post-tension slabs performing better." },
            { name: "Montgomery Farm", risk: "High", note: "Eco-development on active soil." },
            { name: "Waterford Parks", risk: "Moderate", note: "Typical North Texas clay movement." }
        ]
    },
    {
        slug: 'norman-ok-73072',
        city: 'Norman',
        neighborhoods: [
            { name: "Brookhaven", risk: "Severe", note: "Red clay soil with extreme shrink-swell." },
            { name: "Campus Corner", risk: "Low", note: "Stable soil near university core." },
            { name: "Hall Park", risk: "High", note: "70s era slabs failing due to tree roots." },
            { name: "Carrington Place", risk: "Moderate", note: "Newer construction, verify PI." }
        ]
    },
    {
        slug: 'lewisville-tx-75067',
        city: 'Lewisville',
        neighborhoods: [
            { name: "Castle Hills", risk: "Severe", note: "Massive master-plan on highly active soil." },
            { name: "Vista Ridge", risk: "High", note: "Commercial/Residential interface zone." },
            { name: "Old Town", risk: "Moderate", note: "Pier and beam homes dominate." },
            { name: "Fox Creek", risk: "High", note: "Creek erosion impacting foundations." }
        ]
    }
];

async function enrichLocations() {
    console.log(`Starting Enrichment for ${updates.length} cities...`);

    for (const u of updates) {
        const { error } = await supabase
            .from('target_locations')
            .update({ neighborhoods: u.neighborhoods })
            .eq('slug', u.slug);

        if (error) {
            console.error(`[FAIL] ${u.city}: ${error.message}`);
        } else {
            console.log(`[SUCCESS] Enriched ${u.city} with ${u.neighborhoods.length} neighborhoods.`);
        }
    }
}

enrichLocations();

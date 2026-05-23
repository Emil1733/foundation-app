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

async function checkSoilData() {
    const { data: locations, error: locError } = await supabase
        .from('target_locations')
        .select('id, city, slug');
        
    if (locError) {
        console.error("Locations error:", locError.message);
        return;
    }
    
    console.log(`Checking soil data for ${locations.length} locations...`);
    
    const { data: soil, error: soilError } = await supabase
        .from('soil_cache')
        .select('*');
        
    if (soilError) {
        console.error("Soil cache error:", soilError.message);
        return;
    }
    
    console.log(`Found ${soil.length} records in soil_cache table.`);
    
    const locationsWithSoil = soil.map(s => s.location_id);
    const missing = locations.filter(l => !locationsWithSoil.includes(l.id));
    
    console.log(`Locations missing soil data: ${missing.length}`);
    missing.forEach(m => {
        console.log(`  - ${m.city} (ID: ${m.id})`);
    });
}

checkSoilData();

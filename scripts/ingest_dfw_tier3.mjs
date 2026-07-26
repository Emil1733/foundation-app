import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

let supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.startsWith('http')) supabaseUrl = `https://${supabaseUrl}`;
const serviceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

// Top 20 DFW Arbitrage Targets (KD < 15, High CPC)
const TARGETS = [
    { city: 'Greenville', zip: '75401' },
    { city: 'Denton', zip: '76201' },
    { city: 'Carrollton', zip: '75006' },
    { city: 'Roanoke', zip: '76262' },
    { city: 'Grand Prairie', zip: '75050' },
    { city: 'Sherman', zip: '75090' },
    { city: 'Saginaw', zip: '76179' },
    { city: 'Lancaster', zip: '75134' },
    { city: 'Rockwall', zip: '75087' },
    { city: 'Rowlett', zip: '75088' },
    { city: 'Burleson', zip: '76028' },
    { city: 'Mansfield', zip: '76063' },
    { city: 'Flower Mound', zip: '75028' },
    { city: 'Keller', zip: '76248' },
    { city: 'Weatherford', zip: '76086' },
    { city: 'Waxahachie', zip: '75165' },
    { city: 'Azle', zip: '76020' },
    { city: 'Lewisville', zip: '75057' },
    { city: 'Grapevine', zip: '76051' },
    { city: 'Bedford', zip: '76021' }
];

async function getCoords(zip) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=us&format=json&limit=1`;
        const res = await fetch(url, { headers: { 'User-Agent': 'FoundationRiskApp/1.0' } });
        const data = await res.json();
        if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch (e) {
        console.error(`Geocode Error (${zip}):`, e.message);
    }
    return null;
}

async function getSoilData(lat, lon) {
    const query = `
      SELECT mu.musym AS map_unit_symbol, mu.muname AS map_unit_name, c.compname AS component_name,
        c.comppct_r AS component_percent, ch.lep_r AS shrink_swell, ch.pi_r AS plasticity_index, c.drainagecl AS drainage_class
      FROM mapunit mu
      INNER JOIN component c ON c.mukey = mu.mukey
      INNER JOIN chorizon ch ON ch.cokey = c.cokey
      WHERE mu.mukey IN (SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('POINT(${lon} ${lat})'))
      AND c.majcompflag = 'Yes' AND ch.hzdept_r < 50
      ORDER BY c.comppct_r DESC, ch.hzdept_r ASC
    `;
    try {
        const res = await fetch("https://sdmdataaccess.nrcs.usda.gov/Tabular/post.rest", {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, format: "JSON+COLUMNNAME" })
        });
        const data = await res.json();
        if (data.Table && data.Table.length > 1) {
            const headers = data.Table[0];
            const values = data.Table[1];
            const rec = {};
            headers.forEach((key, i) => rec[key] = values[i]);
            return rec;
        }
    } catch (e) {}
    return null;
}

async function run() {
    console.log("🚀 Starting DFW Arbitrage Ingestion...");
    
    // Fetch existing slugs to absolutely guarantee no duplicates
    const { data: existingLocations } = await supabase.from('target_locations').select('slug, city');
    const existingCities = existingLocations.map(l => l.city.toLowerCase());

    for (const target of TARGETS) {
        if (existingCities.includes(target.city.toLowerCase())) {
            console.log(`   ⏭️ SKIPPING: ${target.city} (Already exists in database to prevent duplicates)`);
            continue;
        }

        console.log(`\n📍 Processing ${target.city}, TX...`);
        const coords = await getCoords(target.zip);
        if (!coords) { console.log(`   ❌ Geocoding failed for ${target.city}`); continue; }

        const profile = `Located in the DFW metroplex, ${target.city} rests directly on heavily expansive North Texas clay. The extreme volumetric shifts in the soil during seasonal droughts cause severe foundation settlement, sticking doors, and structural cracking in residential properties.`;

        // Upsert Location
        const { data: locData, error: locError } = await supabase
            .from('target_locations')
            .upsert({
                city: target.city,
                state: 'TX',
                zip_code: target.zip,
                latitude: coords.lat,
                longitude: coords.lon,
                neighborhoods: [{ name: `Central ${target.city}`, risk: "High", note: "Historic district" }],
                city_profile: profile
            }, { onConflict: 'slug' })
            .select().single();

        if (locError) {
            console.error(`   ❌ DB Error for ${target.city}:`, locError.message);
            continue;
        }

        // Fetch USDA Soil Data
        const soil = await getSoilData(coords.lat, coords.lon);
        if (soil) {
            const riskLevel = Number(soil.plasticity_index) > 35 ? 'Severe' : Number(soil.plasticity_index) > 25 ? 'High' : 'Moderate';
            const { error: soilError } = await supabase.from('soil_cache').upsert({
                location_id: locData.id,
                map_unit_symbol: soil.map_unit_symbol,
                map_unit_name: soil.map_unit_name,
                component_name: soil.component_name || 'Expansive Clay',
                shrink_swell_potential: Number(soil.shrink_swell || 0),
                plasticity_index: Number(soil.plasticity_index || 0),
                drainage_class: soil.drainage_class || 'Poorly drained',
                risk_level: riskLevel
            }, { onConflict: 'location_id' });
            
            if (soilError) console.error(`   ❌ Soil Error for ${target.city}:`, soilError.message);
            else console.log(`   ✅ Success! ${target.city} added with USDA Soil PI: ${soil.plasticity_index}.`);
        } else {
            console.log(`   ✅ Success! ${target.city} added (Soil data missing)`);
        }
    }
    console.log("\n🎉 DFW ARBITRAGE BATCH COMPLETE! Checking dynamic sitemap next...");
}

run();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 1. Setup Supabase (Using verified Node.js stack)
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Ensure protocol is present (Fixing the issue verify_db.js found)
let supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
    supabaseUrl = `https://${supabaseUrl}`;
}

const serviceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error("❌ Missing Supabase Credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// 2. Constants
const USDA_URL = "https://sdmdataaccess.nrcs.usda.gov/Tabular/post.rest";
const TARGET_ZIPS = [
    { zip: '75024', city: 'Plano', state: 'TX' },
    { zip: '75201', city: 'Dallas', state: 'TX' },
    { zip: '64130', city: 'Kansas City', state: 'MO' },
];

// 3. Helper: Geocode via Nominatim
async function getCoords(zip) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=us&format=json&limit=1`;
        const res = await fetch(url, { headers: { 'User-Agent': 'FoundationRiskApp/1.0' } });
        if (!res.ok) throw new Error(res.statusText);

        const data = await res.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        }
        return null;
    } catch (e) {
        console.error(`   ❌ Geocode Error (${zip}):`, e.message);
        return null;
    }
}

// 4. Helper: Fetch USDA Soil Data
async function getSoilData(lat, lon) {
    const query = `
      SELECT 
        mu.musym AS map_unit_symbol,
        mu.muname AS map_unit_name,
        c.compname AS component_name,
        c.comppct_r AS component_percent,
        ch.lep_r AS shrink_swell,
        ch.pi_r AS plasticity_index,
        c.drainagecl AS drainage_class
      FROM mapunit mu
      INNER JOIN component c ON c.mukey = mu.mukey
      INNER JOIN chorizon ch ON ch.cokey = c.cokey
      WHERE mu.mukey IN (
        SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('POINT(${lon} ${lat})')
      )
      AND c.majcompflag = 'Yes'
      AND ch.hzdept_r < 50
      ORDER BY c.comppct_r DESC, ch.hzdept_r ASC
    `;

    try {
        const res = await fetch(USDA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, format: "JSON+COLUMNNAME" })
        });

        if (!res.ok) throw new Error(`USDA API: ${res.statusText}`);

        const data = await res.json();
        if (data.Table && data.Table.length > 1) {
            // Row 0 = Headers, Row 1 = Values
            const headers = data.Table[0];
            const values = data.Table[1];
            const rec = {};
            headers.forEach((key, i) => rec[key] = values[i]);
            return rec;
        }
        return null;
    } catch (e) {
        console.error(`   ❌ USDA Error:`, e.message);
        return null;
    }
}

// 5. Main Loop
async function run() {
    console.log("🚀 Starting Data Ingestion (Node.js Engine)...\n");

    for (const loc of TARGET_ZIPS) {
        console.log(`📍 Processing ${loc.city} (${loc.zip})...`);

        // A. Geocode
        const coords = await getCoords(loc.zip);
        if (!coords) {
            console.log("   ⚠️ Geocoding failed, skipping.");
            continue;
        }
        console.log(`   Coords: ${coords.lat}, ${coords.lon}`);

        // B. Upsert Location
        const { data: locData, error: locError } = await supabase
            .from('target_locations')
            .upsert({
                city: loc.city,
                state: loc.state,
                zip_code: loc.zip,
                latitude: coords.lat,
                longitude: coords.lon
            }, { onConflict: 'zip_code' })
            .select()
            .single();

        if (locError) {
            console.error(`   ❌ DB Location Error:`, locError.message);
            continue;
        }
        const locationId = locData.id;

        // C. Fetch Soil
        const soil = await getSoilData(coords.lat, coords.lon);
        if (!soil) {
            console.log("   ⚠️ No massive soil data found at centroid.");
            continue;
        }
        console.log(`   Soil: ${soil.map_unit_name} (PI: ${soil.plasticity_index})`);

        // D. Upsert Soil Cache
        const riskLevel = Number(soil.plasticity_index) > 35 ? 'Severe' :
            Number(soil.plasticity_index) > 25 ? 'High' :
                'Moderate';

        const { error: soilError } = await supabase
            .from('soil_cache')
            .upsert({
                location_id: locationId,
                map_unit_symbol: soil.map_unit_symbol,
                map_unit_name: soil.map_unit_name,
                component_name: soil.component_name,
                shrink_swell_potential: Number(soil.shrink_swell || 0),
                plasticity_index: Number(soil.plasticity_index || 0),
                drainage_class: soil.drainage_class,
                risk_level: riskLevel
            }, { onConflict: 'location_id' });

        if (soilError) {
            console.error(`   ❌ DB Soil Error:`, soilError.message);
        } else {
            console.log(`   ✅ Cached successfully.`);
        }

        // Politeness delay
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("\n✨ Ingestion Complete.");
}

run();

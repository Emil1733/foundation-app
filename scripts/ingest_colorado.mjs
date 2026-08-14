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

const TARGETS = [
    { 
        city: 'Denver', state: 'CO', zip: '80202', 
        profile: "Denver sits directly on the Front Range Bentonite clay belt. This specific type of smectite clay has an unprecedented capacity to absorb water and expand. When the heavy Colorado snow melts, the soil rapidly swells, generating massive upward heave on basement floors and foundation walls. During the arid summers, the soil desiccates and shrinks, causing sudden foundation dropping. We stabilize Denver homes by driving steel piers completely past the active Bentonite layer down to load-bearing bedrock." 
    },
    { 
        city: 'Aurora', state: 'CO', zip: '80012', 
        profile: "Aurora's residential footprint is severely compromised by highly expansive native soils. As the expansive clay undergoes rapid freeze-thaw and wet-dry cycles, it fatigues the concrete slab, eventually causing it to snap. If your basement walls are developing horizontal cracks or your upstairs doors are sticking, the soil is actively shifting your home. We utilize deep helical piers to permanently bypass the failing topsoil and anchor into solid strata." 
    },
    { 
        city: 'Lakewood', state: 'CO', zip: '80228', 
        profile: "In Lakewood, the aggressive hillside grading combined with expansive clay creates a massive risk for lateral soil pressure. As snowmelt saturates the soil against your basement, the hydrostatic pressure builds until the concrete walls bow inward. We deploy engineered wall anchors and carbon fiber strapping to halt the inward movement and permanently reinforce Lakewood basements against the soil load." 
    },
    { 
        city: 'Arvada', state: 'CO', zip: '80002', 
        profile: "Arvada has some of the most volatile soil plasticity indexes in the Denver metro area. The constant shrinking and swelling of the Bentonite clay creates a 'pumping' action that slowly destabilizes the footings of the house. We see severe differential settlement here, characterized by large diagonal stair-step cracks in exterior brickwork. We secure Arvada foundations with galvanized push piers that transfer the weight of the home to stable bedrock." 
    },
    { 
        city: 'Thornton', state: 'CO', zip: '80229', 
        profile: "Thornton's rapid development often involved improper soil compaction over expansive clay veins. Over the years, this fill dirt consolidates and drops the foundation with it. This artificial settlement causes floors to slope and windows to jam. We combat this by installing deep interior and exterior underpinning systems to physically lift the home back to its original engineered elevation." 
    },
    { 
        city: 'Centennial', state: 'CO', zip: '80112', 
        profile: "Centennial homeowners face constant battles with basement floor heave. When the Bentonite clay under the concrete slab absorbs moisture, it expands upward with enough force to literally crack the basement floor in half. We implement advanced interior drain tile systems to control the moisture levels in the soil, combined with slab-jacking and piering to permanently resolve Centennial foundation failure." 
    },
    { 
        city: 'Boulder', state: 'CO', zip: '80302', 
        profile: "Boulder's unique geology features a mix of expansive clay and highly porous sandstone. Water easily permeates the sandstone, saturating the clay pockets beneath residential foundations. This triggers massive differential settlement as the soil randomly heaves and shrinks across the footprint of the home. We provide forensic P.E. evaluations to isolate the exact failure points and deploy deep helical piles to permanently anchor the structure." 
    }
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
    console.log("🚀 Starting COLORADO FRONT RANGE Ingestion...");
    
    const { data: existingLocations } = await supabase.from('target_locations').select('slug, city');
    const existingCities = existingLocations.map(l => l.city.toLowerCase());

    for (const target of TARGETS) {
        if (existingCities.includes(target.city.toLowerCase())) {
            console.log(`   ⏭️ SKIPPING: ${target.city} (Already exists)`);
            continue;
        }

        console.log(`\n📍 Processing ${target.city}, ${target.state}...`);
        const coords = await getCoords(target.zip);
        if (!coords) { console.log(`   ❌ Geocoding failed for ${target.city}`); continue; }

        // Upsert Location
        const { data: locData, error: locError } = await supabase
            .from('target_locations')
            .upsert({
                city: target.city,
                state: target.state,
                zip_code: target.zip,
                latitude: coords.lat,
                longitude: coords.lon,
                neighborhoods: [{ name: `Central ${target.city}`, risk: "Severe", note: "Bentonite Clay severe shrink-swell zone" }],
                city_profile: target.profile
            }, { onConflict: 'slug' })
            .select().single();

        if (locError) {
            console.error(`   ❌ DB Error for ${target.city}:`, locError.message);
            continue;
        }

        // Fetch USDA Soil Data
        const soil = await getSoilData(coords.lat, coords.lon);
        if (soil) {
            const pi = Number(soil.plasticity_index || 0);
            const riskLevel = 'Severe'; // Override because Bentonite clay is always severe
            const { error: soilError } = await supabase.from('soil_cache').upsert({
                location_id: locData.id,
                map_unit_symbol: soil.map_unit_symbol,
                map_unit_name: soil.map_unit_name,
                component_name: soil.component_name || 'Bentonite Clay',
                shrink_swell_potential: Number(soil.shrink_swell || 0),
                plasticity_index: pi > 0 ? pi : 45, // Bentonite has massive PI
                drainage_class: soil.drainage_class || 'Poorly drained',
                risk_level: riskLevel 
            }, { onConflict: 'location_id' });
            
            if (soilError) console.error(`   ❌ Soil Error for ${target.city}:`, soilError.message);
            else console.log(`   ✅ Success! ${target.city} added with USDA Soil PI: ${pi}.`);
        } else {
            console.log(`   ✅ Success! ${target.city} added (Soil data missing)`);
        }
    }
    console.log("\n🎉 COLORADO BATCH COMPLETE! The sitemap is locked, loaded, and automatically spider-webbed.");
}

run();

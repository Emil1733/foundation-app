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
    // Kansas City Cluster (MO/KS)
    { 
        city: 'Overland Park', state: 'KS', zip: '66212', 
        profile: "Here in Overland Park, we aren't just dealing with standard slab settlement—we are dealing with full basement walls caving in. The heavy clay soils here absorb massive amounts of water during the spring thaw. That water exerts immense horizontal hydrostatic pressure against your basement walls. Once you see a horizontal crack in the concrete block, the wall is actively failing. We usually have to excavate and install steel wall anchors to pull it back to plumb." 
    },
    { 
        city: 'Olathe', state: 'KS', zip: '66062', 
        profile: "In Olathe, the soil profile is notoriously tough on both older basements and newer slab-on-grade builds. The expansive clay holds moisture against the foundation, causing the concrete to spall and bow inward over time. We pull a lot of permits out here to install interior drain tile systems and drive helical piers to permanently stop the lateral movement before the framing warps." 
    },

    // Oklahoma "Red Dirt" Cluster
    { 
        city: 'Norman', state: 'OK', zip: '73071', 
        profile: "If you've lived in Norman for more than a year, you know about the red clay. It behaves exactly like the active faults down in Texas. When we hit a severe drought in August, the clay shrinks violently, dropping the perimeter of your house. Then the spring rains hit, the clay swells like a sponge, and it heaves the slab back up. That constant yo-yo effect shears plumbing lines and rips your brick mortar apart. You have to pier down to load-bearing strata to stop the cycle." 
    },
    { 
        city: 'Edmond', state: 'OK', zip: '73013', 
        profile: "Edmond has some of the highest plasticity index soils in the state. We see massive differential settlement out here, especially on homes built in the 80s and 90s before the post-tension slab regulations really tightened up. If your doors are sticking or you have diagonal stair-step cracks radiating from your window frames, the red dirt is actively pulling your foundation apart." 
    },
    { 
        city: 'Broken Arrow', state: 'OK', zip: '74012', 
        profile: "Over in Broken Arrow, the water table and the clay composition create a perfect storm for foundation failure. The topsoil washes out easily during heavy storms, leaving voids under the grade beams. Without that support, the slab cracks under the weight of the roof load. We spend a lot of time out here injecting high-density polyurethane to fill the voids and driving steel push piers to stabilize the perimeter." 
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
    console.log("🚀 Starting MIDWEST/OK Arbitrage Ingestion...");
    
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
                neighborhoods: [{ name: `Central ${target.city}`, risk: "Severe", note: "High subsidence/clay risk" }],
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
            const riskLevel = Number(soil.plasticity_index) > 35 ? 'Severe' : Number(soil.plasticity_index) > 25 ? 'High' : 'Moderate';
            const fallbackComponent = target.state === 'OK' ? 'Permian Red Clay' : 'Midwest Glacial Till';
            const { error: soilError } = await supabase.from('soil_cache').upsert({
                location_id: locData.id,
                map_unit_symbol: soil.map_unit_symbol,
                map_unit_name: soil.map_unit_name,
                component_name: soil.component_name || fallbackComponent,
                shrink_swell_potential: Number(soil.shrink_swell || 0),
                plasticity_index: Number(soil.plasticity_index || 0),
                drainage_class: soil.drainage_class || 'Well drained',
                risk_level: riskLevel
            }, { onConflict: 'location_id' });
            
            if (soilError) console.error(`   ❌ Soil Error for ${target.city}:`, soilError.message);
            else console.log(`   ✅ Success! ${target.city} added with USDA Soil PI: ${soil.plasticity_index}.`);
        } else {
            console.log(`   ✅ Success! ${target.city} added (Soil data missing)`);
        }
    }
    console.log("\n🎉 MIDWEST/OK BATCH COMPLETE! The sitemap is locked, loaded, and automatically spider-webbed.");
}

run();

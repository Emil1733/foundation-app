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
    // Jacksonville Cluster (North FL Settlement)
    { 
        city: 'Jacksonville', state: 'FL', zip: '32202', 
        profile: "In Jacksonville, the coastal water table is incredibly high and the soil is mostly loose, alluvial sand. When heavy storm surges recede, they often wash out the finer soil particles directly beneath your footing. We see a ton of 'corner drop' out here, where one corner of the slab just sinks into the void. You can't just patch the cracks; we have to drive steel push piers down past the loose sand into the load-bearing coquina rock." 
    },
    { 
        city: 'St. Augustine', state: 'FL', zip: '32084', 
        profile: "St. Augustine is built on some of the oldest, most unstable coastal soils in the state. Between the tidal shifts and the sandy loam, the ground is constantly consolidating. If your floors are starting to slope or your historic masonry is showing stair-step cracks, the soil is giving way. We spend most of our time out here retrofitting older foundations with deep-driven helical piers to stop the settlement." 
    },

    // Miami / South FL (Muck & Peat Settlement)
    { 
        city: 'Miami', state: 'FL', zip: '33101', 
        profile: "Foundation failure in Miami is a completely different beast than the rest of the country. A lot of these neighborhoods were built over drained swampland. Underneath the fill dirt is a layer of organic muck and peat. Over the decades, that organic material decomposes and literally vanishes, leaving your slab floating over a void. If your house is actively sinking, we have to drill helical piles deep into the solid coral rock substrate to permanently anchor the structure." 
    },
    { 
        city: 'Fort Lauderdale', state: 'FL', zip: '33301', 
        profile: "In Fort Lauderdale, the high water table and the porous limestone bedrock create a nightmare for concrete slabs. Saltwater intrusion degrades the rebar inside the concrete, and the sandy soil washes out from underneath. We pull a lot of permits out here for poly-foam void filling and deep steel piering to stop slabs from cracking right down the middle." 
    },
    { 
        city: 'Hialeah', state: 'FL', zip: '33010', 
        profile: "Hialeah has severe issues with localized soil subsidence. The fill dirt used in the 60s and 70s was often improperly compacted over the native limestone. As that fill dirt settles over time, the center of the house drops, causing interior walls to separate from the ceiling. We usually have to come in and do a full perimeter underpinning to stabilize the load." 
    },
    { 
        city: 'Hollywood', state: 'FL', zip: '33020', 
        profile: "The coastal erosion and high groundwater in Hollywood wreak havoc on older continuous pour foundations. When the water table fluctuates, it creates a pumping action that slowly removes the stable sand from under your footings. If you're noticing your doors jamming or horizontal cracks in your exterior stucco, the house is actively settling into the sand." 
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
    console.log("🚀 Starting FLORIDA Sinkhole & Muck Ingestion...");
    
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
                neighborhoods: [{ name: `Central ${target.city}`, risk: "Severe", note: "High subsidence/muck settlement risk" }],
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
            // Florida has low PI (it's sand/limestone), but the risk is still severe due to voids
            const riskLevel = 'Severe'; 
            const fallbackComponent = 'Porous Limestone / Peat';
            const { error: soilError } = await supabase.from('soil_cache').upsert({
                location_id: locData.id,
                map_unit_symbol: soil.map_unit_symbol,
                map_unit_name: soil.map_unit_name,
                component_name: soil.component_name || fallbackComponent,
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
    console.log("\n🎉 FLORIDA BATCH COMPLETE! The sitemap is locked, loaded, and automatically spider-webbed.");
}

run();

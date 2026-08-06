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
    // Tampa Bay (Sinkhole Alley)
    { 
        city: 'Tampa', state: 'FL', zip: '33602', 
        profile: "Foundation repair in Tampa almost always comes down to the underlying limestone karst topography. When the water table fluctuates during our dry seasons, the porous limestone dissolves, creating underground voids. The sandy topsoil washes into these voids, taking your slab with it. If you have severe stair-step cracking in your block walls, we usually have to do deep-driven steel piers to bypass the voids and hit solid bedrock." 
    },
    { 
        city: 'St. Petersburg', state: 'FL', zip: '33701', 
        profile: "In St. Pete, coastal flooding and high groundwater tables wreak havoc on older concrete slabs. The constant tidal pressure causes the sandy soil to wash out from beneath the footing. Over time, the weight of the masonry walls causes the slab to bow and crack. We specialize in injecting high-density polyurethane foam to fill these coastal voids and lift the slab back into place without heavy excavation." 
    },
    { 
        city: 'Clearwater', state: 'FL', zip: '33755', 
        profile: "Clearwater has a very high concentration of localized soil subsidence. The sandy loam offers very little load-bearing capacity for heavy tile roofs and block construction. When the soil settles, the foundation drops, causing windows to stick and interior drywall to tear. We pull a lot of permits out here for helical piering to permanently anchor the footings into the deep limestone layer." 
    },
    { 
        city: 'Spring Hill', state: 'FL', zip: '34606', 
        profile: "Spring Hill is located right in the heart of Florida's 'Sinkhole Alley'. The risk here isn't just cosmetic cracking; it's catastrophic structural failure caused by massive underground voids opening up in the limestone bedrock. If your home is actively sinking or you notice depressions forming in the yard near your slab, you need emergency structural underpinning before the foundation completely collapses into the void." 
    },
    { 
        city: 'New Port Richey', state: 'FL', zip: '34652', 
        profile: "Similar to Spring Hill, New Port Richey suffers from extreme karst topography issues. Sinkhole activity and rapid soil consolidation can tear a post-tension slab in half overnight. We use advanced geotechnical boring to locate the subterranean voids, and then we drive heavy-duty steel push piers down to refusal to ensure the home never sinks again, regardless of what the soil does." 
    },
    { 
        city: 'Hudson', state: 'FL', zip: '34667', 
        profile: "In Hudson, the combination of coastal erosion and dissolving limestone creates a double-threat for residential foundations. As the earth literally pulls away from your footing, the structural integrity of the home is entirely compromised. We do a massive amount of void-filling and deep piering out here to save homes that are actively settling into the karst." 
    },

    // Orlando (Central Florida Sinkholes)
    { 
        city: 'Orlando', state: 'FL', zip: '32801', 
        profile: "Orlando sits on top of a massive network of porous limestone. During heavy development, groundwater pumping lowers the water table, which destabilizes the soil structure beneath residential neighborhoods. This causes the earth to suddenly collapse into sinkholes, taking slabs with it. If you're seeing deep, diagonal cracks radiating from your door frames, your slab is losing its structural support." 
    },
    { 
        city: 'Kissimmee', state: 'FL', zip: '34741', 
        profile: "In Kissimmee, the soil is a volatile mix of sandy loam and decomposing organic peat left over from old agricultural land. As that organic matter rots away beneath your home, it creates pockets of empty space. Without the support of the soil, the concrete foundation snaps under its own weight. The only permanent fix is to drive helical piles through the organic layer and into solid, stable strata." 
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
    console.log("🚀 Starting TAMPA/ORLANDO Sinkhole Alley Ingestion...");
    
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
                neighborhoods: [{ name: `Central ${target.city}`, risk: "Severe", note: "Extreme sinkhole / karst topography risk" }],
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
            const riskLevel = 'Severe'; 
            const fallbackComponent = 'Limestone Karst / Sinkhole Zone';
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
    console.log("\n🎉 TAMPA/ORLANDO BATCH COMPLETE! The sitemap is locked, loaded, and automatically spider-webbed.");
}

run();

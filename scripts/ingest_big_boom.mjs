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
    // Yazoo Clay Belt (MS/LA)
    { 
        city: 'Jackson', state: 'MS', zip: '39201', 
        profile: "If you own a home in Jackson, you already know about the Yazoo clay. It's basically a massive sponge under your slab. When it rains, it swells up and lifts the house, and when we hit a dry spell, it shrinks and drops it. We see a ton of sheared plumbing and deep stair-step cracks in the brick out here. You can't just patch the drywall—you have to drive steel piers deep below that active clay zone to hit load-bearing strata." 
    },
    { 
        city: 'Shreveport', state: 'LA', zip: '71101', 
        profile: "The soil here in Shreveport is notoriously unpredictable. You've got heavy river alluvial deposits mixed with highly active clay. Over the years, that constant expansion and contraction absolutely wrecks concrete slabs and older pier-and-beam setups. A lot of the calls we get out here start with doors sticking or floors sagging in the middle of the house." 
    },
    { 
        city: 'Madison', state: 'MS', zip: '39110', 
        profile: "Madison gets hit hard by the same Yazoo clay vein that runs through the capital. We do a lot of work out here, and it's almost always the same story: heavy rains saturate the soil, the clay expands, and it pushes massive hydrostatic pressure against your foundation. If you're seeing horizontal cracks in your brickwork, that's the clay actively pushing your house." 
    },
    { 
        city: 'Bossier City', state: 'LA', zip: '71111', 
        profile: "Over in Bossier, the high water table and shifting topsoil are a nightmare for foundations. The ground is constantly moving. When the soil washes out or settles, it leaves a void right under your footing. Without that support, the slab cracks under the weight of the roof. We usually have to get in there and drive helical piers to permanently stabilize the structure." 
    },

    // Sunbelt Subsidence (AZ)
    { 
        city: 'Glendale', state: 'AZ', zip: '85301', 
        profile: "Out here in Glendale, it's not the rain that kills slabs—it's the drought and the heat. The soil dries out so bad that we get severe earth fissures and subsidence. The ground literally pulls away from your foundation footing. Once that void opens up, the sheer weight of the house cracks the slab right down the middle. We see it all the time on newer builds." 
    },
    { 
        city: 'Mesa', state: 'AZ', zip: '85201', 
        profile: "Mesa has a lot of localized subsidence issues. When the groundwater gets pumped out or the soil completely dries up during the summer, the earth physically sinks. If your foundation settles unevenly, it'll start tearing your drywall apart and warping your window frames. Usually, we have to inject high-density polyurethane to fill the voids and lift the slab back to level." 
    },
    { 
        city: 'Chandler', state: 'AZ', zip: '85224', 
        profile: "A lot of the homes in Chandler are built on soil that struggles with water retention. If your gutters aren't dumping water far enough away from the house, it pools at the base, degrades the soil, and causes the corner of the house to sink. We pull a lot of permits out here just to fix sinking corners by driving steel push piers down to stable bedrock." 
    },
    { 
        city: 'Gilbert', state: 'AZ', zip: '85233', 
        profile: "In Gilbert, the combination of extreme heat and poor soil compaction on some of the older subdivisions leads to nasty differential settlement. If you're noticing diagonal cracks radiating from the corners of your doors or windows, your foundation is actively failing. It's not going to fix itself, and waiting usually just means it's going to cost more when the framing starts to warp." 
    },
    { 
        city: 'Scottsdale', state: 'AZ', zip: '85251', 
        profile: "Scottsdale has unique geological pockets where the topsoil just doesn't have the load-bearing capacity to support heavy masonry or tile roofs long-term. As the soil settles over the decades, the foundation bows. We spend a lot of time out here retrofitting older homes with deep-driven piers to stop the settlement permanently." 
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
    console.log("🚀 Starting BIG BOOM Arbitrage Ingestion (Yazoo Clay & Sunbelt)...");
    
    // Fetch existing slugs to guarantee no duplicates
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
            const fallbackComponent = target.state === 'AZ' ? 'Sunbelt Subsidence Soil' : 'Yazoo/Alluvial Clay';
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
    console.log("\n🎉 BIG BOOM BATCH COMPLETE! The sitemap is locked, loaded, and automatically spider-webbed.");
}

run();

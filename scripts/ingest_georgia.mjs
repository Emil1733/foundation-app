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
        city: 'Atlanta', state: 'GA', zip: '30301', 
        profile: "Atlanta is built directly on top of the notorious Georgia Red Clay (Ultisol). This highly plastic clay is incredibly dense and traps massive amounts of groundwater against deep residential basements. When the hydrostatic pressure builds up during heavy rain seasons, it violently bows basement walls inward, creating massive horizontal fractures. Stabilizing an Atlanta home usually requires carbon fiber wall reinforcement or deep helical wall anchors driven directly into the stable soil beyond the clay." 
    },
    { 
        city: 'Marietta', state: 'GA', zip: '30060', 
        profile: "Marietta's rolling hills combined with the native red clay create a massive risk for lateral soil pressure. As water runs down the topography, it saturates the clay surrounding your foundation walls. If you are seeing horizontal cracks in your basement block walls or stair-step cracks in your exterior brick, the clay is expanding and crushing your foundation. We deploy heavy-duty wall anchors and tie-backs to permanently halt the inward movement." 
    },
    { 
        city: 'Alpharetta', state: 'GA', zip: '30004', 
        profile: "Alpharetta features some of the highest-value residential real estate in the metro, but these massive footprints sit right on top of expansive Piedmont clay. In the summer heat, the red clay shrinks and pulls away from the foundation walls, allowing water to pool directly against the concrete when it rains. This leads to immediate differential settlement. We regularly retrofit Alpharetta estates with deep-driven steel push piers to transfer the massive loads to solid bedrock." 
    },
    { 
        city: 'Roswell', state: 'GA', zip: '30075', 
        profile: "Roswell homes face a dual threat: extreme hillside grading and expansive red clay. Over time, the soil creeps downhill, pulling the foundation along with it. This causes severe sheer stress on the concrete slab and basement retaining walls. If your doors are sticking or your chimney is separating from the siding, the soil is actively migrating. We utilize engineered helical piers to permanently anchor Roswell homes against both vertical and lateral movement." 
    },
    { 
        city: 'Johns Creek', state: 'GA', zip: '30022', 
        profile: "In Johns Creek, the combination of heavy tree canopies and expansive clay destroys foundations. Massive root systems suck the moisture out of the red clay during droughts, causing extreme soil shrinkage. The foundation drops into the void, snapping the rigid concrete slab. When the rains return, the clay swells and heaves the house upward. We stop this destructive cycle by driving galvanized steel piers completely through the active clay zone into load-bearing strata." 
    },
    { 
        city: 'Sandy Springs', state: 'GA', zip: '30328', 
        profile: "Sandy Springs is plagued by highly localized pockets of unstable Ultisol clay. Many of the mid-century ranches and newer mega-mansions were built without proper soil compaction. As the red clay undergoes repeated shrink-swell cycles, it fatigues the structural integrity of the home. Visual symptoms usually start as diagonal drywall cracks above window frames before progressing to full foundation failure. We provide forensic P.E. evaluations to determine the exact piering depth required." 
    },
    { 
        city: 'Smyrna', state: 'GA', zip: '30080', 
        profile: "Smyrna's rapid residential development often involved cutting and filling the native red clay. Improperly compacted fill dirt settles over time, causing the center of the home to literally sink while the perimeter stays put. This creates a 'bowl' effect that destroys hardwood floors and jams interior doors. We use advanced slab jacking and deep underpinning techniques to lift and permanently stabilize Smyrna properties." 
    },
    { 
        city: 'Dunwoody', state: 'GA', zip: '30338', 
        profile: "Dunwoody homes with basements are under constant threat from hydrostatic pressure. The dense Georgia clay traps rainwater, turning the soil around your basement into a pressurized sponge. This forces water through the concrete pores and bows the masonry walls inward. We combat this by installing deep helical tie-backs that physically pull the basement walls back into plumb, permanently reinforcing them against the expanding clay." 
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
    console.log("🚀 Starting GEORGIA RED CLAY Belt Ingestion...");
    
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
                neighborhoods: [{ name: `Central ${target.city}`, risk: "Severe", note: "High hydrostatic pressure risk in red clay" }],
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
            const riskLevel = pi > 25 ? 'Severe' : pi > 15 ? 'High' : 'Moderate';
            const { error: soilError } = await supabase.from('soil_cache').upsert({
                location_id: locData.id,
                map_unit_symbol: soil.map_unit_symbol,
                map_unit_name: soil.map_unit_name,
                component_name: soil.component_name,
                shrink_swell_potential: Number(soil.shrink_swell || 0),
                plasticity_index: pi,
                drainage_class: soil.drainage_class || 'Poorly drained',
                risk_level: riskLevel
            }, { onConflict: 'location_id' });
            
            if (soilError) console.error(`   ❌ Soil Error for ${target.city}:`, soilError.message);
            else console.log(`   ✅ Success! ${target.city} added with USDA Soil PI: ${pi}.`);
        } else {
            console.log(`   ✅ Success! ${target.city} added (Soil data missing)`);
        }
    }
    console.log("\n🎉 GEORGIA BATCH COMPLETE! The sitemap is locked, loaded, and automatically spider-webbed.");
}

run();

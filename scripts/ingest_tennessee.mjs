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
        city: 'Nashville', state: 'TN', zip: '37201', 
        profile: "Nashville sits directly on the Central Basin, a geological zone plagued by shallow limestone bedrock covered in highly expansive clay. Because the soil is so shallow, heavy rains can easily wash it away into underground karst cavities (sinkholes). If your Nashville home is experiencing sudden differential settlement or sticking doors, the soil is likely collapsing into these subterranean voids. We deploy deep-driven steel piers that anchor directly into the solid limestone bedrock to halt this movement permanently." 
    },
    { 
        city: 'Murfreesboro', state: 'TN', zip: '37127', 
        profile: "Murfreesboro is experiencing explosive housing growth, but much of it is being built on incredibly unstable karst topography. The combination of acidic rainwater dissolving the limestone and the swelling of the residual clay causes massive sheer stress on concrete foundations. Visual symptoms like diagonal stair-step cracks in exterior brick are the first warning signs. We secure Murfreesboro foundations by driving engineered push piers down to refusal in the solid bedrock." 
    },
    { 
        city: 'Franklin', state: 'TN', zip: '37064', 
        profile: "Franklin features high-value estates built on some of the most volatile soils in Middle Tennessee. The rolling hills and high plasticity clay create a severe risk of lateral soil creep and hydrostatic pressure. During the rainy season, the clay expands against basement walls, causing them to bow inward and fracture. We routinely retrofit Franklin properties with heavy-duty helical tie-backs and interior carbon fiber reinforcement to save the structural integrity of the home." 
    },
    { 
        city: 'Hendersonville', state: 'TN', zip: '37075', 
        profile: "Proximity to Old Hickory Lake makes Hendersonville highly susceptible to fluctuating water tables. As the groundwater rises and falls, it creates a 'pumping' action that slowly removes the fine soil particles from beneath your concrete slab, leaving empty voids. This leads to cracking floors and sinking foundations. We utilize advanced poly-void filling and deep underpinning systems to restore the structural capacity of Hendersonville homes." 
    },
    { 
        city: 'Clarksville', state: 'TN', zip: '37040', 
        profile: "Clarksville is notorious for its severe sinkhole risk. The aggressive dissolving of the local limestone bedrock creates sudden, catastrophic soil subsidence that can drop a foundation by several inches overnight. If you notice large depressions forming in your yard or sudden drywall tearing inside your home, the soil is actively failing. We provide emergency forensic P.E. evaluations and deploy helical underpinning systems to bypass the failing soil entirely." 
    },
    { 
        city: 'Spring Hill', state: 'TN', zip: '37174', 
        profile: "The rapid residential expansion in Spring Hill often involves cutting and filling the native clay soils. When this fill dirt is improperly compacted, it undergoes aggressive secondary settlement. The center of the home drops while the perimeter stays fixed, causing severe structural torquing. We combat this artificial settlement by installing interior slab piers and perimeter steel push piers to permanently lift and level the structure." 
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
    console.log("🚀 Starting TENNESSEE KARST ZONE Ingestion...");
    
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
                neighborhoods: [{ name: `Central ${target.city}`, risk: "Severe", note: "High risk of Karst/Limestone sinkhole subsidence" }],
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
                risk_level: 'Severe' // Override for TN because karst cavities are severe regardless of clay PI
            }, { onConflict: 'location_id' });
            
            if (soilError) console.error(`   ❌ Soil Error for ${target.city}:`, soilError.message);
            else console.log(`   ✅ Success! ${target.city} added with USDA Soil PI: ${pi}.`);
        } else {
            console.log(`   ✅ Success! ${target.city} added (Soil data missing)`);
        }
    }
    console.log("\n🎉 TENNESSEE BATCH COMPLETE! The sitemap is locked, loaded, and automatically spider-webbed.");
}

run();

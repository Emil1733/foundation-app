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
    // DFW Tarrant County (Ultra-Wealthy Soil)
    { 
        city: 'Southlake', state: 'TX', zip: '76092', 
        profile: "In Southlake, massive custom homes are built on top of highly expansive Eagle Ford clay. When the soil expands and contracts, the sheer weight of these structures creates immense differential settlement. We often have to install dozens of deep-driven steel piers to bypass the active zone and hit load-bearing bedrock to save these multi-million dollar investments." 
    },
    { 
        city: 'Keller', state: 'TX', zip: '76248', 
        profile: "Keller sits on a volatile mix of sandy loam and deep clay veins. During our brutal Texas droughts, the clay shrinks violently away from the perimeter grade beams, causing the exterior brick veneer to crack and separate from the frieze boards. We pull a lot of permits out here for perimeter underpinning." 
    },
    { 
        city: 'Colleyville', state: 'TX', zip: '76034', 
        profile: "Foundation failure in Colleyville is almost always tied to the extreme plasticity index of the local soil. The yo-yo effect of seasonal rains followed by scorching summers literally snaps post-tension cables and shears plumbing lines encased in the slab. Moisture maintenance is critical, but once it drops, deep steel piering is the only structural fix." 
    },
    { 
        city: 'Grapevine', state: 'TX', zip: '76051', 
        profile: "Grapevine has incredibly unstable soil near the lake areas due to water table fluctuations and highly active clay. When the soil heaves, it pushes up on the center of the slab (upheaval), and when it shrinks, the perimeter drops. It's a structural nightmare that requires precise forensic leveling to permanently correct." 
    },

    // DFW Collin & Rockwall (High Growth Suburbs)
    { 
        city: 'Allen', state: 'TX', zip: '75002', 
        profile: "Allen's rapid development in the 90s and 2000s means a lot of slabs were poured on top of improperly compacted fill dirt that was highly expansive. Decades later, that soil is failing. If you have sticking doors or diagonal cracks shooting off your window frames, the foundation is actively settling." 
    },
    { 
        city: 'McKinney', state: 'TX', zip: '75069', 
        profile: "In McKinney, the Austin Chalk and surrounding clay layers cause severe structural distress on residential properties. The soil physically expands with such force that it can lift a two-story home. To stop the movement, we have to drive piers down to the solid chalk layer where the moisture levels remain constant." 
    },
    { 
        city: 'Rockwall', state: 'TX', zip: '75087', 
        profile: "Rockwall is notorious for extreme soil movement near the lake. The high plasticity clay acts like a sponge, swelling and shrinking radically. Homes here experience severe corner drop and interior wall separation. It requires heavy-duty steel push piers driven to absolute refusal to stabilize the load." 
    },

    // Austin Corridor (Hill Country Limestone / Clay)
    { 
        city: 'Georgetown', state: 'TX', zip: '78626', 
        profile: "Georgetown is located right on the edge of the Balcones Fault Zone. The mix of expanding clay and limestone outcroppings means your slab can be supported by solid rock on one side and sinking clay on the other. This differential settlement literally tears the house in half if it isn't underpinned properly." 
    },
    { 
        city: 'Leander', state: 'TX', zip: '78641', 
        profile: "The rapid residential growth in Leander has exposed the severe limitations of building on Central Texas clay. When the summer heat bakes the moisture out of the ground, the soil pulls away from the foundation footings, causing immediate structural drop. We do a lot of forensic leveling out here to save the masonry." 
    },
    { 
        city: 'New Braunfels', state: 'TX', zip: '78130', 
        profile: "In New Braunfels, the terrain shifts from heavy clay to limestone karst. The fluctuating water table and shifting soils create a dynamic environment that wreaks havoc on concrete slabs. We spend a lot of time injecting high-density polyurethane to fill voids and driving helical piers to anchor settling corners." 
    },
    { 
        city: 'Boerne', state: 'TX', zip: '78006', 
        profile: "Boerne's Hill Country topography means homes are often built on slopes with highly active clay soils. Over time, soil creep and lateral movement push against the foundation, causing bowing and severe cracking. We often have to install specialized anchoring systems to stabilize the slope and protect the slab." 
    },

    // Kansas City (Missouri Side)
    { 
        city: "Lee's Summit", state: 'MO', zip: '64081', 
        profile: "Here in Lee's Summit, we aren't just dealing with slab cracks—we are dealing with basement walls caving in. The heavy clay soils hold massive amounts of water during the spring thaw, exerting immense hydrostatic pressure against your block walls. Once you see a horizontal crack, the wall is failing and requires heavy steel I-beam reinforcement or wall anchors." 
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
    console.log("🚀 Starting SUBURBAN RING Ingestion (DFW, Austin, KC)...");
    
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
                neighborhoods: [{ name: `Central ${target.city}`, risk: "Severe", note: "High wealth suburb / extreme soil risk" }],
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
            const fallbackComponent = 'Expansive Clay / Bedrock Transition';
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
    console.log("\n🎉 SUBURBAN BATCH COMPLETE! The sitemap is locked, loaded, and automatically spider-webbed.");
}

run();

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
        city: 'Charlotte', state: 'NC', zip: '28202', 
        profile: "Charlotte is the epicenter of the Carolina Piedmont clay belt. This highly plastic red clay retains massive amounts of water during the rainy season, exerting extreme hydrostatic pressure against residential basements. When the clay dries out during late summer, it shrinks and pulls away, leaving the foundation unsupported. We specialize in diagnosing this rapid cyclical failure and deploying heavy-duty steel piering to anchor Charlotte homes directly into the deep, stable bedrock." 
    },
    { 
        city: 'Raleigh', state: 'NC', zip: '27601', 
        profile: "Raleigh's rapid residential expansion is frequently compromised by its complex transitional geology. Builders often mix the native expansive clay with sandy fill dirt, creating a highly unstable foundation base. As the fill dirt consolidates and the clay heaves, Raleigh homes experience violent differential settlement, snapping rigid concrete slabs and cracking exterior brickwork. We bypass the failing soil entirely by driving helical piers down to load-bearing strata." 
    },
    { 
        city: 'Durham', state: 'NC', zip: '27701', 
        profile: "Durham features some of the oldest and most mature trees in the Triangle, which creates a massive root-desiccation problem for the local clay soils. During droughts, these deep root systems pull all the moisture out of the clay beneath your home, causing the soil to drastically shrink. The foundation drops into the newly created void, causing floors to slope and doors to jam. We use advanced slab-jacking and steel underpinning to lift and permanently support Durham properties." 
    },
    { 
        city: 'Cary', state: 'NC', zip: '27513', 
        profile: "In Cary, high-value real estate is often built on steeply graded hillsides consisting of native Piedmont clay. Over time, the soil undergoes 'soil creep'—slowly migrating downhill and pulling the foundation with it. This lateral movement causes extreme sheer stress on basement walls and foundation footings. We secure Cary homes against this hillside movement by installing engineered wall anchors and deep-driven helical tie-backs." 
    },
    { 
        city: 'Concord', state: 'NC', zip: '28025', 
        profile: "Concord's housing market is heavily impacted by the localized pockets of 'Fat Clay'—clay with a dangerously high Plasticity Index. This soil acts like a pressurized sponge, lifting the home up during wet months and dropping it during dry months. The constant flexing fatigues the structural framing, leading to drywall tears and sticking windows. We provide permanent stabilization for Concord homes by installing rigid steel push piers that refuse against solid rock." 
    },
    { 
        city: 'Gastonia', state: 'NC', zip: '28052', 
        profile: "Foundation failure in Gastonia is often tied to poor perimeter drainage compounding the effects of the local expansive clay. When gutters and downspouts fail to push water away from the house, the clay at the foundation perimeter super-saturates and expands, lifting the exterior walls while the interior slab stays flat. This 'heave' snaps the concrete. We install deep perimeter drainage solutions alongside structural underpinning to permanently fix Gastonia foundations." 
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
    console.log("🚀 Starting CAROLINA PIEDMONT Ingestion...");
    
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
                neighborhoods: [{ name: `Central ${target.city}`, risk: "High", note: "Piedmont Clay high shrink-swell zone" }],
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
                component_name: soil.component_name || 'Piedmont Clay',
                shrink_swell_potential: Number(soil.shrink_swell || 0),
                plasticity_index: pi > 0 ? pi : 28, // High baseline for Piedmont
                drainage_class: soil.drainage_class || 'Poorly drained',
                risk_level: riskLevel === 'Moderate' ? 'High' : riskLevel // Override to High
            }, { onConflict: 'location_id' });
            
            if (soilError) console.error(`   ❌ Soil Error for ${target.city}:`, soilError.message);
            else console.log(`   ✅ Success! ${target.city} added with USDA Soil PI: ${pi}.`);
        } else {
            console.log(`   ✅ Success! ${target.city} added (Soil data missing)`);
        }
    }
    console.log("\n🎉 CAROLINAS BATCH COMPLETE! The sitemap is locked, loaded, and automatically spider-webbed.");
}

run();

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

let supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.startsWith('http')) supabaseUrl = `https://${supabaseUrl}`;
const serviceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

// Initialize DeepSeek (Using OpenAI SDK compatibility)
const deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: envConfig.DEEPSEEK || process.env.DEEPSEEK
});

// Sleep function for API throttling
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- THE GOD-MODE PIPELINE ---
async function getCoords(city, state) {
    try {
        // Using strict 2-second delay to respect Nominatim limits and avoid IP bans
        await sleep(2000); 
        const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=us&format=json&limit=1`;
        const res = await fetch(url, { headers: { 'User-Agent': 'FoundationGodModeEngine/2.0' } });
        const data = await res.json();
        if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch (e) {
        console.error(`   ❌ Geocode Error (${city}):`, e.message);
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
        await sleep(1500); // Protect USDA server from crashing
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

async function generateCityProfile(city, state, soilData) {
    const soilName = soilData ? soilData.map_unit_name : "Expansive Clay";
    const pi = soilData ? Number(soilData.plasticity_index || 0).toFixed(1) : "Unknown";
    
    const prompt = `
You are an expert geotechnical engineer and elite SEO copywriter. 
Write a highly compelling, 150-word forensic foundation repair profile for the city of ${city}, ${state}.
The dominant local soil is: ${soilName} (Plasticity Index: ${pi}).

Guidelines:
- Explain EXACTLY why foundations fail in ${city} based on this soil type (e.g., if it has high plasticity, mention shrink/swell and hydrostatic pressure. If it's sandy or limestone, mention sinkholes or washout).
- Mention specific foundation repair solutions like "steel push piers", "helical tie-backs", or "poly-foam void filling".
- Do not use generic filler. Make it sound like a terrifying but solvable engineering diagnostic report.
- DO NOT use markdown formatting. Just return the raw text paragraph.
    `;

    try {
        const completion = await deepseek.chat.completions.create({
            messages: [{ role: "system", content: "You are a professional geotechnical engineer." }, { role: "user", content: prompt }],
            model: "deepseek-chat", // DeepSeek V3 model
            max_tokens: 300,
            temperature: 0.6
        });
        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error(`   ❌ DeepSeek LLM Error for ${city}:`, error.message);
        return `Homes in ${city}, ${state} are severely impacted by the local ${soilName}. Due to seasonal moisture changes, this soil rapidly expands and contracts, causing massive differential settlement. We deploy deep-driven steel piers to anchor ${city} homes to stable bedrock.`;
    }
}

async function runGodMode(targets) {
    console.log(`🚀 STARTING GOD-MODE EXPANSION ENGINE (${targets.length} Cities)...`);
    
    // Cache existing cities to prevent duplicates
    const { data: existingLocations } = await supabase.from('target_locations').select('slug, city');
    const existingCities = existingLocations.map(l => l.city.toLowerCase());

    for (const rawTarget of targets) {
        // Sanitize city name (St. Louis -> St Louis, Winston-Salem -> Winston Salem) to prevent ugly URL slugs
        const sanitizedCity = rawTarget.city.replace(/\./g, '').replace(/'/g, '').replace(/-/g, ' ');
        const target = { ...rawTarget, city: sanitizedCity };

        if (existingCities.includes(target.city.toLowerCase())) {
            console.log(`   ⏭️ SKIPPING: ${target.city} (Already exists)`);
            continue;
        }

        console.log(`\n📍 Processing ${target.city}, ${target.state}...`);
        
        // 1. Geocode
        const coords = await getCoords(target.city, target.state);
        if (!coords) { console.log(`   ❌ Geocoding failed for ${target.city}`); continue; }

        // 2. Fetch USDA Soil Data
        const soil = await getSoilData(coords.lat, coords.lon);
        let pi = 0;
        let soilRisk = 'Moderate';
        
        if (soil) {
            pi = Number(soil.plasticity_index || 0);
            soilRisk = pi > 25 ? 'Severe' : pi > 15 ? 'High' : 'Moderate';
            console.log(`   🌍 Soil Found: ${soil.map_unit_name} (PI: ${pi})`);
        } else {
            console.log(`   ⚠️ No exact soil match, using fallback.`);
        }

        // 3. Generate Unique Copy via DeepSeek LLM
        console.log(`   🧠 Generating unique engineering profile via DeepSeek...`);
        const profile = await generateCityProfile(target.city, target.state, soil);

        // 4. Inject into Database
        const { data: locData, error: locError } = await supabase
            .from('target_locations')
            .upsert({
                city: target.city,
                state: target.state,
                zip_code: target.zip || '00000',
                latitude: coords.lat,
                longitude: coords.lon,
                neighborhoods: [{ name: `Central ${target.city}`, risk: soilRisk, note: `Automated assessment via God-Mode Engine` }],
                city_profile: profile
            }, { onConflict: 'slug' })
            .select().single();

        if (locError) {
            console.error(`   ❌ DB Error for ${target.city}:`, locError.message);
            continue;
        }

        if (soil) {
            await supabase.from('soil_cache').upsert({
                location_id: locData.id,
                map_unit_symbol: soil.map_unit_symbol,
                map_unit_name: soil.map_unit_name,
                component_name: soil.component_name || 'Expansive Clay',
                shrink_swell_potential: Number(soil.shrink_swell || 0),
                plasticity_index: pi,
                drainage_class: soil.drainage_class || 'Poorly drained',
                risk_level: soilRisk
            }, { onConflict: 'location_id' });
        }

        console.log(`   ✅ SUCCESS: ${target.city} fully ingested and optimized!`);
    }
    console.log("\n🎉 GOD-MODE RUN COMPLETE! All pages are active on the site.");
}

// --- EXECUTION ---
console.log("📥 Loading the massive Phase 1 target list (4,348 cities)...");
const phase1Targets = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'scripts/phase1-targets.json'), 'utf-8'));

// Run the engine
runGodMode(phase1Targets).catch(console.error);

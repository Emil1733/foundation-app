import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.length < 3) {
    console.log(`
    Usage: node scripts/add-city.mjs <ZIP> <CITY> <STATE>
    Example: node scripts/add-city.mjs 75024 Plano TX
    `);
    process.exit(1);
}

const [ZIP, CITY, STATE] = args;
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

let supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.startsWith('http')) supabaseUrl = `https://${supabaseUrl}`;
const serviceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const USDA_URL = 'https://sdmdataaccess.nrcs.usda.gov/Tabular/post.rest';
const SCREENING_DEPTH_CM = 50;

function classifySoilPlasticityIndex(value) {
    if (value === null || value === undefined || value === '') return 'Not classified';
    const pi = Number(value);
    if (!Number.isFinite(pi) || pi < 0) return 'Not classified';
    if (pi > 35) return 'Severe';
    if (pi > 25) return 'High';
    if (pi > 15) return 'Moderate';
    return 'Lower';
}

function toFiniteNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function aggregateSoilTable(table) {
    if (!table || table.length <= 1) return null;
    const headers = table[0].map(String);
    const rows = table.slice(1).map((values) => Object.fromEntries(headers.map((header, i) => [header, values[i]])));
    const first = rows[0];
    const componentRows = rows.filter((row) => row.component_key === first.component_key);

    const weighted = (field) => {
        let total = 0;
        let depth = 0;
        for (const row of componentRows) {
            const top = toFiniteNumber(row.horizon_top_cm);
            const bottom = toFiniteNumber(row.horizon_bottom_cm);
            const value = toFiniteNumber(row[field]);
            if (top === null || bottom === null || value === null) continue;
            const thickness = Math.min(SCREENING_DEPTH_CM, bottom) - Math.max(0, top);
            if (thickness <= 0) continue;
            total += value * thickness;
            depth += thickness;
        }
        return depth > 0 ? total / depth : null;
    };

    return {
        map_unit_symbol: first.map_unit_symbol || null,
        map_unit_name: first.map_unit_name || null,
        component_name: first.component_name || null,
        shrink_swell: weighted('shrink_swell'),
        plasticity_index: weighted('plasticity_index'),
        drainage_class: first.drainage_class || null,
    };
}

async function getCoords(zip) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=us&format=json&limit=1`;
        const res = await fetch(url, { headers: { 'User-Agent': 'FoundationRiskApp/1.0' } });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        if (!data?.length) return null;
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch (e) {
        console.error(`Geocode error (${zip}):`, e.message);
        return null;
    }
}

async function getSoilData(lat, lon) {
    const query = `
      SELECT
        mu.musym AS map_unit_symbol,
        mu.muname AS map_unit_name,
        c.cokey AS component_key,
        c.compname AS component_name,
        c.comppct_r AS component_percent,
        ch.hzdept_r AS horizon_top_cm,
        ch.hzdepb_r AS horizon_bottom_cm,
        ch.lep_r AS shrink_swell,
        ch.pi_r AS plasticity_index,
        c.drainagecl AS drainage_class
      FROM mapunit mu
      INNER JOIN component c ON c.mukey = mu.mukey
      INNER JOIN chorizon ch ON ch.cokey = c.cokey
      WHERE mu.mukey IN (
        SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('POINT(${lon} ${lat})')
      )
      AND c.majcompflag = 'Yes'
      AND ch.hzdept_r < ${SCREENING_DEPTH_CM}
      ORDER BY c.comppct_r DESC, ch.hzdept_r ASC
    `;

    try {
        const res = await fetch(USDA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, format: 'JSON+COLUMNNAME' })
        });
        if (!res.ok) throw new Error(`USDA API HTTP ${res.status}`);
        const data = await res.json();
        return aggregateSoilTable(data.Table);
    } catch (e) {
        console.error('USDA error:', e.message);
        return null;
    }
}

async function getRealNeighborhoods(lat, lon) {
    console.log('Scanning OpenStreetMap for named neighborhoods...');
    const query = `
        [out:json][timeout:10];
        (
          node["place"~"neighbourhood|suburb|quarter"](around:6000,${lat},${lon});
          way["place"~"neighbourhood|suburb|quarter"](around:6000,${lat},${lon});
        );
        out tags center;
    `;

    try {
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'FoundationRiskApp/1.0' } });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        if (!data?.elements?.length) return [];
        return [...new Set(data.elements.map((el) => el.tags?.name).filter(Boolean))]
            .slice(0, 8)
            .map((name) => ({ name }));
    } catch (e) {
        console.warn('Overpass error:', e.message);
        return [];
    }
}

async function run() {
    console.log(`\nInjecting city: ${CITY}, ${STATE} (${ZIP})...`);

    const coords = await getCoords(ZIP);
    if (!coords) {
        console.error('Geocoding failed. Check ZIP code.');
        process.exit(1);
    }

    const neighborhoods = await getRealNeighborhoods(coords.lat, coords.lon);
    console.log(neighborhoods.length === 0 ? 'No sourced neighborhood names found. Storing an empty neighborhood list.' : `Found ${neighborhoods.length} sourced neighborhood names.`);

    const slug = CITY.toLowerCase().replace(/[\.,]/g, '').trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const { data: existing } = await supabase
        .from('target_locations')
        .select('zip_code, city')
        .eq('slug', slug)
        .neq('zip_code', ZIP)
        .maybeSingle();

    if (existing) console.warn(`WARNING: slug '${slug}' is already used by ${existing.city} (${existing.zip_code}).`);

    const { data: locData, error: locError } = await supabase
        .from('target_locations')
        .upsert({ city: CITY, state: STATE, zip_code: ZIP, latitude: coords.lat, longitude: coords.lon, neighborhoods }, { onConflict: 'slug' })
        .select()
        .single();

    if (locError) {
        console.error('DB location insert error:', locError.message);
        process.exit(1);
    }

    console.log('Querying USDA soil database...');
    const soil = await getSoilData(coords.lat, coords.lon);
    if (!soil) {
        console.warn('No mapped soil data found at the geocoded point. No placeholder soil record will be created.');
        return;
    }

    const { error: soilError } = await supabase
        .from('soil_cache')
        .upsert({
            location_id: locData.id,
            map_unit_symbol: soil.map_unit_symbol,
            map_unit_name: soil.map_unit_name,
            component_name: soil.component_name,
            shrink_swell_potential: soil.shrink_swell,
            plasticity_index: soil.plasticity_index,
            drainage_class: soil.drainage_class,
            risk_level: classifySoilPlasticityIndex(soil.plasticity_index)
        }, { onConflict: 'location_id' });

    if (soilError) {
        console.error('Soil insert error:', soilError.message);
        process.exit(1);
    }

    console.log(`Success. Visit /services/foundation-repair/${slug}`);
}

run();

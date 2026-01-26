import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. Setup Supabase (Using verified Node.js stack)
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
    supabaseUrl = `https://${supabaseUrl}`;
}
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSecret = process.env.ADMIN_SECRET || 'changeme';

// 2. Constants & Types
const USDA_URL = "https://sdmdataaccess.nrcs.usda.gov/Tabular/post.rest";

type TargetLoc = { zip: string, city: string, state: string };

export const dynamic = 'force-dynamic'; // Ensure this never caches

export async function GET(request: Request) {
    // 0. Security Check
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Parse Body
    let targets: TargetLoc[] = [];
    try {
        const body = await request.json();
        if (body.targets && Array.isArray(body.targets)) {
            targets = body.targets;
        }
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body. Expected { targets: [{zip, city, state}] }' }, { status: 400 });
    }

    if (targets.length === 0) {
        return NextResponse.json({ error: 'No targets provided' }, { status: 400 });
    }

    // Debugging Info (Safe to expose to Admin)
    const debugInfo = {
        env_url_raw: process.env.NEXT_PUBLIC_SUPABASE_URL,
        env_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        secret_received: secret === adminSecret ? 'MATCH' : 'MISMATCH'
    };

    if (secret !== adminSecret) {
        return NextResponse.json({ error: 'Unauthorized', debug: debugInfo }, { status: 401 });
    }

    if (!supabaseUrl || !serviceKey) {
        return NextResponse.json({ error: 'Missing Supabase Config', debug: debugInfo }, { status: 500 });
    }

    // Trim and Clean
    const cleanUrl = supabaseUrl.trim();
    const cleanKey = serviceKey.trim();

    const supabase = createClient(cleanUrl, cleanKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });

    const results = [];
    results.push({ info: "Config Loaded", url: cleanUrl, key_len: cleanKey.length });

    // 1. Helper: Geocode
    async function getCoords(zip: string) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=us&format=json&limit=1`;
            const res = await fetch(url, { headers: { 'User-Agent': 'FoundationRiskApp/1.0' } });
            if (!res.ok) throw new Error(res.statusText);

            const data = await res.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                };
            }
            return null;
        } catch (e: any) {
            console.error(`Geocode Error (${zip}):`, e.message);
            return null;
        }
    }

    // 2. Helper: Fetch Soil
    async function getSoilData(lat: number, lon: number) {
        const query = `
          SELECT 
            mu.musym AS map_unit_symbol,
            mu.muname AS map_unit_name,
            c.compname AS component_name,
            c.comppct_r AS component_percent,
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
          AND ch.hzdept_r < 50
          ORDER BY c.comppct_r DESC, ch.hzdept_r ASC
        `;

        try {
            const res = await fetch(USDA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, format: "JSON+COLUMNNAME" })
            });

            if (!res.ok) throw new Error(`USDA API: ${res.statusText}`);

            const data = await res.json();
            if (data.Table && data.Table.length > 1) {
                const headers = data.Table[0];
                const values = data.Table[1];
                const rec: any = {};
                headers.forEach((key: string, i: number) => rec[key] = values[i]);
                return rec;
            }
            return null;
        } catch (e: any) {
            console.error(`USDA Error:`, e.message);
            return null;
        }
    }

    // 3. Execution Loop
    try {
        for (const loc of targets) {
            // A. Geocode
            const coords = await getCoords(loc.zip);
            if (!coords) {
                results.push({ city: loc.city, status: 'Failed: Geocode' });
                continue;
            }

            // B. Upsert Location
            const { data: locData, error: locError } = await supabase
                .from('target_locations')
                .upsert({
                    city: loc.city,
                    state: loc.state,
                    zip_code: loc.zip,
                    latitude: coords.lat,
                    longitude: coords.lon
                }, { onConflict: 'zip_code' })
                .select()
                .single();

            if (locError) {
                results.push({ city: loc.city, status: `Failed: DB Loc - ${locError.message}` });
                continue;
            }

            // C. Fetch Soil
            const soil = await getSoilData(coords.lat, coords.lon);
            if (!soil) {
                results.push({ city: loc.city, status: 'Failed: No Soil Data' });
                continue;
            }

            // D. Upsert Soil
            const riskLevel = Number(soil.plasticity_index) > 35 ? 'Severe' :
                Number(soil.plasticity_index) > 25 ? 'High' :
                    'Moderate';

            const { error: soilError } = await supabase
                .from('soil_cache')
                .upsert({
                    location_id: locData.id,
                    map_unit_symbol: soil.map_unit_symbol,
                    map_unit_name: soil.map_unit_name,
                    component_name: soil.component_name,
                    shrink_swell_potential: Number(soil.shrink_swell || 0),
                    plasticity_index: Number(soil.plasticity_index || 0),
                    drainage_class: soil.drainage_class,
                    risk_level: riskLevel
                }, { onConflict: 'location_id' });

            if (soilError) {
                results.push({ city: loc.city, status: `Failed: DB Soil - ${soilError.message}` });
            } else {
                results.push({
                    city: loc.city,
                    status: 'Success',
                    soil: soil.map_unit_name,
                    pi: soil.plasticity_index
                });
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

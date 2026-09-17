import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { classifySoilPlasticityIndex } from '@/lib/soilRisk';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.startsWith('http')) supabaseUrl = `https://${supabaseUrl}`;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminSecret = process.env.ADMIN_SECRET;
const USDA_URL = 'https://sdmdataaccess.nrcs.usda.gov/Tabular/post.rest';

type TargetLoc = { zip: string; city: string; state: string };

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    // Fail closed. An admin ingestion endpoint must never acquire a default secret.
    if (!adminSecret) {
        console.error('ADMIN_SECRET is not configured. Admin ingestion is disabled.');
        return NextResponse.json({ error: 'Admin ingestion is not configured.' }, { status: 503 });
    }
    if (!supabaseUrl || !serviceKey) {
        console.error('Supabase admin credentials are not configured.');
        return NextResponse.json({ error: 'Admin ingestion is not configured.' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    if (secret !== adminSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let targets: TargetLoc[] = [];
    try {
        const body = await request.json();
        if (body.targets && Array.isArray(body.targets)) targets = body.targets;
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body. Expected { targets: [{zip, city, state}] }' }, { status: 400 });
    }

    if (targets.length === 0) return NextResponse.json({ error: 'No targets provided' }, { status: 400 });

    const cleanUrl = supabaseUrl.trim();
    const cleanKey = serviceKey.trim();
    const supabase = createClient(cleanUrl, cleanKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    const results: Array<Record<string, unknown>> = [];

    async function getCoords(zip: string) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=us&format=json&limit=1`;
            const res = await fetch(url, { headers: { 'User-Agent': 'FoundationRiskApp/1.0' } });
            if (!res.ok) throw new Error(res.statusText);
            const data = await res.json();
            if (!data?.length) return null;
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        } catch (error: unknown) {
            console.error(`Geocode Error (${zip}):`, error instanceof Error ? error.message : String(error));
            return null;
        }
    }

    async function getSoilData(lat: number, lon: number) {
        const query = `
          SELECT mu.musym AS map_unit_symbol, mu.muname AS map_unit_name,
            c.compname AS component_name, c.comppct_r AS component_percent,
            ch.lep_r AS shrink_swell, ch.pi_r AS plasticity_index,
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
                body: JSON.stringify({ query, format: 'JSON+COLUMNNAME' })
            });
            if (!res.ok) throw new Error(`USDA API: ${res.statusText}`);
            const data = await res.json() as { Table?: unknown[][] };
            if (!data.Table || data.Table.length <= 1) return null;
            const headers = data.Table[0] as string[];
            const values = data.Table[1];
            const rec: Record<string, unknown> = {};
            headers.forEach((key, i) => rec[key] = values[i]);
            return rec;
        } catch (error: unknown) {
            console.error('USDA Error:', error instanceof Error ? error.message : String(error));
            return null;
        }
    }

    try {
        for (const loc of targets) {
            if (!/^\d{5}(?:-\d{4})?$/.test(String(loc.zip || '')) || !loc.city || !loc.state) {
                results.push({ city: loc.city || null, status: 'Failed: Invalid target data' });
                continue;
            }

            const coords = await getCoords(loc.zip);
            if (!coords) {
                results.push({ city: loc.city, status: 'Failed: Geocode' });
                continue;
            }

            const { data: locData, error: locError } = await supabase
                .from('target_locations')
                .upsert({ city: loc.city, state: loc.state, zip_code: loc.zip, latitude: coords.lat, longitude: coords.lon }, { onConflict: 'slug' })
                .select()
                .single();

            if (locError) {
                results.push({ city: loc.city, status: `Failed: DB Loc - ${locError.message}` });
                continue;
            }

            const soil = await getSoilData(coords.lat, coords.lon);
            if (!soil) {
                results.push({ city: loc.city, status: 'Failed: No Soil Data' });
                continue;
            }

            const { error: soilError } = await supabase
                .from('soil_cache')
                .upsert({
                    location_id: locData.id,
                    map_unit_symbol: soil.map_unit_symbol,
                    map_unit_name: soil.map_unit_name,
                    component_name: soil.component_name || null,
                    shrink_swell_potential: soil.shrink_swell === null || soil.shrink_swell === undefined ? null : Number(soil.shrink_swell),
                    plasticity_index: soil.plasticity_index === null || soil.plasticity_index === undefined ? null : Number(soil.plasticity_index),
                    drainage_class: soil.drainage_class || null,
                    risk_level: classifySoilPlasticityIndex(soil.plasticity_index)
                }, { onConflict: 'location_id' });

            results.push(soilError
                ? { city: loc.city, status: `Failed: DB Soil - ${soilError.message}` }
                : { city: loc.city, status: 'Success', soil: soil.map_unit_name, pi: soil.plasticity_index });
        }

        return NextResponse.json({ success: true, results });
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

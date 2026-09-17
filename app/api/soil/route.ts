import { NextResponse } from 'next/server';

const USDA_URL = "https://sdmdataaccess.nrcs.usda.gov/Tabular/post.rest";

function parseCoordinate(value: unknown, min: number, max: number) {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
    return parsed;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const safeLat = parseCoordinate(body?.lat, -90, 90);
        const safeLon = parseCoordinate(body?.lon, -180, 180);

        if (safeLat === null || safeLon === null) {
            return NextResponse.json({ error: "Valid lat/lon coordinates are required" }, { status: 400 });
        }

        // This query intentionally returns the dominant major component first,
        // then its shallowest horizon within the top 50 cm. The API currently
        // exposes that first row as mapped screening context. Do not describe it
        // as a property measurement or silently change the row-selection method
        // without validating the scientific interpretation and existing data.
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
        SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('POINT(${safeLon} ${safeLat})')
      )
      AND c.majcompflag = 'Yes'
      AND ch.hzdept_r < 50
      ORDER BY c.comppct_r DESC, ch.hzdept_r ASC
    `;

        const res = await fetch(USDA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, format: "JSON+COLUMNNAME" })
        });

        if (!res.ok) {
            console.error(`USDA API failed with HTTP ${res.status}`);
            return NextResponse.json({ error: "Soil data provider is temporarily unavailable" }, { status: 502 });
        }

        const data = await res.json() as { Table?: unknown[][] };

        if (data.Table && data.Table.length > 1) {
            const headers = data.Table[0] as string[];
            const values = data.Table[1];
            const soilData: Record<string, unknown> = {};
            headers.forEach((key: string, index: number) => {
                soilData[key] = values[index];
            });
            return NextResponse.json(soilData);
        }

        return NextResponse.json({ error: "No soil data found for this location" }, { status: 404 });
    } catch (error: unknown) {
        console.error("Soil API error:", error);
        return NextResponse.json({ error: "Unable to process soil lookup" }, { status: 500 });
    }
}

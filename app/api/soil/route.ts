import { NextResponse } from 'next/server';

const USDA_URL = "https://sdmdataaccess.nrcs.usda.gov/Tabular/post.rest";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { lat, lon } = body;

        if (!lat || !lon) {
            return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
        }

        // SQL Query to get Soil Map Unit + Shrink-Swell (LEP) + Liquid Limit (PI)
        // Same query as verified in verify_usda_api.py
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
      AND c.majcompflag = 'Yes' -- Only major components
      AND ch.hzdept_r < 50 -- Top 50cm
      ORDER BY c.comppct_r DESC, ch.hzdept_r ASC
    `;

        const payload = {
            query: query,
            format: "JSON+COLUMNNAME"
        };

        const res = await fetch(USDA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`USDA API failed: ${res.statusText}`);
        }

        const data = await res.json();

        if (data.Table && data.Table.length > 1) {
            // Data found. 
            // Row 0 = Headers, Row 1 = Values
            const headers = data.Table[0];
            const values = data.Table[1];

            const soilData: Record<string, any> = {};
            headers.forEach((key: string, index: number) => {
                soilData[key] = values[index];
            });

            return NextResponse.json(soilData);
        } else {
            return NextResponse.json({ error: "No soil data found for this location" }, { status: 404 });
        }

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

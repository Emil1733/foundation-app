import { NextResponse } from 'next/server';
import { aggregateUsdaSoilTable, buildUsdaSoilQuery } from '@/lib/usdaSoil';

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

        const query = buildUsdaSoilQuery(safeLat, safeLon);
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
        const soilData = aggregateUsdaSoilTable(data.Table);
        if (soilData) return NextResponse.json(soilData);

        return NextResponse.json({ error: "No soil data found for this location" }, { status: 404 });
    } catch (error: unknown) {
        console.error("Soil API error:", error);
        return NextResponse.json({ error: "Unable to process soil lookup" }, { status: 500 });
    }
}

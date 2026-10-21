import { NextResponse } from 'next/server';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const address = typeof body?.address === 'string' ? body.address.trim() : '';

    if (address.length < 5 || address.length > 250) {
      return NextResponse.json({ error: 'Enter a complete property address.' }, { status: 400 });
    }

    const params = new URLSearchParams({
      q: address,
      format: 'jsonv2',
      limit: '1',
      countrycodes: 'us',
    });

    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'FoundationRisk.org property soil lookup',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      console.error(`Geocoding provider failed with HTTP ${response.status}`);
      return NextResponse.json({ error: 'Address lookup is temporarily unavailable.' }, { status: 502 });
    }

    const results = await response.json() as Array<{ lat?: string; lon?: string; display_name?: string }>;
    const match = results?.[0];
    const lat = Number(match?.lat);
    const lon = Number(match?.lon);

    if (!match || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: 'We could not find that U.S. address. Try including the city and state.' }, { status: 404 });
    }

    return NextResponse.json({ lat, lon, display_name: match.display_name || address });
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      return NextResponse.json({ error: 'Address lookup took too long. Please try again.' }, { status: 504 });
    }
    // Avoid logging an upstream request URL containing the property address.
    console.error('Geocoding API error:', error instanceof Error ? error.name : 'UnknownError');
    return NextResponse.json({ error: 'Unable to process the address lookup.' }, { status: 500 });
  }
}

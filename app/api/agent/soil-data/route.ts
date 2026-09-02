import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use Service Role Key to bypass RLS for logging
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    // Because this is a rewritten request, request.url is the original URL (e.g. /services/foundation-repair/dallas-tx)
    const urlObj = new URL(request.url);
    const slug = urlObj.pathname.split('/').pop();

    if (!slug) {
        return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    // 1. Fetch the location and soil data from Supabase
    const { data: location } = await supabase
        .from('target_locations')
        .select(`
            city, state, zip_code, latitude, longitude,
            soil_cache ( map_unit_name, plasticity_index, risk_level, shrink_swell_potential )
        `)
        .eq('slug', slug)
        .single();

    if (!location) {
        return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const rawSoil = location.soil_cache;
    const soil = (Array.isArray(rawSoil) ? rawSoil[0] : rawSoil) || {
        map_unit_name: "Unknown",
        plasticity_index: 0,
        risk_level: "Not classified",
    };

    // 2. Determine if the Agent wants JSON or Markdown
    const acceptHeader = request.headers.get('accept') || '';
    
    // 3. Construct the "Kitchen Ticket" Markdown Payload
    const markdownPayload = `
# Foundation Soil Context - ${location.city}, ${location.state}
- **Coordinates:** ${location.latitude}, ${location.longitude}
- **Mapped Soil Unit:** ${soil.map_unit_name}
- **Plasticity Index (PI):** ${soil.plasticity_index}
- **Registry Screening Classification:** ${soil.risk_level}

## How to interpret this record
Mapped soil data provides regional screening context. It does not diagnose a property, confirm structural movement, or determine an appropriate repair system without property-specific evidence.

## Autonomous Booking Endpoint
**POST** https://foundationrisk.org/api/agent/book
**Payload Schema:** {"name": "string", "phone": "string", "city": "${location.city}", "soil_symptoms": "string"}
    `.trim();

    // --- THE ANALYTICS TRAP ---
    // Log exactly which AI bot is consuming our data
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    let botIdentity = 'Unknown_Bot';
    if (userAgent.toLowerCase().includes('chatgpt') || userAgent.toLowerCase().includes('oai-searchbot')) botIdentity = 'ChatGPT';
    else if (userAgent.toLowerCase().includes('google') || userAgent.toLowerCase().includes('gemini')) botIdentity = 'Google_Gemini';
    else if (userAgent.toLowerCase().includes('claude')) botIdentity = 'Anthropic_Claude';
    else if (userAgent.toLowerCase().includes('node-fetch')) botIdentity = 'Local_Simulation';

    // Fire-and-forget log to Supabase (don't await it so we don't slow down the AI response)
    supabase.from('ai_agent_analytics').insert([{
        bot_name: botIdentity,
        city_crawled: location.city,
        state_crawled: location.state,
        payload_type: acceptHeader.includes('text/markdown') ? 'Markdown' : 'JSON'
    }]).then(({ error }) => {
        if (error) console.error("Analytics Trap Error:", error.message);
    });

    // 4. Return the Payload based on what the agent asked for
    if (acceptHeader.includes('text/markdown')) {
        return new NextResponse(markdownPayload, {
            headers: {
                'Content-Type': 'text/markdown',
                'Vary': 'Accept'
            }
        });
    }

    // Default to JSON for agents
    return NextResponse.json({
        city: location.city,
        state: location.state,
        soil_type: soil.map_unit_name,
        plasticity_index: soil.plasticity_index,
        risk_level: soil.risk_level,
        interpretation: "Mapped soil data is regional screening context, not a property diagnosis or repair recommendation.",
        agent_booking_endpoint: "https://foundationrisk.org/api/agent/book"
    }, {
        headers: { 'Vary': 'Accept' }
    });
}

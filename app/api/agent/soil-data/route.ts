import { after, type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const publicSupabase = createClient(supabaseUrl, supabaseAnonKey);
const analyticsSupabase = createClient(supabaseUrl, supabaseServiceKey);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESPONSE_HEADERS = {
    'Cache-Control': 'private, no-store',
    'Vary': 'Accept',
};

const identifyBot = (userAgent: string) => {
    const value = userAgent.toLowerCase();
    if (value.includes('gptbot') || value.includes('chatgpt-user') || value.includes('oai-searchbot')) return 'OpenAI';
    if (value.includes('googlebot') || value.includes('google-extended') || value.includes('gemini')) return 'Google';
    if (value.includes('claudebot') || value.includes('claude-searchbot') || value.includes('claude-user')) return 'Anthropic';
    if (value.includes('perplexitybot') || value.includes('perplexity-user')) return 'Perplexity';
    return null;
};

export async function GET(request: NextRequest) {
    const requestedSlug = request.nextUrl.searchParams.get('slug') || '';
    const slug = requestedSlug.replace(/-soil-analysis$/, '');

    if (slug.length > 100 || !SLUG_PATTERN.test(slug)) {
        return NextResponse.json(
            { error: 'A valid city slug is required.' },
            { status: 400, headers: RESPONSE_HEADERS },
        );
    }

    const { data: location, error } = await publicSupabase
        .from('target_locations')
        .select(`
            city, state, zip_code, latitude, longitude,
            soil_cache ( map_unit_name, plasticity_index, risk_level, shrink_swell_potential )
        `)
        .eq('slug', slug)
        .single();

    if (error || !location) {
        const status = error?.code === 'PGRST116' ? 404 : 503;
        return NextResponse.json(
            { error: status === 404 ? 'Location not found.' : 'Soil data is temporarily unavailable.' },
            { status, headers: RESPONSE_HEADERS },
        );
    }

    const rawSoil = location.soil_cache;
    const soil = (Array.isArray(rawSoil) ? rawSoil[0] : rawSoil) || {
        map_unit_name: "Unknown",
        plasticity_index: 0,
        risk_level: "Not classified",
    };

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

    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const botIdentity = identifyBot(userAgent);

    if (botIdentity) {
        after(async () => {
            const { error: analyticsError } = await analyticsSupabase
                .from('ai_agent_analytics')
                .insert([{
                    bot_name: botIdentity,
                    city_crawled: location.city,
                    state_crawled: location.state,
                    payload_type: acceptHeader.includes('text/markdown') ? 'Markdown' : 'JSON',
                }]);

            if (analyticsError) {
                console.error('Agent analytics insert failed:', analyticsError.message);
            }
        });
    }

    // 4. Return the Payload based on what the agent asked for
    if (acceptHeader.includes('text/markdown')) {
        return new NextResponse(markdownPayload, {
            headers: {
                ...RESPONSE_HEADERS,
                'Content-Type': 'text/markdown',
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
        headers: RESPONSE_HEADERS,
    });
}

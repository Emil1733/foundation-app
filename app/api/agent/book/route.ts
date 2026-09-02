import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // We use the service key to bypass RLS for inserts
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    try {
        // --- 1. PARSE PAYLOAD ---
        const body = await request.json();
        const { name, phone, city, soil_symptoms } = body;

        if (!name || !phone || !city) {
            return NextResponse.json(
                { error: "Missing required fields (name, phone, city)" }, 
                { status: 400 }
            );
        }

        // --- 2. SPAM DEFENSE (STATEFUL DB RATE LIMITING) ---
        // Instead of using an in-memory Map (which resets on every Vercel Edge instance),
        // we use the actual database as our shared global state.
        const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
        
        const { count, error: countError } = await supabase
            .from('ai_agent_leads')
            .select('*', { count: 'exact', head: true })
            .eq('phone', phone)
            .gte('created_at', oneHourAgo);

        if (countError) {
            console.error("Rate Limit DB Error:", countError);
        } else if (count !== null && count >= 2) {
            console.warn(`🛑 [SPAM BLOCKED] Phone ${phone} submitted too many times.`);
            return NextResponse.json({ error: "Duplicate lead detected. Please try again later." }, { status: 429 });
        }

        const userAgent = request.headers.get('user-agent') || 'Unknown_Agent';
        
        // Try to identify the specific AI bot based on common agent strings
        let botIdentity = 'Generic_AI_Agent';
        if (userAgent.toLowerCase().includes('chatgpt') || userAgent.toLowerCase().includes('openai')) {
            botIdentity = 'ChatGPT';
        } else if (userAgent.toLowerCase().includes('google-extended') || userAgent.toLowerCase().includes('gemini')) {
            botIdentity = 'Google_Gemini';
        } else if (userAgent.toLowerCase().includes('claude') || userAgent.toLowerCase().includes('anthropic')) {
            botIdentity = 'Anthropic_Claude';
        } else if (userAgent.toLowerCase().includes('siri') || userAgent.toLowerCase().includes('apple')) {
            botIdentity = 'Apple_Intelligence';
        } else {
            botIdentity = `AI_Agent (${userAgent.substring(0, 20)})`;
        }

        console.log(`🟢 [${botIdentity} BOOKING RECEIVED] Attempting to save to Supabase...`);
        
        // Insert into Supabase
        const { data, error } = await supabase
            .from('ai_agent_leads')
            .insert([
                {
                    name,
                    phone,
                    city,
                    symptoms: soil_symptoms,
                    source: botIdentity
                }
            ])
            .select();

        if (error) {
            console.error("❌ Supabase Insert Error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log("✅ [LEAD SECURED IN SUPABASE] ID:", data?.[0]?.id);
        
        return NextResponse.json({ 
            success: true, 
            message: "Foundation evaluation follow-up request received.",
            lead_id: data?.[0]?.id,
            confirmation_code: `FRR-${Math.floor(Math.random() * 90000) + 10000}`
        });
        
    } catch {
        return NextResponse.json({ error: "Invalid JSON Payload" }, { status: 400 });
    }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // We use the service key to bypass RLS for inserts
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple in-memory rate limiter (Works well for warm serverless functions)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const MAX_BOOKINGS_PER_HOUR = 3;

export async function POST(request: Request) {
    try {
        // --- 1. SPAM DEFENSE (RATE LIMITING) ---
        const ip = request.headers.get('x-forwarded-for') || 'unknown_ip';
        const now = Date.now();
        const clientData = rateLimitMap.get(ip);

        if (clientData && now < clientData.resetTime) {
            if (clientData.count >= MAX_BOOKINGS_PER_HOUR) {
                console.warn(`🛑 [SPAM BLOCKED] IP ${ip} exceeded ${MAX_BOOKINGS_PER_HOUR} bookings/hr.`);
                return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
            }
            clientData.count += 1;
        } else {
            // Reset or initialize the counter (1 hour from now)
            rateLimitMap.set(ip, { count: 1, resetTime: now + 3600000 });
        }

        // --- 2. PARSE PAYLOAD ---
        const body = await request.json();
        const { name, phone, city, soil_symptoms } = body;

        if (!name || !phone || !city) {
            return NextResponse.json(
                { error: "Missing required fields (name, phone, city)" }, 
                { status: 400 }
            );
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
            message: "Consultation successfully booked.",
            lead_id: data?.[0]?.id,
            confirmation_code: `FRR-${Math.floor(Math.random() * 90000) + 10000}`
        });
        
    } catch (error) {
        return NextResponse.json({ error: "Invalid JSON Payload" }, { status: 400 });
    }
}

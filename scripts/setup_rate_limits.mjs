import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createRateLimitTable() {
    console.log("🚀 Creating `rate_limits` table in Supabase...");

    // We use the postgres REST API (rpc) or just raw SQL if possible. 
    // Since we don't have direct SQL access easily via the JS client without an RPC,
    // we can create an RPC to execute raw SQL, or we can just use the booking table.
    
    // Actually, let's just add an `ip_address` column to `ai_agent_leads` via a direct SQL query,
    // OR we can just use the `ai_agent_analytics` table which MIGHT already have IP?
    console.log("Note: Run this SQL in your Supabase SQL Editor:");
    console.log(`
CREATE TABLE rate_limits (
    ip text PRIMARY KEY,
    hit_count int DEFAULT 1,
    reset_time timestamp with time zone NOT NULL
);
    `);
}

createRateLimitTable();

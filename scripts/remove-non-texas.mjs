import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load Supabase configuration
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

let supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
    supabaseUrl = `https://${supabaseUrl}`;
}
const serviceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
    console.log("Texas-Only Cleanup: Removing non-Texas locations from the database...");
    
    // First, count how many we are deleting
    const { data, count, error: countError } = await supabase
        .from('target_locations')
        .select('*', { count: 'exact' })
        .neq('state', 'TX');

    if (countError) {
        console.error("❌ Error fetching non-TX locations:", countError.message);
        process.exit(1);
    }
    
    console.log(`Found ${count} non-Texas locations to remove.`);
    
    if (count > 0) {
        const { error: deleteError } = await supabase
            .from('target_locations')
            .delete()
            .neq('state', 'TX');
            
        if (deleteError) {
            console.error("❌ Error deleting non-TX locations:", deleteError.message);
        } else {
            console.log("✅ Successfully deleted all non-Texas locations.");
        }
    }
}

run();

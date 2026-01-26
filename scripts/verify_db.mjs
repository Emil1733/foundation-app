import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Manually load .env.local since generic dotenv doesn't do it automatically
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const SUPABASE_URL = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("❌ Missing API Keys in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function verifyConnection() {
    console.log(`Connecting to: ${SUPABASE_URL}`);

    // 1. Test Insert
    const testSlug = 'verify-db-test-slug';
    const { data: insertData, error: insertError } = await supabase
        .from('target_locations')
        .insert({
            city: 'Test City',
            state: 'TX',
            zip_code: '00000',
            latitude: 30.0,
            longitude: -90.0,
            // slug is generated always, so we don't insert it.
        })
        .select()
        .single();

    if (insertError) {
        // If unique constraint violation (maybe run before), try fetching it
        if (insertError.code === '23505') {
            console.log("⚠️ Test record already exists. Proceeding to delete.");
        } else {
            console.error("❌ Insert Failed:", insertError.message);
            return;
        }
    } else {
        console.log("✅ Insert Successful:", insertData.slug);
    }

    // 2. Test Read
    const { data: readData, error: readError } = await supabase
        .from('target_locations')
        .select('*')
        .eq('zip_code', '00000')
        .single();

    if (readError) {
        console.error("❌ Read Failed:", readError.message);
    } else {
        console.log("✅ Read Successful:", readData.city);
    }

    // 3. Test Delete (Clean up)
    const { error: deleteError } = await supabase
        .from('target_locations')
        .delete()
        .eq('zip_code', '00000');

    if (deleteError) {
        console.error("❌ Delete Failed:", deleteError.message);
    } else {
        console.log("✅ Cleanup Successful");
    }
}

verifyConnection();

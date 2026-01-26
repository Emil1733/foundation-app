const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Run from foundation-app directory
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSlugs() {
    console.log("Connecting to:", supabaseUrl);
    const { data, error } = await supabase
        .from('target_locations')
        .select('city, state, zip_code, slug');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Found Locations:", JSON.stringify(data, null, 2));
    }
}

checkSlugs();

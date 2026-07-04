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

if (!supabaseUrl || !serviceKey) {
    console.error("❌ Missing Supabase Credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function cleanup() {
    console.log("🔍 Scanning target_locations for duplicates...");

    // 1. Fetch all locations with their soil risk
    const { data: locations, error: locError } = await supabase
        .from('target_locations')
        .select(`
            id,
            city,
            state,
            zip_code,
            neighborhoods,
            soil_cache (
                plasticity_index,
                risk_level
            )
        `);

    if (locError) {
        console.error("❌ Error fetching locations:", locError.message);
        process.exit(1);
    }

    console.log(`   Found ${locations.length} total location records.`);

    // Group by City-State
    const groups = {};
    locations.forEach(loc => {
        const key = `${loc.city.trim().toLowerCase()}-${loc.state.trim().toLowerCase()}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(loc);
    });

    for (const [key, group] of Object.entries(groups)) {
        if (group.length <= 1) continue;

        console.log(`\n🏢 Found ${group.length} duplicates for key: '${key.toUpperCase()}'`);
        
        // Retain criteria:
        // Rank by Plasticity Index (PI) in soil cache, fallback to first
        const sorted = [...group].sort((a, b) => {
            const piA = a.soil_cache?.plasticity_index || 0;
            const piB = b.soil_cache?.plasticity_index || 0;
            return piB - piA; // Descending (keep highest PI)
        });

        const primary = sorted[0];
        const duplicates = sorted.slice(1);

        console.log(`   Keeping: ${primary.city}, ${primary.state} (ZIP: ${primary.zip_code}) | PI: ${primary.soil_cache?.plasticity_index || 0}`);

        // Merge neighborhoods
        let mergedNeighborhoods = [...(Array.isArray(primary.neighborhoods) ? primary.neighborhoods : [])];
        const seenNames = new Set(mergedNeighborhoods.map(n => n.name?.toLowerCase()));

        duplicates.forEach(dup => {
            const dupN = Array.isArray(dup.neighborhoods) ? dup.neighborhoods : [];
            dupN.forEach(n => {
                if (n.name && !seenNames.has(n.name.toLowerCase())) {
                    seenNames.add(n.name.toLowerCase());
                    mergedNeighborhoods.push(n);
                }
            });
        });

        console.log(`   Merged neighborhoods: total count increased from ${Array.isArray(primary.neighborhoods) ? primary.neighborhoods.length : 0} to ${mergedNeighborhoods.length}`);

        // Update primary
        const { error: updateError } = await supabase
            .from('target_locations')
            .update({ neighborhoods: mergedNeighborhoods })
            .eq('id', primary.id);

        if (updateError) {
            console.error(`   ❌ Failed to update neighborhoods for primary record:`, updateError.message);
            continue;
        }

        // Delete duplicates
        const deleteIds = duplicates.map(d => d.id);
        console.log(`   Deleting duplicate IDs: ${deleteIds.join(', ')}`);
        
        const { error: deleteError } = await supabase
            .from('target_locations')
            .delete()
            .in('id', deleteIds);

        if (deleteError) {
            console.error(`   ❌ Failed to delete duplicate records:`, deleteError.message);
        } else {
            console.log(`   ✅ Duplicates cleaned up successfully.`);
        }
    }

    console.log("\n🎉 Database cleanup complete!");
}

cleanup();

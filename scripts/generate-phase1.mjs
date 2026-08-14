import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cities = require('cities'); // or another package? Wait, `cities` package usually exposes a function `cities.zip_lookup(zip)` or something.

// Actually, `cities` package is usually accessed via zip lookup. 
// A better way is just to fetch a reliable JSON. Let's try this one:
async function run() {
    console.log("📥 Downloading reliable US Cities JSON...");
    
    try {
        const response = await fetch("https://raw.githubusercontent.com/millbj92/US-Zip-Codes-JSON/master/USCities.json");
        const data = await response.json();
        
        const TARGET_STATES = ["TX", "FL", "GA", "CO", "TN", "NC"];
        const results = [];
        const seen = new Set();
        
        for (const item of data) {
            // Depending on schema, could be item.state or item.state_code
            const state = item.state || item.state_code || item.state_id || item.State;
            const city = item.city || item.City;
            
            if (state && city && TARGET_STATES.includes(state.toUpperCase())) {
                const key = `${city.toLowerCase()}-${state.toUpperCase()}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    results.push({ city, state: state.toUpperCase() });
                }
            }
        }

        console.log(`✅ Extracted ${results.length} unique cities across ${TARGET_STATES.join(', ')}.`);
        fs.writeFileSync('./scripts/phase1-targets.json', JSON.stringify(results, null, 2));
        
    } catch (e) {
        console.error("Failed to fetch/parse JSON:", e.message);
    }
}

run();

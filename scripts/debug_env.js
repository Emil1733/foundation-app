const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');
console.log("Path:", envPath);

try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log("File content length:", content.length);
    console.log("First 50 chars:", content.substring(0, 50).replace(/\n/g, '\\n'));

    const parsed = dotenv.parse(content);
    console.log("Parsed Keys:", Object.keys(parsed));

    if (parsed.NEXT_PUBLIC_SUPABASE_URL) {
        console.log("URL found (length):", parsed.NEXT_PUBLIC_SUPABASE_URL.length);
    } else {
        console.log("URL MISSING");
    }
} catch (e) {
    console.error("Error reading file:", e.message);
}

console.log("1. Starting Sanity Check");
try {
    const fs = require('fs');
    console.log("2. FS Required");
    const path = require('path');
    console.log("3. Path Required");
    const dotenv = require('dotenv');
    console.log("4. Dotenv Required");
    const { createClient } = require('@supabase/supabase-js');
    console.log("5. Supabase Required");
} catch (e) {
    console.error("❌ CRTICAL FAILURE:", e);
}
console.log("6. Finished Sanity Check");

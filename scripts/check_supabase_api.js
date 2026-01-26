const https = require('https');

// The project ref is the part after 'db.' based on logs: 'sqhpdcbjvgdjjvznuoyw'
// Standard API URL: https://sqhpdcbjvgdjjvznuoyw.supabase.co
const projectId = 'sqhpdcbjvgdjjvznuoyw';
const url = `https://${projectId}.supabase.co/rest/v1/`;

console.log(`Testing API URL: ${url}`);

const req = https.request(url, { method: 'HEAD' }, (res) => {
    console.log(`Response Status: ${res.statusCode}`);
    if (res.statusCode === 401 || res.statusCode === 200 || res.statusCode === 404) {
        console.log("✅ API Endpoint is VALID (Project exists)");
    } else {
        console.log("❌ Unexpected Status (Project might not exist)");
    }
});

req.on('error', (e) => {
    console.error(`❌ Connection Error: ${e.message}`);
});

req.end();

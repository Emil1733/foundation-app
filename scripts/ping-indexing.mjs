const SITEMAP_URL = "https://foundationrisk.org/sitemap.xml";

const ENDPOINTS = [
    { name: "Google", url: `https://www.google.com/ping?sitemap=${SITEMAP_URL}` },
    { name: "Bing", url: `https://www.bing.com/ping?sitemap=${SITEMAP_URL}` }
];

async function pingSearchEngines() {
    console.log(`🚀 Pinging Search Engines to index: ${SITEMAP_URL}`);
    
    for (const endpoint of ENDPOINTS) {
        try {
            console.log(`\n📡 Pinging ${endpoint.name}...`);
            const response = await fetch(endpoint.url);
            if (response.ok) {
                console.log(`✅ Success! ${endpoint.name} received the ping and queued the crawl.`);
            } else {
                console.log(`⚠️ ${endpoint.name} returned status: ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ Error pinging ${endpoint.name}:`, error.message);
        }
    }
    
    console.log("\n🎯 Indexing API Ping Complete! Googlebot and Bingbot should arrive within 24-48 hours.");
}

pingSearchEngines();

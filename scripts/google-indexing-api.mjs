import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// 1. Initialize the Google Auth client using the downloaded JSON key
const KEY_PATH = "c:\\Users\\tevat\\nicheanalyzer\\gsc-credentials.json";

if (!fs.existsSync(KEY_PATH)) {
    console.error("❌ CRITICAL ERROR: 'credentials.json' not found.");
    console.error("Please generate a Service Account JSON key in Google Cloud Console and place it in the root directory.");
    process.exit(1);
}

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/indexing'],
});

async function requestIndexing(url) {
    const authClient = await auth.getClient();
    const indexing = google.indexing({ version: 'v3', auth: authClient });

    try {
        const response = await indexing.urlNotifications.publish({
            requestBody: {
                url: url,
                type: 'URL_UPDATED',
            },
        });
        console.log(`✅ SUCCESS [Google Indexing API]: ${url}`);
        return true;
    } catch (error) {
        console.error(`❌ FAILED [Google Indexing API] for ${url}:`, error.message);
        if (error.response && error.response.data) {
            console.error("Details:", error.response.data.error.message);
        }
        return false;
    }
}

async function run() {
    console.log("🚀 Authenticating with Google Cloud Service Account...");
    
    // We fetch the dynamic URLs from the local sitemap endpoint
    // Assuming the Next.js local server is running on port 3000
    try {
        const sitemapResponse = await fetch('http://localhost:3000/sitemap.xml');
        const sitemapText = await sitemapResponse.text();
        
        // Extract all URLs from the XML
        const urls = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
        
        console.log(`\n📡 Found ${urls.length} URLs in the sitemap. Pinging Google Indexing API...`);
        console.log("⚠️ Note: Google allows up to 200 API calls per day for URL_UPDATED.\n");

        for (const url of urls) {
            await requestIndexing(url);
            // Slight delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log("\n🎉 INDEXING API BATCH COMPLETE! Googlebot has been forcibly dispatched to these URLs.");
    } catch (err) {
        console.error("❌ Error fetching sitemap. Ensure your local server is running on port 3000.", err.message);
    }
}

run();

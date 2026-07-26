import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const KEY_PATH = 'c:\\Users\\tevat\\nicheanalyzer\\gsc-credentials.json';
const SITE_URL = 'sc-domain:foundationrisk.org'; // Or 'https://foundationrisk.org/' depending on GSC setup

if (!fs.existsSync(KEY_PATH)) {
    console.error("❌ CRITICAL ERROR: 'gsc-credentials.json' not found.");
    process.exit(1);
}

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});

async function run() {
    try {
        const authClient = await auth.getClient();
        const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
        
        // Date math for last 30 days
        const today = new Date();
        const endDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // GSC data is 2 days delayed
        const startDate = new Date(today.getTime() - 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        console.log(`📡 Fetching GSC data for ${SITE_URL} from ${startDate} to ${endDate} (USA only)`);

        // 1. Overall Stats
        const overallResponse = await searchconsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: startDate,
                endDate: endDate,
                dimensions: ['country'],
                dimensionFilterGroups: [{
                    filters: [{ dimension: 'country', operator: 'equals', expression: 'usa' }]
                }]
            }
        });

        // 2. Query Stats
        const queryResponse = await searchconsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: startDate,
                endDate: endDate,
                dimensions: ['query'],
                dimensionFilterGroups: [{
                    filters: [{ dimension: 'country', operator: 'equals', expression: 'usa' }]
                }],
                rowLimit: 20
            }
        });

        const report = {
            dateRange: `${startDate} to ${endDate}`,
            overall: overallResponse.data.rows ? overallResponse.data.rows[0] : { clicks: 0, impressions: 0, ctr: 0, position: 0 },
            topQueries: queryResponse.data.rows || []
        };

        fs.writeFileSync(path.resolve(process.cwd(), 'gsc-results.json'), JSON.stringify(report, null, 2));
        console.log("✅ Data successfully fetched and saved to gsc-results.json");

    } catch (err) {
        // Fallback to URL-prefix property if domain property fails
        if (err.message.includes('User does not have sufficient permission')) {
             console.log("⚠️ Domain property access failed, attempting URL-prefix property: https://foundationrisk.org/");
             try {
                const authClient = await auth.getClient();
                const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
                
                const today = new Date();
                const endDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; 
                const startDate = new Date(today.getTime() - 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
                const overallResponse = await searchconsole.searchanalytics.query({
                    siteUrl: 'https://foundationrisk.org/',
                    requestBody: {
                        startDate: startDate,
                        endDate: endDate,
                        dimensions: ['country'],
                        dimensionFilterGroups: [{
                            filters: [{ dimension: 'country', operator: 'equals', expression: 'usa' }]
                        }]
                    }
                });
        
                const queryResponse = await searchconsole.searchanalytics.query({
                    siteUrl: 'https://foundationrisk.org/',
                    requestBody: {
                        startDate: startDate,
                        endDate: endDate,
                        dimensions: ['query'],
                        dimensionFilterGroups: [{
                            filters: [{ dimension: 'country', operator: 'equals', expression: 'usa' }]
                        }],
                        rowLimit: 20
                    }
                });
        
                const report = {
                    dateRange: `${startDate} to ${endDate}`,
                    overall: overallResponse.data.rows ? overallResponse.data.rows[0] : { clicks: 0, impressions: 0, ctr: 0, position: 0 },
                    topQueries: queryResponse.data.rows || []
                };
        
                fs.writeFileSync(path.resolve(process.cwd(), 'gsc-results.json'), JSON.stringify(report, null, 2));
                console.log("✅ Data successfully fetched (via URL-prefix) and saved to gsc-results.json");
             } catch (e2) {
                 console.error("❌ Failed both domain and URL-prefix properties:", e2.message);
             }
        } else {
             console.error("❌ Error querying GSC API:", err.message);
        }
    }
}

run();

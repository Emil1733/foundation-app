import fs from 'fs';

const AUTH = "Basic dGV2YXRyb3N5YW4xMy4xN0BnbWFpbC5jb206ZGE4ODAwYzE1MzU5M2Q5Zg==";

const CITIES = [
    "Rowlett", "Forney", "Prosper", "Celina", "Sachse",
    "Rockwall", "Wylie", "Terrell", "Seagoville", "Crandall",
    "Red Oak", "Waxahachie", "Midlothian", "Burleson", "Crowley",
    "Mansfield", "Grand Prairie", "Duncanville", "DeSoto", "Cedar Hill",
    "Lancaster", "Ennis", "Greenville", "Royse City", "Fate",
    "Princeton", "Melissa", "Anna", "Sherman", "Denison",
    "Denton", "Corinth", "Argyle", "Flower Mound", "Lewisville",
    "Carrollton", "Coppell", "Grapevine", "Southlake", "Colleyville",
    "Keller", "Roanoke", "Haltom City", "Watauga", "Hurst",
    "Euless", "Bedford", "Saginaw", "Azle", "Weatherford"
];

const VARIATIONS = [
    "foundation repair {city}",
    "foundation crack repair {city}",
    "foundation inspection {city}",
    "fix foundation {city}"
];

// Generate exactly 200 keywords
const keywords = [];
for (const city of CITIES) {
    for (const v of VARIATIONS) {
        keywords.push(v.replace("{city}", city.toLowerCase()));
    }
}

async function runResearch() {
    console.log(`📡 Querying Google Ads API for Search Volume...`);

    const postData = [{
        "keywords": keywords,
        "location_name": "United States",
        "language_name": "English"
    }];

    try {
        // 1. Fetch Search Volume & CPC
        const volResponse = await fetch("https://api.dataforseo.com/v3/keywords_data/google/search_volume/live", {
            method: "POST",
            headers: { "Authorization": AUTH, "Content-Type": "application/json" },
            body: JSON.stringify(postData)
        });
        const volData = await volResponse.json();
        const volResults = volData.tasks[0].result || [];

        console.log(`📡 Querying DataForSEO Labs for true organic KD...`);

        // 2. Fetch True Organic Keyword Difficulty
        const kdResponse = await fetch("https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_keyword_difficulty/live", {
            method: "POST",
            headers: { "Authorization": AUTH, "Content-Type": "application/json" },
            body: JSON.stringify(postData)
        });
        const kdData = await kdResponse.json();
        const kdResults = kdData.tasks[0].result[0].items || [];

        // Map KD results for fast lookup
        const kdMap = {};
        for (const item of kdResults) {
            kdMap[item.keyword] = item.keyword_difficulty !== null ? item.keyword_difficulty : 0; // null means no difficulty registered
        }

        console.log("✅ Data successfully merged. Filtering for true KD < 25 and Volume > 0...\n");
        
        const winningKeywords = [];

        for (const item of volResults) {
            const kw = item.keyword;
            const sv = item.search_volume || 0;
            const cpc = item.cpc || 0;
            const kd = kdMap[kw] !== undefined ? kdMap[kw] : 100; // default high if not found

            // Our Arbitrage Filter
            if (sv > 0 && kd < 25) {
                winningKeywords.push({ keyword: kw, search_volume: sv, keyword_difficulty: kd, cpc: cpc });
            }
        }

        // Sort by highest volume, then lowest KD
        winningKeywords.sort((a, b) => b.search_volume - a.search_volume || a.keyword_difficulty - b.keyword_difficulty);

        let markdown = `# TRUE DFW Cluster Expansion Targets (Position 1-3 Arbitrage)\n\n`;
        markdown += `These keywords have been strictly filtered for true SEO **KD < 25** and **Volume > 0** using dual-API verification.\n\n`;
        markdown += `| Keyword | Search Volume | True SEO KD | CPC ($) |\n`;
        markdown += `| :--- | :--- | :--- | :--- |\n`;

        for (const w of winningKeywords) {
            markdown += `| \`${w.keyword}\` | ${w.search_volume} | **${w.keyword_difficulty}** | $${w.cpc} |\n`;
        }

        fs.writeFileSync('c:\\Users\\tevat\\nicheanalyzer\\foundation-app\\tier3-research.md', markdown);
        console.log(`🎯 Found ${winningKeywords.length} TRUE arbitrage targets! Saved to tier3-research.md`);
            
    } catch (e) {
        console.error("❌ Fetch Error:", e.message);
    }
}

runResearch();

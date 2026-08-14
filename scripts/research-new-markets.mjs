import fs from 'fs';

const AUTH = "Basic dGV2YXRyb3N5YW4xMy4xN0BnbWFpbC5jb206ZGE4ODAwYzE1MzU5M2Q5Zg==";

const NEW_MARKETS = {
    "Colorado Front Range (Bentonite Clay)": ["Denver", "Aurora", "Lakewood", "Thornton", "Arvada", "Westminster", "Centennial", "Boulder"],
    "Georgia Red Clay Belt": ["Atlanta", "Marietta", "Alpharetta", "Roswell", "Johns Creek", "Sandy Springs", "Smyrna", "Dunwoody"],
    "Tennessee Karst Zone": ["Nashville", "Murfreesboro", "Franklin", "Hendersonville", "Clarksville", "Spring Hill"],
    "Carolina Piedmont": ["Charlotte", "Raleigh", "Durham", "Cary", "Concord", "Gastonia"]
};

const VARIATIONS = [
    "foundation repair {city}",
    "foundation inspection {city}"
];

async function runResearch() {
    let markdown = `# Future Market Expansion Research\n\n`;

    for (const [clusterName, cities] of Object.entries(NEW_MARKETS)) {
        console.log(`📡 Querying DataForSEO for ${clusterName}...`);
        
        const keywords = [];
        for (const city of cities) {
            for (const v of VARIATIONS) {
                keywords.push(v.replace("{city}", city.toLowerCase()));
            }
        }

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
            
            console.log(`   ⏳ Pausing for 10 seconds to bypass Cloudflare WAF...`);
            await new Promise(r => setTimeout(r, 10000));

            // 2. Fetch True Organic Keyword Difficulty
            const kdResponse = await fetch("https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_keyword_difficulty/live", {
                method: "POST",
                headers: { "Authorization": AUTH, "Content-Type": "application/json" },
                body: JSON.stringify(postData)
            });
            const kdData = await kdResponse.json();
            
            const volResults = volData.tasks?.[0]?.result || [];
            const kdResults = kdData.tasks?.[0]?.result?.[0]?.items || [];

            const kdMap = {};
            for (const item of kdResults) {
                kdMap[item.keyword] = item.keyword_difficulty !== null ? item.keyword_difficulty : 0;
            }

            const winningKeywords = [];

            for (const item of volResults) {
                const kw = item.keyword;
                const sv = item.search_volume || 0;
                const cpc = item.cpc || 0;
                const kd = kdMap[kw] !== undefined ? kdMap[kw] : 100;

                if (sv > 0) {
                    winningKeywords.push({ keyword: kw, search_volume: sv, keyword_difficulty: kd, cpc: cpc });
                }
            }

            winningKeywords.sort((a, b) => a.keyword_difficulty - b.keyword_difficulty || b.search_volume - a.search_volume);

            markdown += `## ${clusterName}\n`;
            markdown += `| Keyword | Search Volume | True SEO KD | CPC ($) |\n`;
            markdown += `| :--- | :--- | :--- | :--- |\n`;

            if (winningKeywords.length === 0) {
                markdown += `| No targets found matching criteria | - | - | - |\n`;
            } else {
                for (const w of winningKeywords) {
                    const kdDisplay = w.keyword_difficulty === 0 ? `**${w.keyword_difficulty}** 🟢` : w.keyword_difficulty;
                    markdown += `| \`${w.keyword}\` | ${w.search_volume} | ${kdDisplay} | $${w.cpc} |\n`;
                }
            }
            markdown += `\n`;
            
            console.log(`✅ Found ${winningKeywords.length} targets for ${clusterName}`);
            
            console.log(`   ⏳ Pausing for 10 seconds before next cluster...`);
            await new Promise(r => setTimeout(r, 10000));
                
        } catch (e) {
            console.error(`❌ Fetch Error for ${clusterName}:`, e.message);
        }
    }

    fs.writeFileSync('c:\\Users\\tevat\\nicheanalyzer\\foundation-app\\future-markets.md', markdown);
    console.log(`\n🎉 New Market Research complete! Output saved to future-markets.md`);
}

runResearch();

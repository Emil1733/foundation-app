import fs from 'fs';

const AUTH = "Basic dGV2YXRyb3N5YW4xMy4xN0BnbWFpbC5jb206ZGE4ODAwYzE1MzU5M2Q5Zg==";

const CLUSTERS = {
    "San Antonio (Texas)": [
        "New Braunfels", "Schertz", "Boerne", "Seguin", "Cibolo", "Converse"
    ],
    "Denver Front Range (Colorado)": [
        "Littleton", "Centennial", "Highlands Ranch", "Parker", "Loveland", "Castle Rock"
    ],
    "Red Dirt (Oklahoma)": [
        "Edmond", "Norman", "Moore", "Broken Arrow", "Bixby", "Owasso"
    ],
    "Kansas City (MO/KS)": [
        "Overland Park", "Olathe", "Lee's Summit", "Liberty", "Blue Springs"
    ]
};

const VARIATIONS = [
    "foundation repair {city}",
    "foundation crack repair {city}",
    "foundation inspection {city}",
    "fix foundation {city}"
];

async function runResearch() {
    let markdown = `# National Expansion Arbitrage Targets (KD < 25)\n\n`;
    markdown += `These keywords represent the next geographical expansion phases, filtered for true SEO **KD < 25** and **Volume > 0** using dual-API verification via DataForSEO.\n\n`;

    for (const [clusterName, cities] of Object.entries(CLUSTERS)) {
        console.log(`📡 Querying APIs for ${clusterName}...`);
        
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
            const volResults = volData.tasks?.[0]?.result || [];

            // 2. Fetch True Organic Keyword Difficulty
            const kdResponse = await fetch("https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_keyword_difficulty/live", {
                method: "POST",
                headers: { "Authorization": AUTH, "Content-Type": "application/json" },
                body: JSON.stringify(postData)
            });
            const kdData = await kdResponse.json();
            const kdResults = kdData.tasks?.[0]?.result?.[0]?.items || [];

            // Map KD results
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

                if (sv > 0 && kd < 25) {
                    winningKeywords.push({ keyword: kw, search_volume: sv, keyword_difficulty: kd, cpc: cpc });
                }
            }

            winningKeywords.sort((a, b) => b.search_volume - a.search_volume || a.keyword_difficulty - b.keyword_difficulty);

            markdown += `## ${clusterName} Cluster\n`;
            markdown += `| Keyword | Search Volume | True SEO KD | CPC ($) |\n`;
            markdown += `| :--- | :--- | :--- | :--- |\n`;

            if (winningKeywords.length === 0) {
                markdown += `| No targets found matching criteria | - | - | - |\n`;
            } else {
                for (const w of winningKeywords) {
                    markdown += `| \`${w.keyword}\` | ${w.search_volume} | **${w.keyword_difficulty}** | $${w.cpc} |\n`;
                }
            }
            markdown += `\n`;
            
            console.log(`✅ Found ${winningKeywords.length} targets for ${clusterName}`);
                
        } catch (e) {
            console.error(`❌ Fetch Error for ${clusterName}:`, e.message);
        }
    }

    fs.writeFileSync('c:\\Users\\tevat\\nicheanalyzer\\foundation-app\\expansion-research.md', markdown);
    console.log(`\n🎉 Research complete! Output saved to expansion-research.md`);
}

runResearch();

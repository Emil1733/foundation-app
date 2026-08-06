import fs from 'fs';

const AUTH = "Basic dGV2YXRyb3N5YW4xMy4xN0BnbWFpbC5jb206ZGE4ODAwYzE1MzU5M2Q5Zg==";

const FLORIDA_CLUSTERS = {
    "Tampa Bay (Sinkhole Alley)": [
        "Tampa", "Clearwater", "St. Petersburg", "Spring Hill", "New Port Richey", "Port Richey", "Hudson", "Largo", "Pinellas Park", "Wesley Chapel"
    ],
    "Orlando (Central Florida Sinkholes)": [
        "Orlando", "Kissimmee", "Sanford", "Winter Park", "Altamonte Springs", "Apopka", "Ocoee", "Clermont"
    ],
    "Jacksonville (North FL Settlement)": [
        "Jacksonville", "St. Augustine", "Orange Park", "Middleburg", "Fernandina Beach", "Ponte Vedra Beach"
    ],
    "Miami / South FL (Muck & Peat Settlement)": [
        "Miami", "Fort Lauderdale", "Hialeah", "Pembroke Pines", "Hollywood", "Miramar", "Coral Springs", "Pompano Beach", "Davie", "Plantation"
    ]
};

// Florida requires some specific keywords along with the standard ones
const VARIATIONS = [
    "foundation repair {city}",
    "sinkhole repair {city}",
    "foundation crack repair {city}",
    "foundation inspection {city}"
];

async function runResearch() {
    let markdown = `# The Florida Sinkhole Project: Cluster-by-Cluster Research\n\n`;
    markdown += `Florida's geology is completely different from Texas or the Midwest. Instead of expansive clay, Florida sits on porous limestone (karst topography). When the water table drops, the limestone dissolves, creating massive underground voids that swallow homes (sinkholes). South Florida also suffers from settlement due to homes built on decomposing organic muck/peat.\n\n`;

    for (const [clusterName, cities] of Object.entries(FLORIDA_CLUSTERS)) {
        console.log(`🌴 Querying DataForSEO for ${clusterName}...`);
        
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

                // We want to see EVERYTHING in Florida that has volume, but sort by lowest KD first
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
                    // Highlight KD 0 targets
                    const kdDisplay = w.keyword_difficulty === 0 ? `**${w.keyword_difficulty}** 🟢` : w.keyword_difficulty;
                    markdown += `| \`${w.keyword}\` | ${w.search_volume} | ${kdDisplay} | $${w.cpc} |\n`;
                }
            }
            markdown += `\n`;
            
            console.log(`✅ Found ${winningKeywords.length} targets for ${clusterName}`);
                
        } catch (e) {
            console.error(`❌ Fetch Error for ${clusterName}:`, e.message);
        }
    }

    fs.writeFileSync('c:\\Users\\tevat\\nicheanalyzer\\foundation-app\\florida-research.md', markdown);
    console.log(`\n🎉 Florida Research complete! Output saved to florida-research.md`);
}

runResearch();

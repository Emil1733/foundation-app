import fs from 'fs';

const AUTH = "Basic dGV2YXRyb3N5YW4xMy4xN0BnbWFpbC5jb206ZGE4ODAwYzE1MzU5M2Q5Zg==";

async function testApi() {
    const postData = [{
        "keywords": ["foundation repair denton", "foundation crack repair rowlett"],
        "location_name": "United States",
        "language_name": "English"
    }];

    try {
        const response = await fetch("https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_keyword_difficulty/live", {
            method: "POST",
            headers: {
                "Authorization": AUTH,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(postData)
        });

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

testApi();

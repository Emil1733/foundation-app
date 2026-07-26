import fs from 'fs';

const AUTH = "Basic dGV2YXRyb3N5YW4xMy4xN0BnbWFpbC5jb206ZGE4ODAwYzE1MzU5M2Q5Zg==";

async function testApi() {
    const postData = [{
        "keywords": ["foundation repair denton"],
        "location_name": "United States",
        "language_name": "English"
    }];

    try {
        const response = await fetch("https://api.dataforseo.com/v3/keywords_data/google/search_volume/live", {
            method: "POST",
            headers: {
                "Authorization": AUTH,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(postData)
        });

        const data = await response.json();
        console.log(JSON.stringify(data.tasks[0].result[0], null, 2));
    } catch (e) {
        console.error(e);
    }
}

testApi();

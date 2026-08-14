import fetch from 'node-fetch';

async function stressTestBooking() {
    console.log("🚀 INITIATING SPAM DEFENSE STRESS TEST...");
    console.log("Target: POST /api/agent/book");
    console.log("Payload: 10 Concurrent Booking Requests from the same IP\n");

    const TARGET_URL = "http://localhost:3000/api/agent/book";
    const REQUESTS = 10;
    
    let successes = 0;
    let blocked = 0;
    let errors = 0;

    const promises = [];
    const payload = {
        name: "Spam Bot",
        phone: "555-0000",
        city: "Dallas",
        soil_symptoms: "TEST SPAM"
    };

    for (let i = 0; i < REQUESTS; i++) {
        // We pass the same IP in the header to simulate one malicious bot
        const req = fetch(TARGET_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-forwarded-for': '192.168.1.99',
                'User-Agent': 'Malicious_Bot/1.0'
            },
            body: JSON.stringify(payload)
        }).then(async (res) => {
            if (res.status === 200) {
                successes++;
            } else if (res.status === 429) {
                blocked++;
            } else {
                errors++;
            }
        }).catch(() => errors++);

        promises.push(req);
    }

    await Promise.all(promises);

    console.log("📊 SPAM DEFENSE RESULTS");
    console.log("------------------------");
    console.log(`Total Malicious Requests Sent: ${REQUESTS}`);
    console.log(`Successfully Inserted (Allowed): ${successes}`);
    console.log(`Blocked by Rate Limiter (HTTP 429): ${blocked}`);
    console.log(`Other Errors: ${errors}`);
    
    if (successes <= 3 && blocked === (REQUESTS - successes)) {
        console.log("\n🛡️ VERDICT: SHIELD ACTIVE. The rate limiter correctly stopped the attack after the 3rd request.");
    } else {
        console.log("\n⚠️ VERDICT: FAILURE. The rate limiter did not block the spam correctly.");
    }
}

stressTestBooking();

import fetch from 'node-fetch';

async function stressTest() {
    console.log("🚀 INITIATING AGENTIC STRESS TEST...");
    console.log("Target: HTTP Content Negotiation Bouncer & Supabase Read Replica");
    console.log("Payload: 200 Concurrent AI Agent Requests\n");

    const TARGET_URL = "http://localhost:3000/services/foundation-repair/dallas-tx";
    const REQUESTS = 200;
    
    let successes = 0;
    let failures = 0;
    const start = Date.now();

    const promises = [];

    for (let i = 0; i < REQUESTS; i++) {
        // Randomly simulate different types of AI agents
        const acceptHeader = i % 2 === 0 ? 'application/json' : 'text/markdown';
        
        const req = fetch(TARGET_URL, {
            method: 'GET',
            headers: { 'Accept': acceptHeader }
        }).then(async (res) => {
            if (res.ok) {
                successes++;
            } else {
                failures++;
            }
        }).catch(() => failures++);

        promises.push(req);
    }

    await Promise.all(promises);
    const end = Date.now();
    const duration = end - start;

    console.log("📊 STRESS TEST RESULTS");
    console.log("------------------------");
    console.log(`Total Requests: ${REQUESTS}`);
    console.log(`Successful Hits: ${successes}`);
    console.log(`Failed Hits: ${failures}`);
    console.log(`Total Time: ${duration} ms`);
    console.log(`Requests Per Second (RPS): ${Math.round((REQUESTS / duration) * 1000)}`);
    
    if (failures === 0) {
        console.log("\n✅ VERDICT: FLAWLESS. The Edge Middleware and Supabase successfully handled the concurrent flood without dropping a single packet.");
    } else {
        console.log("\n⚠️ VERDICT: SYSTEM STRESSED. Some requests failed under load.");
    }
}

stressTest();

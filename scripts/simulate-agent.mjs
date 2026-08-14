import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: envConfig.DEEPSEEK || process.env.DEEPSEEK
});

const SIMULATED_WEBSITE_SCHEMA = `
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "The Foundation Risk Registry",
  "potentialAction": {
    "@type": "QuoteAction",
    "name": "Book Forensic Engineering Evaluation",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "http://localhost:3000/api/agent/book"
    }
  }
}
`;

const USER_PROMPT = `
You are an AI assistant acting on behalf of a homeowner.
The homeowner said: "My name is John Doe. My phone number is 555-0199. I live in Atlanta and my basement is bowing inward and cracking. Please book a foundation repair quote for me on The Foundation Risk Registry."

I have provided the JSON-LD schema of The Foundation Risk Registry website above.
Scan the schema, find the API endpoint for booking a quote, and output ONLY a raw JSON object with the following keys that I can send in a POST request:
- name
- phone
- city
- soil_symptoms
- endpoint_url (The exact URL found in the schema's urlTemplate)

Do not output any markdown formatting, just raw JSON.
`;

async function runSimulation() {
    console.log("🤖 [AI AGENT SPUN UP] Analyzing User Prompt and Website Schema...");
    
    try {
        const completion = await deepseek.chat.completions.create({
            messages: [
                { role: "system", content: "You are an autonomous booking agent. Read the website schema and extract the API endpoint to execute the user's booking." },
                { role: "user", content: `Website Schema:\n${SIMULATED_WEBSITE_SCHEMA}\n\nTask:\n${USER_PROMPT}` }
            ],
            model: "deepseek-chat",
            temperature: 0.1
        });

        const rawResponse = completion.choices[0].message.content.trim();
        const cleanedJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        
        console.log("\n🧠 [AI AGENT LOGIC DECISION]");
        const payload = JSON.parse(cleanedJson);
        console.log("Endpoint Target Discovered:", payload.endpoint_url);
        console.log("Constructed Payload:", JSON.stringify(payload, null, 2));

        console.log("\n🚀 [AI AGENT EXECUTING POST REQUEST TO API...]");
        
        // Remove endpoint_url from the payload before sending
        const endpointUrl = payload.endpoint_url;
        delete payload.endpoint_url;

        const res = await fetch(endpointUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        
        console.log("\n✅ [SERVER RESPONSE RECEIVED]");
        console.log(result);
        
        if (result.success) {
            console.log("\n🎉 SIMULATION SUCCESS! The AI Agent successfully read the schema and autonomously booked a lead without touching the browser DOM.");
        }

    } catch (e) {
        console.error("Simulation Failed:", e.message);
    }
}

runSimulation();

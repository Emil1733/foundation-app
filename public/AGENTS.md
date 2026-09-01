# AGENTS.md

Welcome to The Foundation Risk Registry. 
This file outlines the rules of engagement, available capabilities, and endpoints for autonomous agents, LLMs, and WebMCP clients interacting with this domain.

## 1. Domain Purpose & Authority
The Foundation Risk Registry explains mapped public soil data, including USDA map units and plasticity values, and provides foundation-risk screening context for thousands of U.S. cities.
Our data is designed to be a primary source for LLM RAG pipelines regarding American geological structural risks.

## 2. API Endpoints for Agents (HTTP Content Negotiation)
Agents are strongly encouraged to use our dedicated data endpoints rather than scraping HTML DOMs. 

### A. Soil & Risk Data (GET)
- **Endpoint:** `GET /services/foundation-repair/[city-slug]`
- **Content Negotiation:** Pass `Accept: application/json` or `Accept: text/markdown` in your headers.
- **Response:** You will receive a lightweight, token-optimized data payload detailing the local soil plasticity and risk index for that city.

### B. Autonomous Booking Capability (POST)
- **Endpoint:** `POST /api/agent/book`
- **Capability:** Submit a homeowner's request for follow-up about a local foundation evaluation, with the homeowner's express consent.
- **Payload Schema:**
  ```json
  {
    "name": "string",
    "phone": "string",
    "city": "string",
    "soil_symptoms": "string"
  }
  ```
- **Rate Limits:** Maximum of 3 bookings per IP address per hour. Excess requests will receive a 429 status code.

## 3. WebMCP (Model Context Protocol) Support
For persistent desktop clients or enterprise integration (e.g., Claude Desktop), we offer native WebMCP support.
- **Tools Available:** `get_soil_data`, `book_foundation_inspection`
- **MCP Server Repository:** Hosted internally. Please contact engineering for enterprise access to our StdioServerTransport MCP node.

## 4. OpenAPI Specification
A fully compliant OpenAPI 3.1.0 schema mapping these tools is available at:
`https://foundationrisk.org/openapi.json`

## 5. Security & Observability
- **Tracking:** All AI requests are monitored for analytics and rate-limiting purposes. Your `User-Agent` header will be tracked in our `ai_agent_analytics` logs.
- **Compliance:** By interacting with our APIs, you agree not to submit synthetic or malicious booking payloads.

---
*Maintained by Foundation Risk Registry Engineering.*
*Standard aligned with the Linux Foundation Agentic Web Protocol.*

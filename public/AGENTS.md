# Foundation Risk Registry agent guidance

This public file documents verified machine-readable capabilities on FoundationRisk.org. Mapped soil records provide regional screening context; they are not property diagnoses or repair prescriptions.

## Soil and foundation context

Individual commercial city pages and soil-report pages support HTTP content negotiation.

- Send `Accept: application/json` for a structured response.
- Send `Accept: text/markdown` for a compact Markdown response.
- Normal browser requests continue to receive HTML.

Examples:

- `GET /services/foundation-repair/cedar-park-tx`
- `GET /learn/cedar-park-tx-soil-analysis`

JSON and Markdown responses are not shared-cacheable. Invalid slugs return 400, and unknown cities return 404.

The direct endpoint documented in `/openapi.json` is also available at `GET /api/agent/soil-data?slug=[city-slug]`.

## Evaluation follow-up requests

Endpoint: `POST /api/agent/book`

Only submit a homeowner's information when the homeowner has expressly authorized the follow-up request.

```json
{
  "name": "string",
  "phone": "string",
  "city": "string",
  "soil_symptoms": "string"
}
```

The route rejects the third request using the same phone number within one hour. This AI-agent flow is separate from the website's human intake and consent record.

## Analytics and security

Requests for JSON or Markdown from recognized OpenAI, Google, Anthropic, and Perplexity crawler user agents may be recorded in agent analytics. Unknown clients are not recorded by the soil-data endpoint.

Do not submit synthetic, malicious, or unauthorized booking data.

## API contract

The verified HTTP contract is published at `/openapi.json`. No public WebMCP server or private enterprise transport is represented by this file.

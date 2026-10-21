# Reliability improvements — October 20, 2026

## Rollout discipline

Work in bounded, independently verified batches. Do not call pending operational work complete, loosen consent, invent service-provider coverage, or mass-rewrite treatment content.

The Allen exact legacy redirect PR #2 was merged to production in `38894c8`. Deployment status succeeded; a live request to the historical URL with a campaign query returned 308 directly to the canonical Allen route with that query preserved.

## Batch 1: safe examples and credential guard

`.env.local.example` previously existed only as an ignored local file and included real local credentials. It was not tracked; no history for its path was found in fetched branches. A public repository does not by itself prove this file was published. The local example was replaced with placeholders, then explicitly allowed through `.gitignore` for safe version control. `.env.local` is still ignored and unchanged. No actual production credential was rotated. `scripts/check-secrets.cjs` checks tracked/nonignored working-tree text for service-role JWTs, secret API-key patterns, and private-key headers, emitting paths only. This is a targeted guard, not a complete historical secret scanner or proof no exposure ever occurred.

## Batch 2: soil widget, PDF and prefill privacy

- `lib/soilDisplay.ts` preserves missing, invalid and negative measurements as `Not reported`. Genuine zero remains `0.0` (or `0.0%`). The widget uses the shared nullable `UsdaSoilRecord` type and the same formatter in screen/PDF paths.
- Address edits clear previous lookup results so an old map record cannot be displayed/downloaded under a newly edited address. Same-event duplicate lookup attempts are locked with a ref; input is disabled during lookup.
- Client lookups have 15-second limits per stage; geocode and soil upstream requests have 12-second timeouts with 504 responses. A soil error offers a direct intake link so the optional tool does not block an enquiry. The geocoder no longer logs raw error objects that might include request URLs.
- New intake links contain only `source=soil_risk_widget`, never a property address. `lib/evaluationHandoff.ts` stores a bounded address in same-tab sessionStorage for at most 10 minutes, reads/removes it once, and tolerates corrupt, expired, future-dated and blocked storage. Without storage, users manually enter the address. Source attribution is preserved even without a prefill.
- Old links with an address query still prefill for compatibility; the current browser-history entry is cleaned after hydration. This cannot erase an already requested URL from old server logs or prior history. No claim of retroactive cleanup.
- Privacy text describes the optional prefill. No consent wording or required lead field changes.
- PDF labels use the same missing-value formatter, and address/map-unit text wraps. Numeric rows have additional vertical space. Synthetic sample generation and rendering are used for layout verification, not a homeowner record.
- Contact intro contrast was corrected with the existing light-on-dark palette. No design-system replacement.

Verification passed locally: widget/PDF/privacy regressions, mocked lookup-route tests, legacy redirect tests, credential guard, full lint and production build including TypeScript. The focused scripts passed again on October 21 before publication. CI runs the scripts and lint without production credentials; Vercel separately validates the deployment build. Desktop/mobile error recovery and legacy prefill cleanup were checked in the browser; a synthetic PDF was rendered and inspected. No synthetic production leads or external address lookups were used in testing. Physical iOS keyboard/zoom behavior remains untested.

Status: deployed October 21 through PR #3, production merge `dd9e34a`. Both GitHub regression jobs, lint and Vercel checks passed. Production deployment status is successful. Live privacy, widget and booking URLs returned 200; the privacy prefill disclosure and widget's private-handoff/missing-value code were present. Allen's old route still returned a direct 308 to its canonical route. No production lead or external address lookup was submitted during this verification. The October 20 publication attempt had been interrupted before commit/push by an approval-review usage limit; no deployment was claimed from that attempt. The public Nominatim provider remains unchanged. Timeouts and fallback do not resolve its shared usage/privacy requirements; a deliberate provider decision is still required.

## Remaining sequence (not silently skipped)

1. Human lead integrity: verify all writers and server credential availability, add atomic idempotency and durable rate limiting, then remove public insert bypasses with a migration and explicit failure-path tests. Do not revoke access first and break enquiries.
2. Agent intake: align validation, input bounds, error handling, consent/authorization evidence, and atomic limits before treating its records as equivalent to human-consented requests.
3. Operational alerts: recipient was supplied, but the user explicitly asked to skip email-service setup. No alert sender, provider or fabricated delivery promise is enabled.
4. Address provider: confirm an appropriate contracted/self-hosted service and privacy/usage terms. Do not add public Nominatim autocomplete or assume a per-instance timer enforces the provider's application-wide rate cap.
5. Service identity/cases: user has no verified provider details/assets yet. Preserve foundation-repair intent and existing truthful disclosures; do not invent credentials, crews, free visits, coverage, reviews or projects. Operator details and founding year also need verification.
6. Aggregate funnel events/outcomes, mobile field usability, CSP rollout and selective page-quality review remain separate measured batches. No visitor event collection, field removal, noindex rollout, treatment expansion or purchased links are introduced here.

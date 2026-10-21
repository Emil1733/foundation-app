# FoundationRisk Lead and Data Flow

## October 20 reliability batch

New soil-widget booking links transfer optional address prefill through read-once tab storage (10-minute TTL), not address query strings. Blocked/expired storage falls back to manual entry; old address-query links are still read and removed from the current history entry after hydration. No lead schema, consent or submission behavior is changed by this batch. Optional lookup failures now offer a direct intake path, and missing measurements remain explicitly missing in both widget and PDF. See `docs/RELIABILITY-2026-10-20.md` for verification and rollout status. Email alert setup was explicitly deferred by the user.

## 2026-10-15 attribution implementation

The city form explanation shipped in commit `e0cbe9c`. Both hero forms (including the homepage) and the full intake now attach optional first-landing attribution. `LandingAttribution` captures the first public path in the browser tab, a coarse referral category, and allow-listed `utm_source`, `utm_medium`, and `utm_campaign` labels. Session storage has a fixed 30-minute lifetime; an in-memory fallback handles blocked storage. Query strings, fragments, full referrer URLs, search terms, and form values are not collected by this feature. Campaign labels allow only 1-80 ASCII letters, digits, underscores, or hyphens.

`normalizeLeadAttribution()` revalidates browser data on the server. Invalid attribution is discarded without rejecting the lead. The server derives the cohort from the landing path and the current treatment registry, so client-supplied cohort labels are ignored. These are descriptive, user-editable measurements, not trusted proof of organic acquisition. A search referral may be paid; use the saved campaign medium to interpret it. Direct visits and missing referrers are combined as `direct_or_unknown`.

The nullable `leads.attribution` JSONB column was added with migration `20261015040733_add_lead_attribution.sql`; old rows remain null. Existing permissions and consent records were preserved. The privacy page describes collection. Do not append analytics to homeowner notes or rewrite `source`, which continues to identify the submission form. Qualification and appointment outcomes must be recorded from actual follow-up; all seven recent leads currently remain `new`.

GSC sitemap index resubmitted October 15 at 04:07 UTC; Google reported it pending, with no errors or warnings. Individual indexing requests require the Search Console interface; no generic indexing API is used for these service pages. Attribution shipped to production in `75aff9a`: the deployment status is successful, the live privacy disclosure is present, and the live service sitemap contains the October 15 release date. Local lint, production build, and mocked submission/storage-failure tests passed. No synthetic production lead was submitted; end-to-end attribution on a real submission remains unverified.

The October 15 policy inspection found public INSERT with `WITH CHECK (true)` and service-role ALL access; there is no public SELECT policy. The existing public-insert policy is a separate spam/validation-bypass hardening item, not a permission introduced by attribution. Do not revoke it without checking every submission client and testing the intended server-only flow.

Last reviewed: 2026-10-15

This document maps how public traffic becomes data, how soil data is retrieved, and where the application currently stores leads. Keep it updated when forms, APIs, tables, consent behavior, or external data sources change.

## 1. Primary human lead flow

### 2026-10-15 city form expectations

The shared city hero now explains the request sequence beside the form: provide the property concern, discuss evaluation options with a foundation professional who may call or text, and ask about availability, fees, and the visit before arranging an appointment. Sending the form records a request; it does not book a visit or commit the homeowner to repair work. No response deadline, free evaluation, assigned provider, or guaranteed appointment is promised. The existing provider contact consent remains visible and unchanged. This is shared conversion copy on all city pages, including experiment controls; account for that common intervention in subsequent cohort analysis. Submission, validation, data storage, metadata, and homepage form copy are unchanged by the copy-only commit. Status: deployed as `e0cbe9c`; production copy verified October 15. Optional attribution was added separately in `75aff9a`.

Public entry points such as commercial city pages and soil reports send users toward `/book-analysis`.

The booking form submits through the server action in `app/book-analysis/actions.ts`.

### Validation

Shared validation lives in `lib/leadValidation.ts`.

Current requirements include:
- name between 2 and 100 characters
- syntactically valid email
- valid 10-digit US phone number, normalized to `+1...`
- street address between 5 and 200 characters
- US ZIP or ZIP+4 format
- at least one allowed symptom
- notes capped at 2,000 characters
- explicit contact/TCPA consent

Allowed symptom identifiers are defined centrally in `ALLOWED_SYMPTOMS`.

Do not create a second independent form validator for the same human lead flow. Extend the shared validator when requirements change.

### Consent evidence

`app/book-analysis/actions.ts` records the consent state and supporting context with the lead, including:
- consent boolean
- consent timestamp
- consent version
- consent text
- source path
- user agent
- submission IP when a valid forwarded/real IP is available

Consent constants live in `lib/leadConsent.ts`.

If the displayed consent language changes, update the versioning system so historical records retain the language under which they were submitted.

### Storage

Human intake is inserted into the Supabase `leads` table.

Current source value: `web_intake`

Current initial status: `new`

The server action prefers `SUPABASE_SERVICE_ROLE_KEY` and falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` if the service key is unavailable.

Security note: The service-role key must remain server-only. Never expose it to a client component or browser bundle.

## 2. AI-agent lead flow

Route: `app/api/agent/book/route.ts`

This is separate from the normal human intake flow.

Current payload expects:
- name
- phone
- city
- optional `soil_symptoms`

Storage table: `ai_agent_leads`

The route attempts to classify the caller from its User-Agent and stores a source label such as ChatGPT, Google Gemini, Anthropic Claude, Apple Intelligence, or a generic agent label.

Rate limiting currently checks the database for the same phone number during the previous hour and rejects the third submission within that period.

Important audit concern: this endpoint does not currently share the human lead validation and consent model. Before treating AI-agent leads as equivalent to normal contact-consented leads, review the consent requirements and expected agent contract. Do not silently merge these tables/flows without resolving that distinction.

### Machine-readable soil context

Human-readable commercial and soil-report URLs also support explicit content negotiation:

- `Accept: application/json`
- `Accept: text/markdown`

`proxy.ts` applies this only to exact individual content URLs. It extracts the final path segment, then internally rewrites the request to `app/api/agent/soil-data/route.ts` with the slug as a query parameter. Soil-report slugs have the terminal `-soil-analysis` suffix removed before lookup.

The handler validates the slug, reads `target_locations` and associated `soil_cache` data with the anonymous Supabase client, and returns mapped screening context. It does not diagnose a property or prescribe a repair.

Representation safety boundaries:

- normal HTML continues through the page route and retains ISR caching;
- JSON and Markdown responses use `Cache-Control: private, no-store` and `Vary: Accept`;
- directory pages such as `/learn/page/2` are never treated as city records;
- malformed slugs return 400, unknown cities return 404, and unexpected data-provider failures return 503;
- the service-role key is not used for the public read.

Recognized OpenAI, Google, Anthropic, and Perplexity crawler user agents may be recorded in `ai_agent_analytics`. Unknown clients are not logged to that table. Logging is scheduled with Next.js `after()` so it can finish after the response without delaying the data response. The service-role client is restricted to this server-side analytics write.

## 3. Soil lookup API

Route: `app/api/soil/route.ts`

External source: USDA NRCS Soil Data Access tabular API.

The endpoint accepts latitude and longitude, validates that both can be converted to numbers, and constructs a Soil Data Access SQL query.

The query currently requests:
- map unit symbol
- map unit name
- component name
- component percentage
- linear extensibility/shrink-swell field (`lep_r`)
- plasticity index (`pi_r`)
- drainage class

It limits results to major components and horizons shallower than 50 cm, then selects the first returned data row.

Important interpretation rule: This endpoint provides mapped soil context at a coordinate. It does not prove the material directly beneath a foundation and must not be used by public copy as a property-specific engineering diagnosis.

Important technical audit item: verify whether selecting only the first returned horizon/component row is the intended representation for every downstream use. The SQL can return multiple rows, while the endpoint currently maps only `Table[1]` into the response.

## 4. Programmatic page data flow

### Commercial city page

`target_locations` -> associated `soil_cache` -> `app/services/foundation-repair/[city]/page.tsx`

Supporting derived data:
- `location_neighbors` -> nearby commercial links
- state code -> state foundation guide
- Texas coordinates -> Texas regional guide
- soil presence + GSC exception set -> index/noindex decision

### Soil report

slug -> `target_locations` -> location ID -> `soil_cache` -> `app/learn/[slug]/page.tsx`

Supporting derived data:
- `location_neighbors` -> nearby soil-report links
- state code -> state route/breadcrumb

## 5. Sitemap flow

`lib/sitemapData.ts` paginates through `target_locations` in batches for the sitemap route handlers.

Commercial URLs are filtered with `shouldIndexServicePage()`.

`app/sitemap.xml/route.ts` publishes the sitemap index. `app/sitemaps/[name]/route.ts` generates the core, service, and soil-report child sitemaps. Soil-report URLs require a usable soil record; commercial URLs use the shared service-page indexability rules.

## 6. Current tables observed from application code

The audit has directly observed references to:
- `target_locations`
- `soil_cache`
- `location_neighbors`
- `leads`
- `ai_agent_leads`
- `ai_agent_analytics`

This is not yet a complete Supabase schema. Do not assume undocumented columns, constraints, RLS policies, indexes, triggers, or other tables from this list alone.

## 7. Environment variables observed

The current code references:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Additional environment variables may exist elsewhere in the repository. This list should be expanded as the audit continues.

## 8. Change discipline

When modifying lead or data flows:
1. Identify every entry point using the flow.
2. Preserve server-only secrets.
3. Keep validation centralized where possible.
4. Preserve consent evidence and versioning.
5. Document database table/column assumptions.
6. Test failure behavior, not only successful submissions.
7. Confirm SEO pages still render when optional data is missing.
8. Update this document in the same change set.

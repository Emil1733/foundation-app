# FoundationRisk Lead and Data Flow

Last reviewed: 2026-09-17

This document maps how public traffic becomes data, how soil data is retrieved, and where the application currently stores leads. Keep it updated when forms, APIs, tables, consent behavior, or external data sources change.

## 1. Primary human lead flow

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

`app/sitemap.ts` paginates through `target_locations` in batches of 1,000.

Commercial URLs are filtered with `shouldIndexServicePage()`.

At the time of this audit, soil-report URLs are added for every returned target location, regardless of whether a usable soil record exists. This is an audit item. Before changing it, compare actual indexed/reporting behavior and determine whether missing-soil reports render useful content or zero/default values.

## 6. Current tables observed from application code

The audit has directly observed references to:
- `target_locations`
- `soil_cache`
- `location_neighbors`
- `leads`
- `ai_agent_leads`

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
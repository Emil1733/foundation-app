# FoundationRisk Project Map

Last reviewed: 2026-10-02

## Purpose

FoundationRisk.org is a programmatic foundation-risk, soil-context, and foundation-evaluation lead-generation application. The public content system combines location records, mapped USDA/NRCS soil context, educational tools, commercial city guides, and property-evaluation lead capture.

This document is the maintainer entry point. Detailed implementation decisions belong in the linked files under `docs/`.

## Start here

- `docs/AUDIT-FINDINGS-2026-09-17.md` - verified findings, completed fixes, unresolved risks
- `docs/SEO-EXPERIMENT-2026-09.md` - active Cedar Park-led commercial SEO experiment, controls, baseline, measurement rules
- `docs/LEAD-AND-DATA-FLOW.md` - lead validation, consent, storage, AI-agent flow, soil lookup, data-flow map

## Core architecture

### Commercial city pages

Route: `app/services/foundation-repair/[city]/page.tsx`

Data sources:
- `target_locations`
- associated `soil_cache`
- `location_neighbors`
- state/regional guidance helpers

Responsibilities:
- commercial foundation-repair intent
- warning signs and evaluation guidance
- mapped soil context as supporting evidence
- lead CTA
- internal links to soil reports and nearby commercial pages
- canonical/indexability metadata

The active treatment cohort is not scattered throughout JSX. City membership and treatment copy live in `lib/commercialSeoTreatments.ts`.

### Soil reports

Route: `app/learn/[slug]/page.tsx`

Purpose:
- capture informational soil/geology/foundation-risk queries
- explain mapped USDA/NRCS context and limitations
- feed relevant users into the matching commercial city guide

A soil report without a usable map-unit record should not be promoted as if it contains a real soil analysis.

### Indexability

`lib/serviceIndexability.ts` controls commercial-page indexability and preserves a documented GSC-protected exception set while missing soil records are repaired.

`app/sitemap.xml/route.ts` publishes the sitemap index. `app/sitemaps/[name]/route.ts` publishes the core, service, and soil-report child sitemaps. Commercial URLs use `shouldIndexServicePage()`, and soil-report URLs require usable soil data.

### Soil screening semantics

`lib/soilRisk.ts` is the shared application classifier and ZIP-display guard.

Current PI screening labels:
- >35 Severe
- >25 High
- >15 Moderate
- 0-15 Lower
- missing/invalid Not classified

These are registry screening labels, not property-specific structural diagnoses.

### Internal linking

`lib/nearbyLocations.ts` reads precomputed relationships from `location_neighbors`.

Commercial pages link to nearby commercial pages. Soil reports link prominently to the matching commercial guide. The intended funnel is documented in `docs/SEO-EXPERIMENT-2026-09.md`.

### Directory pagination and caching

Directory pagination uses path-based URLs so Next.js can cache the rendered HTML:

- `/learn` and `/learn/page/[page]`
- `/locations/[state]` and `/locations/[state]/page/[page]`

Legacy `?page=N` requests are normalized in `proxy.ts` with permanent redirects. Page 1 always canonicalizes to the base directory URL. Invalid and out-of-range pages return not found.

Current revalidation periods:

- education directory: one hour
- state directories: one week
- individual soil reports: one day
- individual commercial city pages: one week

Do not reintroduce server-side `searchParams` pagination on these directories. It opts the route into request-time rendering and bypasses the intended shared HTML cache.

City and soil-report data loaders use React request memoization where metadata and page rendering need the same Supabase record. This removes duplicate work within one render without caching leads or user-specific data.

### Machine-readable city representations

`proxy.ts` negotiates JSON or Markdown only for exact individual commercial and soil-report URLs. It rewrites those requests internally to `app/api/agent/soil-data/route.ts` with a validated city slug. Directory URLs are explicitly excluded.

Normal HTML remains ISR-cached. JSON and Markdown responses are `private, no-store` so an alternate representation cannot contaminate the HTML cache. Public location data is read with the anonymous Supabase client. The service-role client is used only for server-side analytics inserts and must never enter a browser bundle.

## Active SEO experiment

Primary readout: Cedar Park, TX.

Initial treatment cohort:
- Cedar Park
- Allen
- Schertz
- Boerne
- Lewisville

GSC-selected second wave added 2026-10-02:
- Katy
- Cypress
- Cleburne
- Sugar Land
- Mesquite
- Fort Gaines
- Ellaville

Directional controls:
- Frisco
- Richardson
- Pflugerville
- Carrollton
- Denton

Do not expand either treatment wave without reviewing fresh GSC data and updating the experiment document. Preserve the five directional controls until the initial experiment has a clean readout.

## Data integrity rules

1. Never invent geographic, soil, drainage, engineering, credential, contractor, or risk facts.
2. Randomization is acceptable only for harmless presentation variation.
3. Mapped soil data is context, not a property diagnosis.
4. Missing values remain missing rather than receiving scientific-looking fallback values.
5. Placeholder ZIP values such as `00000` must not appear in public copy.
6. Do not claim Foundation Risk Registry directly provides repair services unless the real operating relationship is verified and documented.
7. Do not present one repair system as universally correct from mapped data alone.

## Lead flow

Human evaluation requests use `/book-analysis` and shared validation in `lib/leadValidation.ts`, with consent evidence stored alongside the lead.

AI-agent booking is a separate flow under `app/api/agent/book/route.ts` and should not be treated as equivalent to the human consented lead flow without a deliberate consent/contract decision.

See `docs/LEAD-AND-DATA-FLOW.md` for details.

## Ingestion

Primary observed ingestion paths:
- `scripts/add-city.mjs`
- `app/api/admin/ingest/route.ts`
- `app/api/soil/route.ts`

The admin endpoint must fail closed if `ADMIN_SECRET` is absent. The CLI no longer invents neighborhood risk labels or fallback neighborhood claims.

## Known unresolved items

- USDA Soil Data Access queries can return multiple component/horizon rows, while current ingestion selects the first ordered data row. Verify the intended scientific representation before database-wide recalculation.
- Historical database rows may contain neighborhood metadata created by the old randomized/fallback logic. Audit before using those fields publicly.
- Build/type/lint verification still needs to be recorded before the implementation PR is merged.
- Post-deployment GSC measurement is required before expanding the commercial treatment cohort.
- The 2026-10-02 pagination/cache and content-negotiation changes are locally verified but not deployed until their commit reaches the production branch and live headers are rechecked.

## Working method

For SEO/code changes:
1. Work on a branch and PR.
2. Record why the change exists.
3. Separate treatment cohorts from controls when testing ranking/CTR changes.
4. Avoid broad page-count expansion while existing near-page-one URLs are the higher-leverage opportunity.
5. Update the relevant `docs/` file in the same change set.
6. Run verification before merge.
7. Measure with fresh GSC data before scaling a successful treatment.

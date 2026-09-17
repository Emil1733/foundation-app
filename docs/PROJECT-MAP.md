# FoundationRisk Project Map

Last reviewed: 2026-09-17

## Purpose

This document is the starting point for anyone working on FoundationRisk.org. It records where important systems live, how they relate, and which areas require care before changing them.

FoundationRisk is a programmatic SEO and lead-generation application focused on foundation risk, soil context, foundation evaluation, and foundation-repair search intent. The application uses Next.js App Router, Supabase-backed location/soil data, ISR, dynamic city service pages, dynamic soil-report pages, internal linking, diagnostic tools, and lead-capture flows.

## Core architecture

### Commercial city pages

Route: `app/services/foundation-repair/[city]/page.tsx`

Purpose: Primary commercial-intent landing pages for searches such as `foundation repair cedar park tx`.

Data source: `target_locations` joined with `soil_cache` in Supabase.

Important dependencies:
- `lib/nearbyLocations.ts`
- `lib/serviceIndexability.ts`
- `lib/stateFoundationGuides.ts`
- `lib/texasFoundationGuides.ts`
- `lib/stateRoutes.ts`
- `components/SoilRiskWidget`
- `components/TrustBadges`
- `components/FoundationDiagram`
- `components/SoilActionPlan`
- `components/CrackAnalyzer`
- `components/CostEstimator`

Rendering: On-demand ISR. Current revalidation interval is 604800 seconds (7 days).

SEO behavior:
- Dynamic title and meta description
- Self-referencing canonical
- Conditional noindex through `shouldIndexServicePage`
- Organization, Service, FAQPage and BreadcrumbList structured data
- Links to corresponding soil report
- Links to six precomputed nearby locations

### Soil reports

Route: `app/learn/[slug]/page.tsx`

Purpose: Informational/topical-authority pages built around mapped USDA/NRCS SSURGO soil context. These pages can attract informational long-tail traffic and support commercial city pages.

Data source: `target_locations`, then `soil_cache` fetched by location ID.

Rendering: On-demand ISR. Current revalidation interval is 86400 seconds (24 hours).

SEO behavior:
- Dynamic title and description
- Self-referencing canonical
- Article and BreadcrumbList structured data
- Breadcrumb link back to corresponding foundation-repair city page
- Nearby soil-report links
- Lead/evaluation CTA and diagnostic links

Important principle: Mapped soil data is screening/context data. It must not be presented as a property-specific diagnosis or repair prescription.

## Indexability system

File: `lib/serviceIndexability.ts`

`hasUsableSoilRecord()` determines whether a service page has a meaningful mapped soil name.

`shouldIndexServicePage()` allows pages with usable soil records to index. It also maintains a GSC-protected exception set for pages that had impressions/clicks despite missing soil data as of the documented GSC snapshot.

Do not casually remove the GSC exception set. It exists to avoid noindexing URLs already receiving search visibility while their data is repaired.

## Internal linking

File: `lib/nearbyLocations.ts`

Nearby links are not calculated dynamically from the entire locations table on each request. They are read from the precomputed `location_neighbors` relationship table, then resolved against `target_locations`.

Default limit: 6 neighbors.

Cross-state links are retained only within 50 miles. Same-state relationships are permitted at greater stored distances.

Commercial city pages link to nearby commercial pages and their matching soil report. Soil reports link to nearby soil reports and link back to their matching commercial page in the breadcrumb hierarchy.

Future SEO work should strengthen contextual links from successful soil reports to their corresponding commercial city pages without turning informational reports into repetitive link blocks.

## Current SEO experiment direction

GSC data reviewed on 2026-09-17 shows multiple Texas commercial pages near page-one/top-10 thresholds. Cedar Park is the first proposed controlled optimization target because it has substantial commercial-query impressions while averaging approximately position 10-11 with almost no clicks.

The intended strategy is NOT to manually fork hundreds of city pages.

Planned architecture:
1. Keep one strong scalable base city template.
2. Preserve regional/state guidance.
3. Add a documented priority-city override layer for GSC-proven opportunities.
4. Test changes on a small treatment group while leaving comparable cities as controls.
5. Promote additional cities only after evidence supports the treatment.

Potential first treatment cities from the September 2026 GSC review:
- Cedar Park, TX
- Allen, TX
- Schertz, TX
- Boerne, TX
- Lewisville, TX

These are research priorities, not permanent hard-coded business rules. Any implementation must document why a city was promoted and the GSC snapshot supporting it.

## Known audit items

### Commercial intent hierarchy

The city template currently emphasizes evaluation and mapped soil context very early. For priority commercial pages, test a more direct foundation-repair H1/problem/CTA hierarchy while keeping soil science as the differentiating evidence layer.

### Structured data

The commercial template currently uses `Service` structured data with Foundation Risk Registry as provider. Confirm that this accurately reflects the operating model before retaining that relationship. Structured data should not imply that Foundation Risk Registry directly performs repair work if it does not.

### Data-quality guards

Location data can contain placeholder or incomplete values. Template-level validation should prevent values such as ZIP `00000`, undefined/null labels, or unusable soil values from appearing in public copy.

### Legacy/stale pages

Live/search-visible URLs have shown older copy that is not present in the current dynamic template. Investigate deployment/ISR/cache/history before assuming the current source file is responsible. Do not reintroduce unsupported engineering, licensing, accreditation, warranty, or permanence claims.

### ISR consistency

Commercial pages currently revalidate every 7 days while soil reports revalidate every 24 hours. Determine whether this is intentional and document the reason before changing either interval.

## Safety and content rules

Do not infer a property-specific foundation diagnosis from mapped soil data.

Do not claim professional-engineer review, licensure, BBB accreditation, warranties, permanent repair outcomes, or contractor capabilities unless the claim is current, verifiable, and actually applies to the entity represented on the page.

Do not invent local facts merely to make programmatic pages appear unique. City-specific content should come from defensible data, documented regional logic, or genuinely city-specific research.

## Working method for SEO changes

For significant SEO changes:
1. Record the observed problem and evidence.
2. Identify treatment and control pages.
3. Document the hypothesis.
4. Make the smallest coherent code change.
5. Verify rendering, metadata, structured data, indexing behavior, internal links and lead flow.
6. Record deployment date.
7. Compare GSC performance after enough impressions accumulate.
8. Record the result before rolling the treatment out broadly.

## Files still being mapped

This project map is intentionally iterative. The next audit should document:
- sitemap generation
- robots rules
- location/state hub architecture
- lead form and API flow
- consent and validation
- Supabase schema assumptions
- address lookup
- diagnostic quiz
- trust components
- cost estimator assumptions
- state and Texas regional guidance
- deployment/build configuration
- historical migrations/scripts that populate location and neighbor data

Update this file whenever a core architectural assumption changes.
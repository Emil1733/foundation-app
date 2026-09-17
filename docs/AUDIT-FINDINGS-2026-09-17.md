# FoundationRisk Audit Findings - 2026-09-17

Status: Active implementation audit

This file records concrete findings from the September 17, 2026 code and GSC review. It separates verified code behavior from implemented changes and unresolved follow-up so future work does not have to rediscover the reasoning.

## Search performance context

The reviewed GSC export covered 2026-06-16 through 2026-09-15 and showed 145 clicks from 20,625 impressions. Search visibility improved materially through the period, with the September snapshot averaging roughly position 10.8.

The immediate strategy is therefore to improve already-visible commercial URLs rather than multiply the page count indiscriminately.

Priority treatment cohort:
- Cedar Park
- Allen
- Schertz
- Boerne
- Lewisville

Directional controls:
- Frisco
- Richardson
- Pflugerville
- Carrollton
- Denton

Cedar Park is the primary experiment because its commercial service URL and core foundation-repair queries were clustering around positions 10-11 while producing almost no clicks.

The full baseline, treatment rules, controls, and measurement plan are in `docs/SEO-EXPERIMENT-2026-09.md`.

## Finding 1 - Sitemap exposed fallback-only soil reports

Verified behavior before change:
- commercial URLs were filtered through `shouldIndexServicePage()`
- soil-report URLs were generated for every target location
- the soil-report template can render fallback labels when a soil record is missing

Risk:
The sitemap could actively advertise informational pages whose core differentiating dataset is absent.

Implemented:
`app/sitemap.ts` now requires a usable soil record before a soil-report URL is included in the sitemap.

The existing GSC-protected exceptions apply to commercial service pages. They are not automatically applied to soil reports because a soil report without soil data lacks its central informational payload.

## Finding 2 - City ingestion contained fabricated neighborhood risk labels

Verified before change in `scripts/add-city.mjs`:
- real neighborhood names were queried from OpenStreetMap/Overpass
- each returned neighborhood was assigned a random risk of High, Severe, or Moderate
- when no neighborhoods were returned, the script invented names such as `Central CITY`, `CITY Heights`, and `North CITY`
- fallback notes invented statements such as `Historic downtown zone`, `Elevated terrain`, and `Proximity to creek basins`

Implemented:
- randomized neighborhood risk labels were removed
- fabricated fallback neighborhoods were removed
- the script stores sourced OSM place names only
- when none are available, it stores an empty list
- missing USDA component/drainage values are no longer replaced with invented descriptive defaults

Follow-up:
Existing database rows created by the old script may still contain fabricated neighborhood metadata. Do not use those historical risk labels as evidence until the affected records are identified and rebuilt or cleaned.

## Finding 3 - USDA ingestion keeps only the first returned row

The public soil API, admin ingestion endpoint, and `scripts/add-city.mjs` use closely related USDA Soil Data Access queries.

Those queries can return multiple major-component/horizon rows. Current code maps only `Table[1]`, the first returned data row, into the cached soil representation.

Because the query orders by component percentage descending and horizon depth ascending, this appears intended to approximate the dominant component's shallowest returned horizon. However, this assumption is not explicitly modeled or documented in the data itself.

Unresolved follow-up:
- verify the interpretation against representative cities
- decide whether the product wants dominant-component top-horizon data, an aggregate, or a richer horizon representation
- document that choice before changing historical soil records

Do not silently recalculate the whole database until this decision is made because it could change indexed page content at scale.

## Finding 4 - Inconsistent risk thresholds

Verified before change:
- ingestion used PI >35 Severe, >25 High, otherwise Moderate
- soil-report/display code used different boundaries around >25 and >15

Implemented:
`lib/soilRisk.ts` now defines one registry screening classifier:
- PI >35: Severe
- PI >25: High
- PI >15: Moderate
- PI >=0 through 15: Lower
- missing/invalid: Not classified

The admin ingestion path and commercial rendering use the shared classifier. The standalone CLI mirrors the same thresholds because it executes directly as Node ESM outside the Next.js TypeScript import path.

Follow-up:
Continue migrating any remaining display-only threshold logic to the shared semantics. All public language must describe these labels as mapped screening context, not property-specific structural diagnosis.

## Finding 5 - Admin ingest security default

Verified before change:
`app/api/admin/ingest/route.ts` fell back to the literal admin secret `changeme` when `ADMIN_SECRET` was absent and returned environment/debug information in responses.

Implemented:
- missing `ADMIN_SECRET` now disables ingestion with a server error
- missing Supabase admin configuration also fails closed
- unauthorized responses no longer expose configuration/debug state
- basic target validation was added before ingestion

## Finding 6 - Historical contributor route is neutralized

The repository still contains `app/about/elias-thorne/page.tsx`, but the route performs a permanent redirect to `/about`. It does not currently render the old contributor profile.

Keep this redirect unless there is a verified reason to restore the old page.

## Finding 7 - Texas regional guidance is deterministic but approximate

`lib/texasFoundationGuides.ts` chooses one of six broad Texas guidance regions using latitude/longitude boundaries.

This is substantially better than generating random city-specific geology copy. However, these are application-defined geographic heuristics, not authoritative GIS polygon boundaries.

Use the guidance as regional educational context. Do not phrase the selected region as a surveyed property-level classification.

## Finding 8 - Trust badges are descriptive, not credential badges

`components/TrustBadges.tsx` displays descriptive concepts such as Property-Specific Review, Repair Options, Informed Decisions, and USDA Soil Context.

This is safer than accreditation/licensing-style trust claims. Preserve this direction unless a credential is independently verified and genuinely belongs to the represented entity.

## Finding 9 - Commercial schema overstated the provider relationship

Verified before change:
The commercial city template represented Foundation Risk Registry as the `provider` in `Service` structured data for `Foundation Repair`.

Implemented:
The commercial template now describes the URL as a `WebPage` about foundation repair, with Organization, FAQPage, and BreadcrumbList entities. It no longer declares Foundation Risk Registry to be the direct foundation-repair provider.

Do not restore direct provider/service assertions unless the real-world operating relationship is verified and documented.

## Finding 10 - Placeholder ZIP could reach public copy

Verified before change:
The city page directly rendered `USDA/NRCS soil screening record for ZIP ${location.zip_code}`, allowing placeholder values such as `00000` to appear publicly.

Implemented:
`hasDisplayableZip()` in `lib/soilRisk.ts` validates ZIP display values. Invalid or all-zero placeholders are replaced in visible copy by a location-level USDA/NRCS context statement.

## Finding 11 - Repair diagram made an unsupported prescriptive comparison

Verified before change in `components/FoundationDiagram.tsx`:
- heading: `Why Shallow Repairs Fail vs. Our Solution`
- one system was presented as a failed method
- a deep steel pier was labeled `The Fix`

This was too prescriptive for a site whose verified role is information/evaluation/lead generation and could imply that one repair system is universally correct.

Implemented:
The component now explains a neutral three-step scope process: measure movement, identify contributors, and compare repair scopes. It explicitly states that mapped soil data cannot determine a property-specific repair system or depth.

## Finding 12 - Commercial intent was secondary in the hero

Verified before change:
The commercial template led with `Local Soil Context` and `Foundation Repair Evaluation & Options`. GSC, however, showed strong impressions for direct commercial queries such as `cedar park foundation repair`.

Implemented as a controlled experiment:
`lib/commercialSeoTreatments.ts` contains the five treatment slugs. Only those pages receive the commercial-first metadata and hero treatment. The rest of the programmatic template remains a control-like baseline.

Treatment pages now:
- lead title/H1 with Foundation Repair plus city/state
- lead hero copy with homeowner symptoms and evaluation intent
- retain soil data as supporting evidence rather than the primary product
- retain a cautious evaluation CTA

See `docs/SEO-EXPERIMENT-2026-09.md` before changing treatment membership.

## Implementation status

Completed in the implementation branch:
1. Remove unsafe/fabricated neighborhood data-generation behavior.
2. Add template guard for placeholder ZIP values.
3. Align soil-report sitemap inclusion with real data availability.
4. Establish shared soil screening classification semantics.
5. Correct commercial structured data to the verified operating model.
6. Add GSC-driven priority-city treatment architecture.
7. Launch Cedar Park plus four treatment peers while preserving controls.
8. Replace the prescriptive repair-system diagram.
9. Document the experiment and audit decisions.

Still to verify/follow up:
1. Migrate remaining standalone soil-report threshold logic to the shared classifier.
2. Add a stronger contextual soil-report-to-commercial-page link beyond breadcrumbs.
3. Verify the USDA first-row interpretation before any database-wide recalculation.
4. Audit historical database neighborhood metadata created by the old script.
5. Run build/type/lint checks in an environment with repository dependencies and record results before merge.
6. Review fresh GSC data 4-8 weeks after deployment before expanding the treatment cohort.

## Rule for future audits

A generated fact must have a traceable source or deterministic documented derivation. Randomization may be used for harmless presentation variation, but never for geographic, scientific, risk, credential, contractor, engineering, or property claims.
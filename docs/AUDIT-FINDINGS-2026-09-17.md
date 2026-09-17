# FoundationRisk Audit Findings - 2026-09-17

Status: Active implementation audit

This file records concrete findings from the September 17, 2026 code and GSC review. It separates verified code behavior from proposed changes so future work does not have to rediscover the reasoning.

## Search performance context

The reviewed GSC export covered 2026-06-16 through 2026-09-15 and showed 145 clicks from 20,625 impressions. Search visibility improved materially through the period, with the September snapshot averaging roughly position 10.8.

The immediate strategy is therefore to improve already-visible commercial URLs rather than multiply the page count indiscriminately.

Priority treatment candidates identified from the GSC snapshot:
- Cedar Park
- Allen
- Schertz
- Boerne
- Lewisville

Candidate controls:
- Frisco
- Richardson
- Pflugerville
- Carrollton
- Denton

Cedar Park is the clearest first experiment because its commercial service URL and core foundation-repair queries are already clustering around positions 10-11 while producing almost no clicks.

## Finding 1 - Sitemap exposed fallback-only soil reports

Verified behavior before change:
- commercial URLs were filtered through `shouldIndexServicePage()`
- soil-report URLs were generated for every target location
- the soil-report template can render fallback labels when a soil record is missing

Risk:
The sitemap could actively advertise informational pages whose core differentiating dataset is absent.

Implemented on `seo-foundation-implementation`:
`app/sitemap.ts` now requires `hasUsableSoilRecord()` before a soil-report URL is included in the sitemap.

Important distinction:
The existing GSC-protected exceptions apply to commercial service pages. They are not automatically applied to soil reports because a soil report without soil data lacks its central informational payload.

## Finding 2 - City ingestion contains fabricated neighborhood risk labels

Verified in `scripts/add-city.mjs`:
- real neighborhood names are queried from OpenStreetMap/Overpass
- each returned neighborhood is assigned a random risk of High, Severe, or Moderate
- when no neighborhoods are returned, the script invents names such as `Central CITY`, `CITY Heights`, and `North CITY`
- the fallback also invents notes such as `Historic downtown zone`, `Elevated terrain`, and `Proximity to creek basins`

This is not acceptable as a production data-generation method.

The neighborhood name can be real while the associated risk is fabricated. That makes the record look more authoritative than it is.

Required remediation:
1. Stop assigning random neighborhood foundation-risk labels.
2. Do not invent fallback neighborhood names or geographic claims.
3. If neighborhood-level risk is desired later, calculate it from a documented spatial soil/risk method.
4. Until such a method exists, store neighborhood names only or omit the neighborhood section when no defensible data exists.

Do not use existing neighborhood risk labels as evidence in SEO copy until the stored records are audited/rebuilt.

## Finding 3 - USDA ingestion keeps only the first returned row

The public soil API, admin ingestion endpoint, and `scripts/add-city.mjs` use closely related USDA Soil Data Access queries.

Those queries can return multiple major-component/horizon rows. Current code maps only `Table[1]`, the first returned data row, into the cached soil representation.

Because the query orders by component percentage descending and horizon depth ascending, this appears intended to approximate the dominant component's shallowest returned horizon. However, this assumption is not explicitly modeled or documented in the data itself.

Required follow-up:
- verify the interpretation against representative cities
- decide whether the product wants dominant-component top-horizon data, an aggregate, or a richer horizon representation
- document that choice before changing historical soil records

Do not silently recalculate the whole database until this decision is made because it could change indexed page content at scale.

## Finding 4 - Inconsistent risk thresholds

The ingestion code currently labels risk from plasticity index approximately as:
- PI > 35: Severe
- PI > 25: High
- otherwise: Moderate

The soil-report template has used a different display interpretation around >25 high and >15 moderate, otherwise lower.

This means risk terminology can vary depending on which code path produced or displayed the value.

Required remediation:
Create one documented soil-risk classification function and use it everywhere. Before doing that, confirm the intended scientific/product meaning of the thresholds. Risk labels should be framed as screening context rather than a property-specific structural risk diagnosis.

## Finding 5 - Admin ingest security default

`app/api/admin/ingest/route.ts` currently falls back to the literal admin secret `changeme` when `ADMIN_SECRET` is absent.

That is an unsafe production default. A missing secret should disable the endpoint or fail closed, never establish a known fallback credential.

The endpoint also returns configuration/debug information to unauthorized requests, including whether the service key exists and whether the supplied secret matched. This should be reduced during security cleanup.

## Finding 6 - Historical contributor route is neutralized

The repository still contains `app/about/elias-thorne/page.tsx`, but the route now performs a permanent redirect to `/about`. It does not currently render the old contributor profile.

Keep this redirect unless there is a verified reason to restore the old page.

## Finding 7 - Texas regional guidance is deterministic but approximate

`lib/texasFoundationGuides.ts` chooses one of six broad Texas guidance regions using latitude/longitude boundaries.

This is substantially better than generating random city-specific geology copy. However, these are application-defined geographic heuristics, not authoritative GIS polygon boundaries.

Use the guidance as regional educational context. Do not phrase the selected region as a surveyed property-level classification.

## Finding 8 - Trust badges are currently descriptive, not credential badges

`components/TrustBadges.tsx` currently displays:
- Property-Specific Review
- Repair Options
- Informed Decisions
- USDA Soil Context

This is safer than prior accreditation/licensing-style trust claims. Preserve this direction unless a credential is independently verified and genuinely belongs to the represented entity.

## Finding 9 - Commercial schema provider relationship needs review

The commercial city template represents Foundation Risk Registry as the provider in `Service` structured data for `Foundation Repair`.

If Foundation Risk Registry is a lead-generation/evaluation platform rather than the company directly performing repairs, that relationship can overstate the operating model.

Required remediation:
Align structured data with what the site actually does. Do not use schema to imply direct contractor services that the organization does not provide.

## Implementation order

1. Remove unsafe/fabricated data-generation behavior.
2. Add template guards for placeholder ZIP/data values.
3. Align soil-report indexability with real data availability.
4. Normalize risk classification semantics.
5. Correct structured data to the real operating model.
6. Add GSC-driven priority-city override architecture.
7. Run Cedar Park as the first commercial SEO treatment.
8. Preserve controls.
9. Measure before broad rollout.

## Rule for future audits

A generated fact must have a traceable source or deterministic documented derivation. Randomization may be used for harmless presentation variation, but never for geographic, scientific, risk, credential, contractor, engineering, or property claims.
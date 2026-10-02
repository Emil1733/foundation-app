# FoundationRisk Audit Findings - 2026-09-17

Status: Active implementation audit

This file records concrete findings from the September 17, 2026 code and GSC review. It separates verified code behavior from implemented changes and unresolved follow-up so future work does not have to rediscover the reasoning.

## Search performance context

The reviewed GSC export covered 2026-06-16 through 2026-09-15 and showed 145 clicks from 20,625 impressions. Search visibility improved materially through the period, with the September snapshot averaging roughly position 10.8.

The immediate strategy is to improve already-visible commercial URLs rather than multiply page count indiscriminately.

Priority treatment cohort: Cedar Park, Allen, Schertz, Boerne, Lewisville.
Directional controls: Frisco, Richardson, Pflugerville, Carrollton, Denton.

Cedar Park is the primary experiment because its commercial service URL and core foundation-repair queries were clustering around positions 10-11 while producing almost no clicks. Full baseline and measurement rules are in `docs/SEO-EXPERIMENT-2026-09.md`.

## Finding 1 - Sitemap exposed fallback-only soil reports

Before change, commercial URLs were filtered through `shouldIndexServicePage()` but soil-report URLs were generated for every target location.

Implemented: `app/sitemaps/[name]/route.ts` now requires a usable soil record before a soil-report URL is included in the soil-report child sitemap.

## Finding 2 - City ingestion contained fabricated neighborhood risk labels

Before change, `scripts/add-city.mjs` queried real neighborhood names but randomly assigned risk labels. When no neighborhoods were returned, it invented names and geographic notes.

Implemented:
- randomized neighborhood risk labels removed
- fabricated fallback neighborhoods removed
- only sourced OSM place names are stored
- no sourced neighborhoods means an empty list
- missing USDA component/drainage values are not replaced with invented descriptive defaults
- `scripts/sanitize-neighborhoods.mjs` provides a dry-run-first remediation path for historical records
- `docs/DATA-REMEDIATION.md` documents the cleanup boundary and why names cannot safely be deleted by pattern matching alone

Important: remediation tooling does not mean production rows have been cleaned. The sanitizer must be reviewed in dry-run mode before an explicit `--apply` execution.

## Finding 3 - USDA ingestion keeps only the first returned row

The public soil API, admin ingestion endpoint, and CLI use related USDA Soil Data Access queries that can return multiple major-component/horizon rows. Current code maps only `Table[1]`, the first returned row, into the cached representation.

The query orders by component percentage descending and horizon depth ascending. Therefore the current representation is the dominant returned major component's shallowest returned horizon within the top 50 cm. This is now explicitly documented in the public API code, but it remains a product/scientific modeling decision that should be validated before historical data is recalculated.

Unresolved follow-up:
- verify against representative cities and raw USDA responses
- decide whether the product wants dominant-component top-horizon data, a depth-weighted/other aggregate, or richer horizon representation
- document the scientific/product decision before changing historical soil records

Do not silently recalculate the whole database until this is resolved because it could change indexed content at scale.

## Finding 4 - Inconsistent risk thresholds

Before change, ingestion and report rendering used different PI boundaries.

Implemented: `lib/soilRisk.ts` defines one registry screening classifier:
- PI >35: Severe
- PI >25: High
- PI >15: Moderate
- PI 0-15: Lower
- missing/invalid: Not classified

Admin ingestion, commercial rendering, and the soil-report template now use the shared classifier. The standalone CLI mirrors the same thresholds because it executes directly as Node ESM outside the Next.js TypeScript import path.

## Finding 5 - Admin ingest security default

Before change, `app/api/admin/ingest/route.ts` fell back to the literal secret `changeme` and returned configuration/debug information.

Implemented: missing secrets/config fail closed, unauthorized responses no longer expose debug state, and basic target validation runs before ingestion.

## Finding 6 - Historical contributor route is neutralized

`app/about/elias-thorne/page.tsx` permanently redirects to `/about`. Keep the redirect unless there is a verified reason to restore the old profile.

## Finding 7 - Texas regional guidance is deterministic but approximate

`lib/texasFoundationGuides.ts` selects broad guidance regions using latitude/longitude boundaries. These are application-defined heuristics, not authoritative GIS polygons. Use them as regional educational context, not surveyed property-level classifications.

## Finding 8 - Trust badges are descriptive, not credential badges

`components/TrustBadges.tsx` uses descriptive concepts rather than accreditation/licensing claims. Preserve this direction unless a credential is independently verified and genuinely belongs to the represented entity.

## Finding 9 - Commercial schema overstated the provider relationship

Before change, the commercial city template represented Foundation Risk Registry as the `provider` of a `Foundation Repair` Service.

Implemented: the template now describes the URL as a `WebPage` about foundation repair, with Organization, FAQPage, and BreadcrumbList entities. It no longer declares Foundation Risk Registry to be the direct repair provider.

## Finding 10 - Placeholder ZIP could reach public copy

Before change, the city page directly rendered `location.zip_code`, allowing placeholder values such as `00000` to appear publicly.

Implemented: `hasDisplayableZip()` suppresses invalid/all-zero ZIP placeholders and substitutes a location-level USDA/NRCS context statement.

## Finding 11 - Repair diagram made an unsupported prescriptive comparison

Before change, `components/FoundationDiagram.tsx` used `Why Shallow Repairs Fail vs. Our Solution`, called one system a failed method, and labeled a deep steel pier `The Fix`.

Implemented: the component now explains a neutral process: measure movement, identify contributors, and compare repair scopes. It states that mapped soil data cannot determine a property-specific repair system or depth.

## Finding 12 - Commercial intent was secondary in the hero

Before change, the commercial template led with `Local Soil Context` and `Foundation Repair Evaluation & Options`, while GSC showed strong impressions for direct commercial queries such as `cedar park foundation repair`.

Implemented as a controlled experiment: `lib/commercialSeoTreatments.ts` contains the five treatment slugs. Only those pages receive commercial-first metadata and hero treatment.

## Finding 13 - Soil reports needed a stronger commercial path

Before change, soil reports linked to the matching commercial city page mainly through breadcrumbs/schema.

Implemented:
- prominent in-body `Foundation Repair in [City], [State]` link near the top
- footer CTA links back to the commercial city guide
- report uses the shared soil screening classifier
- reports without a usable map-unit record return not-found instead of presenting default scientific-looking values

## Finding 14 - Scope planner used misleading calculation theater

Before change, `components/CostEstimator.tsx` showed an animated `REVIEWING SCOPE FACTORS...` state and text such as `Calculating material yield`, even though it was not calculating a defensible repair quantity or cost.

Implemented: the component is now explicitly a symptom-to-next-step scope planner. It does not simulate a calculation, estimate repair cost from mapped PI, or imply that symptoms alone determine repair scope.

## Finding 15 - Build validation exposed interface assumptions

The first commercial-page rewrite compiled JavaScript but failed Vercel's TypeScript stage because it referenced fields that were not present on shared interfaces (`StateFoundationGuide.summary` and later `NearbyLocation.distance_miles`).

Implemented process change:
- risky changes are developed on `seo-build-validation`
- shared interfaces are inspected before consumers are changed
- a change is not promoted to `seo-foundation-implementation` merely because it committed successfully
- Vercel production-build success is required before promotion when the branch deployment is available

The corrected city-page build was validated successfully before being promoted to the implementation branch.

## Finding 16 - Build config contained a local Windows path

`next.config.ts` pinned `turbopack.root` to a developer-machine path (`c:/Users/...`). Vercel warned that this conflicted with its deployment tracing root.

Implemented on the validation branch: remove the machine-specific Turbopack root and let Next/Vercel resolve the project workspace. This change must pass the validation deployment before promotion.

## Finding 17 - Public soil API coordinate/error handling was too loose

Before change, `app/api/soil/route.ts` used truthiness checks for coordinates and returned raw exception messages to clients.

Implemented on the validation branch:
- coordinates are parsed as finite numbers
- latitude is constrained to -90..90
- longitude is constrained to -180..180
- upstream provider failures return a generic 502 response
- unexpected failures return a generic 500 response
- detailed errors remain server-side

The first-row USDA interpretation is deliberately not changed in this hardening pass. Scientific/data-model changes require separate validation rather than being bundled with defensive API work.

## Implementation status

Completed and previously validated/promoted:
1. Remove unsafe/fabricated neighborhood data generation.
2. Guard placeholder ZIP values.
3. Align soil-report sitemap inclusion with real data availability.
4. Normalize risk classification semantics across main rendering paths.
5. Correct commercial structured data to the verified operating model.
6. Add GSC-driven priority-city treatment architecture.
7. Launch Cedar Park plus four treatment peers while preserving controls.
8. Replace the prescriptive repair-system diagram.
9. Strengthen soil-report-to-commercial-page funnel links.
10. Remove misleading calculation behavior from the scope planner.
11. Pass actual soil data/PI into supporting components.
12. Document experiment, architecture, lead/data flow, and audit decisions.
13. Correct shared-interface rendering errors and validate the city-page production build.

Currently on `seo-build-validation`, awaiting build validation before promotion:
1. Legacy neighborhood remediation script and documentation.
2. Removal of machine-specific Turbopack root.
3. Public soil API coordinate and error-response hardening.

Still to verify/follow up:
1. Validate the USDA first-row scientific/product interpretation before any database-wide recalculation.
2. Dry-run and review historical neighborhood remediation before production mutation.
3. Review fresh GSC data 4-8 weeks after deployment before expanding the treatment cohort.

## Rule for future audits

A generated fact must have a traceable source or deterministic documented derivation. Randomization may be used for harmless presentation variation, but never for geographic, scientific, risk, credential, contractor, engineering, or property claims.

Build rule: a committed change is not a verified change. Shared types must be inspected and the production build must pass before risky implementation work is promoted.

## 2026-10-02 supporting technical cleanup

A fresh 300-page live SquirrelScan audit was run after the sitemap and cross-state title deployments. The audit confirmed perfect scores for Core SEO, crawlability, structured data, images, site integrity, mobile, local SEO, and several other fundamentals, while identifying a small set of reproducible supporting defects.

This cleanup adds a server-visible `main` landmark and H1 to the `/book-analysis` Suspense fallback, aligns the hydrated intake landmarks with the global skip link, removes the logo's conflicting `aria-label`, completes Open Graph image metadata on static pages, corrects the privacy and terms heading hierarchy, shortens the homepage description to 148 characters, and adds mobile enter-key hints to the shared lead forms.

The focused regression crawl also identified and resolved one remaining disclaimer heading skip. Soil reports now link directly to the official USDA/NRCS Soil Survey source, and the unsupported schema-only publication timestamp was removed rather than exposing a database-ingestion date as an editorial publication date.

Broader CSP hardening, bot verification, cache policy, and template performance remain separate workstreams because they require deployment configuration, key management, or architecture decisions beyond a low-risk markup correction.

## 2026-10-02 TTFB, caching, and machine-readable response repair

A controlled live timing investigation separated crawler warm-up cost from persistent server rendering. The homepage, commercial city pages, soil reports, booking page, and national locations directory were already served as Vercel cache hits after first generation. Warm responses from the test location were generally about 0.23-0.40 seconds. First requests for uncommon city/report URLs were roughly 0.75-1.07 seconds while ISR populated an edge cache.

The reproducible cache defect affected `/learn` and `/locations/[state]`. Both routes declared revalidation periods but read server `searchParams` for `?page=N` pagination. In Next.js 16 that request data forced dynamic rendering, producing `private, no-store`, `Age: 0`, and repeated Vercel cache misses.

Implemented locally:

- path pagination at `/learn/page/[page]` and `/locations/[state]/page/[page]`;
- permanent one-hop redirects from legacy `?page=N` URLs;
- page-one normalization to the base directory URL;
- path-based canonicals and internal pagination links;
- not-found behavior for invalid and out-of-range page numbers;
- React request memoization for Supabase records shared by page metadata and body rendering.

Production-build output now classifies the base directories as static and the parameterized directory routes as SSG. Local production responses advertise a one-hour shared cache for the education directory and a one-week shared cache for state directories.

The same regression review found that JSON/Markdown content negotiation on individual city URLs returned 404. The proxy calculated a slug but added it to an outgoing response header, while the rewritten route interpreted its internal `/api/agent/soil-data` path as the slug `soil-data`. Soil-report suffixes also needed normalization.

Implemented locally:

- pass the slug through the internal rewrite URL;
- remove only the terminal `-soil-analysis` suffix before lookup;
- validate slug shape and length;
- negotiate only exact individual service/report URLs, excluding directories and malformed nested paths;
- use the anonymous Supabase client for public location reads;
- reserve the service-role client for recognized-agent analytics writes;
- schedule analytics through Next.js `after()` and ignore unrecognized clients;
- mark JSON/Markdown responses `private, no-store` with `Vary: Accept`.

Verification completed locally:

- ESLint, TypeScript, and the full Next.js production build pass;
- service JSON, soil-report JSON, and soil-report Markdown return 200 with the expected Cedar Park record;
- normal HTML retains ISR cache headers;
- directory URLs remain HTML when sent a JSON Accept header;
- invalid city and missing-slug failures return structured 404 and 400 responses;
- legacy pagination redirects, canonicals, page-one normalization, and out-of-range 404 behavior pass.

Deployment status: these changes are locally verified but not live until committed, pushed to the production branch, deployed successfully, and rechecked against live Vercel headers.

### 2026-10-02 city metadata and second-wave review

A full 4,231-record metadata simulation found zero exact duplicate service titles, descriptions, or H1s. Titles are 38-55 characters and descriptions are 126-153 characters. The deeper weakness is structural rather than mechanical: 4,226 pages use the same standard H1 and description pattern with only the city and state changed.

Finalized September 1-30 GSC page data was therefore reviewed at query level before selecting any additional cities. Seven pages with genuine foundation-repair or foundation-inspection demand and usable stored soil records were added as a separately labeled second wave: Katy, Cypress, Cleburne, Sugar Land, Mesquite, Fort Gaines, and Ellaville. Each received individually written metadata and local property context tied to its recorded USDA/NRCS map unit. The original treatment cohort and the five controls remain unchanged.

Pages were not selected from impressions alone. Fort Worth was excluded because its soil record is missing, and Greeley was excluded because its visible demand centered on engineered foundation plans, which the site does not claim to provide. Full cohort baselines and exclusions are recorded in `docs/SEO-EXPERIMENT-2026-09.md`.

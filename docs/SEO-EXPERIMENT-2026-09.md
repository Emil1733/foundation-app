# Commercial SEO Experiment - September 2026

Status: active implementation
Start date: 2026-09-17
Branch: `seo-foundation-implementation`
Primary template: `app/services/foundation-repair/[city]/page.tsx`
Treatment registry: `lib/commercialSeoTreatments.ts`

## Objective

Test whether making already-visible city pages more directly aligned with commercial `foundation repair [city]` intent improves organic CTR and ranking distribution without mass-rewriting the entire programmatic site.

This is deliberately a small cohort experiment. Do not add every city to the treatment registry until post-change GSC data is reviewed.

## Baseline

GSC export reviewed through 2026-09-15 showed:
- 145 total clicks
- 20,625 total impressions
- approximately 0.70% overall CTR
- impression-weighted average position approximately 13.19
- September 1-15 average daily position approximately 10.79

Several commercial pages had substantial impressions around positions 8-15 but little or no click-through.

## Treatment cohort

| City | Baseline impressions | Baseline position | Reason |
| --- | ---: | ---: | --- |
| Cedar Park, TX | 758 | 10.61 | Highest near-page-one opportunity and clean query match |
| Allen, TX 75002 | 543 | 10.38 | Strong impressions and near-page-one position |
| Schertz, TX | 688 | 12.00 | High impressions, within striking distance |
| Boerne, TX | 295 | 10.54 | Near-page-one test candidate |
| Lewisville, TX | 498 | 13.08 | Commercial visibility plus evaluation/distress query evidence |

Cedar Park is the primary readout URL.

Cedar Park query baselines:
- `cedar park foundation repair`: 436 impressions, position 10.68, 0 clicks
- `foundation repair cedar park tx`: 98 impressions, position 11.28, 0 clicks
- `foundation repair cedar park`: 73 impressions, position 11.01, 0 clicks

### Allen route correction

The GSC baseline URL was reported as `/services/foundation-repair/allen-tx-75002`, but the live `target_locations` record is keyed by slug `allen-tx`. The original treatment registry used `allen-tx-75002`, so the live database-backed Allen page did not receive the experiment variant.

On 2026-09-17 the treatment key was corrected to `allen-tx`. Keep the original GSC baseline numbers above for historical measurement context, but treat `/services/foundation-repair/allen-tx` as the active treatment route going forward. Do not interpret Allen's post-change window as starting before this correction.

## Control cohort

Do not add these pages to `COMMERCIAL_SEO_TREATMENTS` during the initial measurement window:
- Frisco, TX
- Richardson, TX
- Pflugerville, TX
- Carrollton, TX
- Denton, TX

These are directional controls, not a statistically randomized experiment.

## Treatment

Only treatment URLs receive the commercial-intent hero/metadata variant.

Changes include:
1. Title uses `Foundation Repair in [City], [State] | Evaluation & Options`.
2. H1 leads with `Foundation Repair in [City], [State]`.
3. Eyebrow frames the page as foundation repair guidance rather than making soil context the primary product.
4. Hero copy begins with homeowner symptoms such as cracks, sticking doors, and uneven floors.
5. Soil/geology remains an evidence layer below the commercial problem statement.
6. CTA remains a foundation evaluation request, avoiding unsupported promises such as `free`, `licensed engineer`, or guaranteed repair outcomes.
7. Structured data describes the URL as a WebPage about foundation repair. Foundation Risk Registry is no longer declared as the direct provider of foundation repair service unless that operating relationship is separately verified.
8. Invalid placeholder ZIP values such as `00000` are suppressed from visible copy.
9. Soil screening labels use the centralized classifier in `lib/soilRisk.ts`.
10. Soil-report pages contain a prominent contextual link to the matching commercial foundation-repair guide, in addition to breadcrumb navigation.
11. Treatment pages add a city-specific commercial decision section near the top of the body, while keeping all claims tied to observable symptoms, measurements, drainage, and mapped context.
12. Treatment pages add a dedicated `Foundation Repair Options in [City]` section and direct internal jump links to repair options and cost factors.

## Soil report role in the funnel

Soil reports rank for informational and long-tail queries and should support, not compete with, the commercial city page.

Intended relationship:

`soil / geology query -> city soil report -> foundation repair city guide -> property evaluation lead`

Implementation rules:
- the soil report explains mapped data and its limitations
- it does not claim mapped data diagnoses the property
- it links prominently to the matching foundation repair guide when the user is evaluating repair intent
- commercial city pages can link back to the soil report as supporting evidence
- a soil report without a usable soil record is not promoted in the sitemap

## Why the schema changed

The previous commercial template emitted `Service` structured data with Foundation Risk Registry as the `provider` of `Foundation Repair`. The verified product behavior is an information/evaluation/lead flow, not enough evidence to assert that the Registry itself performs repair work.

The implementation therefore uses `WebPage`, `Organization`, `FAQPage`, and `BreadcrumbList` entities. Do not restore provider/service assertions without documenting the real-world service relationship.

## Measurement

Primary measurement window: 4-8 weeks after deployment/index recrawl.

Compare treatment and control pages on:
- impressions
- average position
- CTR
- clicks
- top query mix
- leads submitted
- qualified leads
- revenue, when attribution is available

For Cedar Park specifically, monitor the three exact commercial query variants listed in the baseline section.

## Decision rules

Do not call the experiment successful from a few days of movement.

A useful positive signal is a sustained improvement in commercial-query position and/or CTR across multiple treatment URLs, with Cedar Park as the clearest case. If treatment pages improve while controls remain broadly stable, expand cautiously to the second wave. If rankings fall materially, inspect intent match, content loss, crawl/indexing, and SERP changes before rolling the treatment out further.

## Second wave candidates

If the first cohort produces a positive signal, review these next:
- Galveston
- Richardson
- San Marcos
- Frisco
- Buda

Do not automatically promote them. Use fresh GSC data at the time of the decision.

## Implementation notes

The treatment registry is intentionally separate from the page template. This prevents city-specific SEO decisions from becoming scattered conditional statements throughout JSX and gives future maintainers one auditable place to see which URLs are in the experiment.

Any change to treatment membership, title/H1 wording, CTA, internal funnel links, or measurement window should be documented here in the same commit or PR.

### 2026-09-18 treatment refinement

After the soil-data migration and null-rendering audit were completed, the five treatment pages were strengthened without changing the control cohort. The treatment title now uses the tighter `Foundation Repair [City], [State] | Evaluation & Options` pattern, the hero explicitly includes comparing repair options and contractors, each treatment city receives a short city-specific decision paragraph, and the shared city template exposes dedicated repair-options and cost-factor sections. No new treatment cities were added.

### 2026-09-18 internal-link treatment

The homepage featured-city block was aligned with the five treatment URLs. Cedar Park, Allen, Schertz, Boerne, and Lewisville now receive direct homepage links with the neutral anchor label `Foundation Repair Guide`. Frisco and Richardson were removed from that featured block because they are controls in this experiment. They remain discoverable through the normal site architecture; this change avoids giving control URLs the same deliberate homepage authority boost as the treatment cohort.

The ordinary dynamic service-area grid was not reordered or filtered. This keeps the intervention narrow and auditable rather than changing the broader sitewide link graph.

### 2026-09-18 soil-report and nearby-link audit

The soil-report to commercial-page funnel was audited after the treatment homepage-link change. Soil reports already contained two contextual links to their matching commercial city page, so no extra sitewide links were added. Treatment reports now receive a visually distinct blue commercial-guide callout while controls keep the standard callout, preserving treatment membership without changing destination architecture.

Soil-report rendering now reuses `hasUsableSoilRecord`, so blank or `unknown` map-unit records cannot render an indexable-looking soil article. The commercial city template now uses the same helper for soil-report availability and hero fallback text, preventing `unknown` from appearing as a meaningful soil name.

Nearby-city links remain based on the precomputed geographic relationship table rather than treatment membership. This avoids artificially routing every nearby page toward treatment URLs and contaminating the experiment. Invalid, negative, or non-numeric stored distances are now rejected before rendering.

### 2026-09-18 conversion and trust cleanup

The shared crack/symptom interaction was renamed from `Geological Risk Simulator` to `Foundation Symptom Guide`. Diagnostic language, the simulated soil-analysis spinner, and the artificial 1.5-second calculation delay were removed. Selecting a symptom now shows the existing cautious interpretation immediately.

The mapped-soil block is labeled `Mapped Soil Context`, and the lead action now says `Continue to Evaluation` rather than `Get Report`. This keeps the interaction useful for conversion while making clear that the component organizes observable symptoms and mapped context rather than performing a property diagnosis.

### 2026-09-18 experiment contamination audit

A template-level audit found one treatment feature that had escaped the treatment guard: the dedicated `Foundation Repair Options in [City]` section was rendering on every city page even though the experiment specification describes it as treatment-only. The section is now gated by `getCommercialSeoTreatment(slug)`, while the shared cost planner remains available to all city pages.

The treatment registry still contains exactly Cedar Park, Allen, Schertz, Boerne, and Lewisville. Frisco, Richardson, Pflugerville, Carrollton, and Denton remain outside the registry. Homepage featured links remain limited to the five treatment cities; the ordinary service-area grid and geographically precomputed nearby-city links remain neutral.

### 2026-09-18 sitewide trust and claims audit

The homepage and locations directory were reviewed for language that could imply authority, diagnosis, engineering work, or direct structural repair beyond the verified product behavior. The locations page no longer calls the Registry a `National Geological Authority` or claims that it provides `forensic evaluation and permanent structural stabilization`. Its metadata and hero now describe local soil/foundation guides, mapped context, evaluation guidance, and repair options.

Homepage labels were also tightened. `Geological Risk`, `How We Audit Your Risk`, `The Forensic Difference`, `Geological Report`, and `forensic soil analysis` style language were replaced with plain mapped-soil and soil-report wording. Dynamic report cards no longer state `Why Foundations Fail` or promise an engineering breakdown. The remaining em dash in the Registry research-guidance citation was removed.

These are sitewide trust clarifications rather than additions to the commercial treatment. Treatment and control membership are unchanged.

### 2026-09-18 lead-generation positioning calibration

After the trust-claims audit, the homepage and locations directory were recalibrated so Foundation Risk Registry still presents as a foundation-repair-focused service rather than an informational soil-data publication. Unsupported authority, engineering, diagnosis, and direct structural-stabilization claims remain removed.

The homepage now leads with foundation problems, warning signs, repair options, and a property-specific evaluation. Soil data remains the evidence and differentiation layer. The locations directory now uses `Foundation Repair Service Areas` and `Foundation Repair Help Near You`, with symptom-led copy that directs homeowners toward getting help. This preserves commercial lead intent without claiming that the Registry itself is an engineering firm or the contractor performing structural repairs.

### 2026-09-18 technical SEO and lead-funnel audit

A follow-up architecture audit found that state directory pages were linked from the locations hub but were absent from the XML sitemap. The 16 supported state hubs are now explicitly included with weekly change frequency while existing city-service and usable-soil-report filtering remains unchanged.

State hubs were also aligned with the foundation-repair lead positioning. Unsupported `Geological Authority` and `forensic evaluation` wording was removed, while foundation repair, warning signs, evaluation steps, and repair options remain prominent. Remaining em dashes in state pagination labels were replaced with hyphens.

The evaluation intake was reviewed for promise-to-action consistency. The step-two button no longer says `Verify Soil Data` because advancing the form does not itself perform a soil verification. It now says `Continue to Contact`. Contact-step copy now explains that a foundation professional can follow up about property concerns and evaluation options, and the loading state uses plain `Loading Evaluation Form...` wording instead of the more technical `Initializing Intake Protocol...`.

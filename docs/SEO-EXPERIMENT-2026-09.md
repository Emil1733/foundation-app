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

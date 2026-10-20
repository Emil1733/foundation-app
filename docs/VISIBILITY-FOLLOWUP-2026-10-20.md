# Selective visibility follow-up — October 20, 2026

## Scope and boundaries

Investigate Sugar Land, Cedar Park, Allen, and Schertz before rewriting city copy or expanding treatment membership. No copy, form, schema, database, or cohort changes in this repair. Search results are an unlocalized discovery sample, not proof of exact Google US desktop rankings or of why a competitor outranks us.

## Allen implementation

The historical `/services/foundation-repair/allen-tx-75002` returned 404 while its verified equivalent `/services/foundation-repair/allen-tx` returned 200 and self-canonicalized. An exact permanent redirect is now configured ahead of the older generic ZIP rule in `next.config.ts`. Do not broaden the rule to guessed city equivalents. The existing generic rule did not protect this historical route in production; this repair does not claim to diagnose or fix all ZIP-pattern routes.

`node scripts/test-legacy-redirects.cjs` exercises the actual config with the installed Next.js routing test helper: 308, preserved query string, HTML/JSON/Markdown requests, no canonical loop, no nested/suffix/soil-report overmatch. The standalone test installs native AsyncLocalStorage before loading Next's helper. No dependency was added.

Status: locally verified on `codex/visibility-followup-oct20`; production remains unchanged until explicitly deployed and live responses verified. Regression tests, full ESLint, TypeScript during the production build, and the full production build passed. Built-app HTTP checks on port 3107 confirmed all three Accept types return 308 with the preserved query string, followed by a 200 HTML destination with the production self-canonical and no redirect loop. A pre-existing multiple-lockfile workspace-root warning remains; this repair does not alter root configuration.

## Schertz discovery

Live checks on October 20:

- `/sitemaps/services.xml` includes the canonical Schertz URL, lastmod October 15.
- Homepage HTML includes a direct anchor to the service page.
- `/services/foundation-repair/converse-tx` includes a direct anchor.
- `/learn/schertz-tx-soil-analysis` includes a direct anchor.
- Texas directory page one does not include it; the directory is paginated. This is not an orphan finding because the homepage and other crawlable paths already link directly.
- URL Inspection reports indexed, successful fetch, indexing allowed, and self-selected canonical, but last crawl July 27. Do not interpret three impressions across the two comparison windows as a measured treatment failure.

No redundant internal links or sitemap date changes were added. Google accepted the manual Schertz indexing request on October 20 (the interface confirmed addition to the priority crawl queue). Request acceptance is not a completed recrawl. Do not submit duplicates merely because the stored crawl timestamp has not yet advanced.

## Matched-query findings

Finalized data ends October 17. Compare September 16–October 1 against October 2–17 (16 days each). These are not a clean pre/post comparison of the September 17 initial treatment. GSC hides some queries, and positions are conditional on impressions.

| City | Impressions | Average position | Interpretation |
| --- | --- | --- | --- |
| Sugar Land | 77 → 73 | 17.19 → 26.07 | Repeated-query loss, not just less demand |
| Cedar Park | 207 → 158 | 10.79 → 13.45 | Repeated-query loss and reduced visibility |
| Allen | 0 → 7 | unavailable → 12.86 | Impressions begin October 16–17 after October 15 crawl |
| Schertz | 2 → 1 | too sparse | Crawl freshness first |

Fixed baseline weighting over identical query/device/country combinations gives Cedar Park 10.98 → 13.25 (187 baseline impressions matched) and Sugar Land 18.28 → 24.91 (61 matched). No competing internal URL appeared for visible Sugar Land/Cedar Park commercial foundation queries in either window. This is not proof that cannibalization never occurs in hidden queries. All four cities had zero clicks in both windows; do not claim significant CTR/conversion effects.

## October 2 diff and current commercial-intent comparison

Review of `7f3fb4a` shows Sugar Land entering the second-wave registry with its description and local evidence profile. Cedar Park was already an initial treatment; the October 2 registry diff does not rewrite its existing treatment title or hero. A correlation between crawl timing and poorer positions does not isolate a causal edit or justify rolling back both cities together.

Our live city pages already contain commercial headings, request forms, symptom guidance, repair-option explanations, cost factors, and guarded mapped-soil profiles. More generic repair prose would duplicate existing coverage. The remaining hypothesis is a gap between useful guidance and demonstrable local service delivery, not a missing keyword count.

Primary competitor pages reviewed (claims reported as their own, not independently authenticated):

- [Olshan Sugar Land](https://www.olshanfoundation.com/regions/texas/sugar-land/): named repair business, contact route, repair/drainage/plumbing services, experience framing.
- [Dura Pier Cedar Park](https://durapier.com/service-areas/cedar-park-tx/): named business, evaluation CTA, service options, warranty/financing explanations, linked customer reviews.
- [Quality Foundation Repair Cedar Park](https://qualityfoundationrepairaustin.com/service-area/cedar-park-tx/): search discovery showed inspection terms and crew/review assertions; full page fetch failed, so treat as partial evidence only.

Do not copy geographic claims, credentials, lifetime guarantees, free inspections, years in business, ratings, or neighborhood narratives from these pages. Several sampled search results themselves contain inconsistencies; high visibility does not validate their facts.

## Decision

Do not roll back or mass-rewrite either city based on this sample. Preserve treatment/control membership. Prioritize Sugar Land, then Cedar Park, for a small proof-backed improvement once the actual provider relationship and supporting assets are supplied:

1. Named business/professional responsible for follow-up, with permission to publish and confirmed city coverage.
2. Actual evaluation scope and fees, including exceptions; do not infer a free visit.
3. A genuine local case with permission, dated measurements, work description, and licensed photo rights. Remove precise homeowner location and contact details.
4. Authentic attributable review permission and applicable written warranty terms, only where the responsible provider has them.

Keep mapped-soil limitations and the existing consent intact. No guarantee that these additions improve ranking. Until the evidence exists, the safe next work is the verified redirect and crawl refresh, followed by matched-query monitoring after observed recrawls.

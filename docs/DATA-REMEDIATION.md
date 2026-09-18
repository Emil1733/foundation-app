# Data Remediation

## Legacy neighborhood claims

Status: remediation tooling prepared, production data not modified automatically.

### Background

An older version of `scripts/add-city.mjs` stored neighborhood objects containing randomized foundation-risk labels and unsupported notes. It could also invent fallback neighborhood names when the geographic source returned no neighborhoods.

That behavior has been removed from current ingestion. New ingestion preserves sourced neighborhood names only and does not assign neighborhood-level soil or foundation risk without matching evidence.

### Why existing rows still matter

Changing the ingestion script prevents future bad records, but it does not rewrite rows already stored in Supabase. Historical `target_locations.neighborhoods` values may therefore still contain `risk` or `note` fields created by the old script.

### Remediation script

`scripts/sanitize-neighborhoods.mjs` converts legacy neighborhood values to this shape:

```json
[
  { "name": "Neighborhood Name" }
]
```

It removes all other neighborhood-level fields. It does not invent replacement names.

### Safety behavior

The script is dry-run by default:

```bash
node scripts/sanitize-neighborhoods.mjs
```

This scans records and prints proposed changes without writing them.

Production mutation requires an explicit flag:

```bash
node scripts/sanitize-neighborhoods.mjs --apply
```

Do not use `--apply` until the dry-run output has been reviewed. The script requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

### Important limitation

If an old fallback neighborhood name itself was fabricated, the database does not currently retain enough provenance to distinguish it reliably from a real sourced name. The sanitizer therefore removes unsupported risk/note claims but preserves names. Deleting names solely because they resemble an old fallback pattern could remove legitimate places.

If stronger cleanup is required, re-query the geographic source for each location and reconcile stored names against sourced results rather than guessing from naming patterns.

## Stored PI risk-label reclassification

Status: completed in production on 2026-09-17 and verified after the write.

A read-only audit found that historical `soil_cache.risk_level` values often did not match the centralized classifier in `lib/soilRisk.ts`. This was a label-consistency problem and remained separate from the USDA methodology migration below.

The deterministic classifier is:

- PI > 35: `Severe`
- PI > 25: `High`
- PI > 15: `Moderate`
- PI >= 0: `Lower`
- missing, invalid, or negative PI: `Not classified`

The boundary values 15, 25, and 35 remain in the lower class because the application classifier uses strict `>` thresholds.

### Reclassification tool

`scripts/reclassify-soil-risk.mjs` derives only `risk_level` from the PI already stored in the same row. It does not contact USDA and does not change PI, LEP, map units, components, coordinates, or other fields.

Dry run:

```bash
node scripts/reclassify-soil-risk.mjs
```

Targeted dry run:

```bash
node scripts/reclassify-soil-risk.mjs --slugs=cedar-park-tx,allen-tx,schertz-tx,boerne-tx,lewisville-tx
```

Apply is deliberately explicit:

```bash
node scripts/reclassify-soil-risk.mjs --apply
```

Apply mode updates rows by ID and also checks the previously observed `risk_level` so a concurrent change causes an abort instead of silently overwriting newer data.

### Production remediation record

On 2026-09-17, the pre-write audit scanned 4,143 `soil_cache` rows and identified exactly 3,912 mismatches. The proposed change set was fingerprinted before mutation so the production update would not proceed against an unexpected data set.

The original database check constraint allowed only `Low`, `Moderate`, `High`, and `Severe`. That schema was older than the application classifier and initially blocked canonical `Lower` / `Not classified` values. The migration therefore proceeded in stages:

1. An attempted direct tightening to canonical labels failed safely because 145 legacy `Low` rows still existed.
2. The constraint was temporarily expanded to accept both legacy and canonical labels.
3. The 3,912-row change-set count and fingerprint were revalidated unchanged.
4. Exactly 3,912 `risk_level` values were updated from their existing stored PI. No PI, LEP, USDA map unit, component, coordinate, or other soil value was changed.
5. A post-write audit found zero classifier mismatches and zero legacy `Low` rows across all 4,143 records.
6. The database constraint was then tightened successfully to the canonical set only: `Lower`, `Moderate`, `High`, `Severe`, `Not classified`.
7. A final post-migration audit again found 4,143 rows, zero classifier mismatches, and zero legacy `Low` values.

Final production distribution at remediation time was 3,391 `Lower`, 420 `Moderate`, 126 `High`, 199 `Severe`, and 7 `Not classified`.

These counts document the completed migration and are not intended as permanent invariants as new locations are ingested.

## USDA soil methodology migration

Status: new ingestion methodology implemented; historical PI/LEP migration not approved or performed.

### Why migration is separate from code deployment

Older cached records were produced by selecting the first USDA major-component/horizon row. Current ingestion calculates PI and LEP for the dominant major component using horizon-thickness weighting over the 0-50 cm interval.

Changing ingestion fixes new/re-ingested records, but blindly rewriting historical records could alter public soil values, screening classes, and indexed page copy at scale. Historical PI/LEP data therefore stays unchanged until impact is measured.

### Read-only comparison tool

Use `scripts/compare-soil-methodology.mjs` to compare cached values against fresh USDA values calculated with the current methodology.

The script has no update/upsert/delete calls and is intentionally read-only.

Default sample:

```bash
node scripts/compare-soil-methodology.mjs
```

Limit sample size:

```bash
node scripts/compare-soil-methodology.mjs --limit=50
```

Target specific indexed/priority cities:

```bash
node scripts/compare-soil-methodology.mjs --slugs=cedar-park-tx,allen-tx,schertz-tx,boerne-tx,lewisville-tx
```

Change the PI delta considered material:

```bash
node scripts/compare-soil-methodology.mjs --threshold=2
```

The output reports old/new PI, PI delta, risk-class changes, dominant-component changes, mean absolute PI change, and maximum absolute PI change. No database writes are performed.

### Migration decision gate

Do not create or run a historical PI/LEP migration until the comparison output has been reviewed.

At minimum, review:

1. the five SEO treatment cities,
2. a broader sample across states/regions,
3. every risk-class change,
4. large PI deltas,
5. dominant-component changes,
6. cases where USDA now returns no usable result.

If changes are small and scientifically coherent, a separate migration script can be designed with dry-run, explicit apply flag, audit output, and rollback/export requirements. If changes are widespread or surprising, investigate the affected USDA rows before any database mutation.

### Full read-only audit, 2026-09-18

After the Supabase Data API row ceiling was raised, the full comparison was rerun with `--limit=5000`.

Observed result:

- locations loaded: 4,231
- comparable USDA results: 3,982
- material PI changes >= 1: 2,600
- risk-class changes: 1,150
- dominant-component-name changes: 0
- mean absolute PI change: 4.64
- maximum absolute PI change: 36.05
- database writes: 0

The audit establishes that historical numeric PI differences are widespread, not merely a risk-label problem. It does not authorize a production rewrite. The 249 loaded locations outside the comparable set must be classified and reviewed before migration.

### Canonical-query parity

Before designing a write path, the shared application query was aligned with the audited methodology: horizons must intersect 0-50 cm (`hzdept_r < 50` and `hzdepb_r > 0`), and `cokey` is used as the deterministic tie-break and component identity. Comparison and remediation tooling must use the same rules.

### Phase 1: immutable review manifest

`scripts/prepare-soil-remediation.mjs` is intentionally read-only and has no `--apply` mode. It explicitly paginates Supabase reads in 500-row ranges, so audit completeness does not depend on a high project-wide Data API row ceiling.

It fetches fresh USDA data, records expected cached values and proposed values, quarantines fresh PI or LEP nulls as `REVIEW_NULL_ATTRIBUTE`, excludes `NO_CACHE`, `NO_USDA_RESULT`, and `ERROR` from the eligible change set, records component key/percentage/horizon count, writes a local JSON manifest, and fingerprints the exact eligible changed rows with SHA-256.

Run the full preparation with:

```bash
node scripts/prepare-soil-remediation.mjs --limit=5000
```

The generated manifest is run-specific audit evidence and must not be committed.

### First remediation manifest result, 2026-09-18

The first full manifest run loaded 4,231 locations and produced:

- `ELIGIBLE`: 3,693
- `ERROR`: 256
- `NO_CACHE`: 88
- `NO_USDA_RESULT`: 151
- `REVIEW_NULL_ATTRIBUTE`: 43
- eligible changed rows: 2,922
- eligible risk-class changes: 1,038
- intermediate change-set SHA-256: `7baf675c6bfbbff75b729692dd902c0680d28c4246584b87099e6407285ed370`

The status counts sum exactly to 4,231. This fingerprint is explicitly **intermediate**, not production-approved, because 256 USDA requests remained in `ERROR`. Resolving any of those errors can change the eligible set, counts, and fingerprint.

### Phase 2: targeted error reconciliation

`scripts/retry-soil-remediation-errors.mjs` consumes the existing local manifest and retries only rows whose status is `ERROR`. It preserves every successful/non-error row from the prior run rather than re-querying thousands of already-resolved locations.

For each failed row it re-reads the current target/cache record before retrying USDA, uses five bounded attempts with a longer timeout, groups error types, replaces resolved errors with the appropriate canonical status, recalculates the eligible change set, and creates a new SHA-256 fingerprint.

It remains strictly read-only with respect to Supabase and intentionally has no `--apply` mode.

After this code passes the normal validation branch:

```bash
node scripts/retry-soil-remediation-errors.mjs
```

Default input is `soil-remediation-manifests/latest.json` and default output is `soil-remediation-manifests/reconciled.json`.

Do not treat the reconciled fingerprint as production-approved while unexplained `ERROR` rows remain.

### Migration gates

No production PI/LEP mutation tool should be created or run until:

1. the manifest script passes the validation-branch build,
2. a fresh full manifest is generated,
3. every non-eligible status is counted and reviewed,
4. null PI/LEP policy is explicitly approved,
5. large PI deltas and risk-class changes are spot-checked,
6. the manifest fingerprint is recorded,
7. rollback/export strategy is defined,
8. any future apply path uses optimistic concurrency against the manifest's expected old values,
9. apply is guarded by exact count and fingerprint,
10. post-write verification is defined before the first production write.

No production PI/LEP migration has been performed.

## Data-integrity rule

Generated or stored geographic, scientific, risk, credential, engineering, contractor, or property claims must have either:

1. a traceable external source, or
2. a deterministic, documented derivation from sourced data.

Randomization is permitted only for harmless presentation variation. It must never generate factual claims.

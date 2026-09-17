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

## USDA soil methodology migration

Status: new ingestion methodology implemented; historical `soil_cache` migration not approved or performed.

### Why migration is separate from code deployment

Older cached records were produced by selecting the first USDA major-component/horizon row. Current ingestion calculates PI and LEP for the dominant major component using horizon-thickness weighting over the 0-50 cm interval.

Changing ingestion fixes new/re-ingested records, but blindly rewriting historical records could alter public soil values, screening classes, and indexed page copy at scale. Historical data therefore stays unchanged until impact is measured.

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
node scripts/compare-soil-methodology.mjs --slugs=cedar-park-tx,allen-tx-75002,schertz-tx,boerne-tx,lewisville-tx
```

Change the PI delta considered material:

```bash
node scripts/compare-soil-methodology.mjs --threshold=2
```

The output reports old/new PI, PI delta, risk-class changes, dominant-component changes, mean absolute PI change, and maximum absolute PI change. No database writes are performed.

### Migration decision gate

Do not create or run a historical soil migration until the comparison output has been reviewed.

At minimum, review:

1. the five SEO treatment cities,
2. a broader sample across states/regions,
3. every risk-class change,
4. large PI deltas,
5. dominant-component changes,
6. cases where USDA now returns no usable result.

If changes are small and scientifically coherent, a separate migration script can be designed with dry-run, explicit apply flag, audit output, and rollback/export requirements. If changes are widespread or surprising, investigate the affected USDA rows before any database mutation.

## Data-integrity rule

Generated or stored geographic, scientific, risk, credential, engineering, contractor, or property claims must have either:

1. a traceable external source, or
2. a deterministic, documented derivation from sourced data.

Randomization is permitted only for harmless presentation variation. It must never generate factual claims.

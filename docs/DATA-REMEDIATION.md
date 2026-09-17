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

## Data-integrity rule

Generated or stored geographic, scientific, risk, credential, engineering, contractor, or property claims must have either:

1. a traceable external source, or
2. a deterministic, documented derivation from sourced data.

Randomization is permitted only for harmless presentation variation. It must never generate factual claims.

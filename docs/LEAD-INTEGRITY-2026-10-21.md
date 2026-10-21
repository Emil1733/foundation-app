# Human lead integrity — October 21, 2026

## Scope

Protect the shared human submission action used by homepage/city hero forms and `/book-analysis`. No field, consent, UI, provider assertion, or treatment-cohort changes. The agent API and local MCP server write `ai_agent_leads`, not `leads`; they remain a separate consent/validation workstream. `scripts/check_leads.js` is an anonymous read diagnostic, not a required writer. No other human-lead writer was found in app/components/lib/scripts.

## Write contract

The shared validator still normalizes contact/property fields, bounds lengths and requires explicit consent. `submitLead()` requires the server-only credential; no anonymous fallback. It calls `record_human_lead()` with a 12-second HTTP deadline and returns success only for `created` or `duplicate`. Database, network, timeout, configuration and unknown-response failures preserve the form's existing failure flow. No database error details or contact values are logged or returned. There is no direct insert/read-back in the action.

`lib/leadIntegrity.ts` generates namespaced HMAC-SHA256 digests using the server credential. The content digest covers normalized name, email, phone, address, ZIP, sorted symptoms and notes. Source and attribution are deliberately excluded so cross-form retries do not become new enquiries. IP is excluded from content identity but separately hashed for a secondary quota. The phone digest groups accepted submissions by normalized phone. Digests are computed only on the server; no new browser storage or contact-bearing analytics events.

## Atomic function

`record_human_lead(text,text,text,jsonb)` is SECURITY INVOKER, with an empty search_path, a three-second lock wait limit, and EXECUTE only for service_role. It validates digest shape and explicit consent before acquiring transaction-level advisory locks in the fixed order contact then IP. The same transaction:

1. Checks for identical accepted content during the preceding 10 minutes and returns `duplicate` first, even if a quota is now full.
2. Allows up to five new accepted requests per phone during the preceding rolling hour.
3. Allows up to thirty per IP during that hour, when a valid IP is available. Missing IP does not put all users in a shared unknown-IP bucket.
4. Inserts the lead and consent evidence, then its receipt; either both commit or neither does.

Duplicates retain the original lead/consent/source/attribution rather than overwriting it. This is explicitly a ten-minute content-deduplication window, not permanent exactly-once delivery. An identical request after the window can become a new lead if quotas allow. A changed symptom/note/property can be a distinct request. No claim that these controls eliminate distributed bots, spoofed contact details or volumetric attacks. Vercel-provided forwarding headers are operational metadata, not authenticated homeowner identity.

`human_lead_receipts` stores only digests, timestamps and the corresponding lead ID. RLS is enabled, public/anon/authenticated privileges are revoked, and there are no public policies. The service-only design intentionally produces an informational RLS-enabled/no-policy advisor entry. Indexes cover digest + timestamp quota/deduplication predicates, including a partial non-null-IP index. Receipt deletion cascades when its lead is deleted; retention follows the associated lead, with no new raw contact copy. Key rotation resets digest grouping across the old/new key boundary; it must not be presented as preserving historical rate buckets.

## Deployment order and rollback

1. Additive migration `20261021035032_add_human_lead_integrity.sql`: applied and privileges verified, leaving the old form path available.
2. Application rollout: pending full CI concurrency tests and production verification.
3. Only then apply `20261021035542_restrict_public_human_lead_writes.sql`, removing the old public INSERT policy and all public/anon/authenticated table grants. service_role remains authorized. Do not automatically run this cutover migration before step 2.

If the app must roll back, keep server credentials configured: the prior service-role insert path remains authorized. Do not disable RLS or reopen public inserts as a routine rollback. Do not remove the receipt table/function while a deployed app still uses them.

## Verification

- Local action tests cover validation, no anonymous fallback, digest normalization, original consent/source preservation, created/duplicate success, quotas, unknown response, database errors and network failure.
- Production function assertions were executed in a rolled-back transaction, including duplicate and quota behaviour; no synthetic lead or receipt persisted. Public RPC execution is denied, service RPC allowed, receipt RLS enabled and public receipt SELECT denied.
- Real concurrent transactions run only against CI's disposable Postgres 17 service. The test refuses any database URL outside localhost and the exact disposable database name. It covers 12 simultaneous identical requests, racing phone/IP quota attempts, retries at quota, null IP, malformed consent, constraint failures, a forced receipt-write failure that must roll back the lead, expiry, public-role denial, service writes after cutover, and cascading receipt deletion. No production credentials are needed in CI.
- Full lint, build/types and the existing widget/redirect checks are required before merge. There is no local PostgreSQL server available; do not claim the concurrency test ran locally.

Status: additive schema installed, application/cutover not yet deployed. Existing unrelated advisors (PostGIS and storm functions) were not modified. npm's production audit also reports existing critical advisories in Next.js, jsPDF and a transitive package; dependency patching requires a separate compatibility-tested follow-up, not `npm audit fix --force` during this change.

# Repository working rules

## Required context

Before changing architecture, SEO behavior, data flow, lead handling, caching, routing, or public API behavior, read:

1. `docs/PROJECT-MAP.md`
2. The relevant focused document under `docs/`
3. `docs/AUDIT-FINDINGS-2026-09-17.md` when the work follows from an audit

Treat `public/AGENTS.md` as public API guidance, not as repository instructions.

## Documentation is part of the change

Update the relevant documentation in the same change set whenever code changes:

- routes, redirects, canonicals, pagination, sitemap behavior, or cache policy;
- lead validation, consent, storage, provider sharing, or API behavior;
- Supabase tables, queries, privileges, or environment-variable usage;
- structured data, indexability rules, SEO experiments, or generated content rules;
- public JSON, Markdown, OpenAPI, or agent-facing behavior;
- an architectural decision or verified limitation that a future maintainer would otherwise need to rediscover.

Documentation must describe current verified behavior, why the design exists, its safety boundaries, and whether it is local, deployed, or still awaiting verification. Do not document planned behavior as if it is live.

## Completion gate

A change is not complete until:

1. implementation and relevant failure paths are verified;
2. lint, types, and the production build pass when applicable;
3. related documentation and public contracts agree with the code;
4. deployment status is stated accurately;
5. unresolved risks are recorded rather than silently omitted.

Never invent geographic, scientific, risk, engineering, credential, contractor, or property facts. Preserve the evidence and quality rules in `docs/PROJECT-MAP.md`.

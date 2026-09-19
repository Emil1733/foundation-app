# FoundationRisk Design System and Programmatic Page Architecture

Status: design direction approved, implementation staged
Last updated: 2026-09-19
Primary service template: `app/services/foundation-repair/[city]/page.tsx`
Current experiment registry: `lib/commercialSeoTreatments.ts`
Related history: `docs/SEO-EXPERIMENT-2026-09.md`

## Purpose

FoundationRisk must scale to many city pages without page-by-page design work. The product should feel like a premium foundation-focused home service while preserving programmatic SEO, reusable code, cautious claims, and structured local data.

The governing architecture is:

```text
FoundationRisk design system
        ↓
Reusable foundation components
        ↓
City / state / soil / SEO data
```

Do not create bespoke visual implementations for individual cities unless there is a documented product reason. City differences belong in data and content. Service differences belong in component configuration. Brand and presentation belong in the shared design system.

## Commercial positioning

The front end should communicate foundation expertise and make it natural for a homeowner with cracks, uneven floors, sticking doors, drainage concerns, or suspected movement to request help.

The site is a lead-generation product. It must not claim facts that are not verified. In particular, do not imply that FoundationRisk employs engineers, directly performs structural stabilization, diagnoses a property from mapped data, or is a geological authority unless those relationships are independently verified and documented.

Preferred homeowner language includes:
- Foundation Repair in [City]
- Request a Foundation Evaluation
- Compare Foundation Repair Options
- Concerned About Foundation Movement?
- Get Help With Your Foundation

Soil information is a credibility and evidence layer, not the primary product and not a property diagnosis.

## Visual direction

The approved visual reference is the redesigned global header plus the cinematic foundation-repair hero.

Core principles:
- premium engineering and home-services character, not SaaS dashboard styling
- deep navy/charcoal authority surfaces
- restrained steel/electric blue for actions and data emphasis
- warm off-white/light neutral content backgrounds
- strong editorial typography and generous spacing
- thin architectural borders and restrained shadows
- small uppercase technical labels where useful
- photography at emotional/high-impact moments
- diagrams and data graphics for technical explanation
- avoid repetitive white card + gray border + generic icon layouts
- avoid generic shield/house/crack clip-art as a substitute for brand design
- avoid making every section dark or photographic

The page should have visual rhythm rather than one repeated component treatment:

```text
Cinematic hero
→ premium credibility strip
→ interactive symptom/signs experience
→ soil/data intelligence
→ explanatory foundation visual
→ repair/cost decision support
→ dark conversion break
→ local FAQ / nearby locations
→ final conversion action where appropriate
```

## Current hero implementation

The current shared city hero is still implemented directly in:
`app/services/foundation-repair/[city]/page.tsx`

It uses:
- local decorative asset `/foundation-hero-generated.webp`
- responsive background positioning to keep the house visible on mobile
- layered dark/left-side gradients for readable real HTML
- live `SoilRiskWidget` above the image
- real H1, paragraph, breadcrumb, links, and CTA
- no UI or text baked into the image

The intended future extraction is:
`components/foundation/FoundationHero.tsx`

Once extracted, the city page should pass location and SEO-treatment data into that component rather than owning hero CSS itself.

## Target component structure

Create or migrate toward:

```text
components/
  foundation/
    FoundationHero.tsx
    TrustStrip.tsx
    FoundationSigns.tsx
    SoilIntelligence.tsx
    FoundationDiagram.tsx
    RepairOptions.tsx
    CostEstimator.tsx
    EvaluationCTA.tsx
```

Existing components can be migrated incrementally. Do not rewrite working business logic merely to match the folder structure.

The city route should eventually behave primarily as an orchestrator:

```tsx
<FoundationHero />
<TrustStrip />
<FoundationSigns />
<SoilIntelligence />
<FoundationDiagram />
<RepairOptions />
<CostEstimator />
<EvaluationCTA />
<LocalFAQ />
<NearbyLocations />
```

## Content and data separation

Presentation components should not contain city-specific hardcoded copy. They receive structured props or content objects.

Conceptually:

```tsx
<SoilIntelligence
  city={city}
  soilName={soil.map_unit_name}
  plasticityIndex={soil.plasticity_index}
  risk={riskClass}
/>
```

Content logic should progressively move toward dedicated helpers such as:

```text
lib/
  foundation/
    pageContent.ts
    soilContent.ts
    regionalContent.ts
    seoMetadata.ts
    schema.ts
```

These names describe the target architecture, not a requirement to create empty files before they are needed.

A reusable component controls how information is presented. Content/data helpers control what locally relevant information is presented.

## Controlled variants, not bespoke pages

Shared components may expose documented variants when there is a reusable design reason, for example:

```text
Hero: cinematic | compact
CTA: dark | light | image
Data panel: report | compact
Content section: editorial | split | visual
```

Do not add city names to styling conditionals. A variant must be reusable across multiple pages or have a documented experiment/product purpose.

## Programmatic SEO requirements

Premium visual design must not replace crawlable content.

Important information remains server-rendered HTML:
- H1
- H2 section headings
- city/state copy
- soil interpretation
- repair/evaluation guidance
- CTA links
- FAQ content
- nearby-city internal links
- structured data

Images and diagrams support the page. They do not contain the only copy Google or a user needs.

Expected semantic structure can include:
- Foundation Repair in [City], [State]
- Foundation Warning Signs in [City]
- Mapped Soil and Foundation Context for [City]
- Foundation Repair Options in [City]
- Foundation Repair Cost Factors in [City]
- Foundation Repair Questions in [City]

Do not create thousands of pages by only swapping a city token. Local differentiation should come from verified structured inputs such as location, mapped soil data, regional guidance, nearby locations, and controlled SEO treatments.

## Geographic content model

Reusable design can support increasingly local information:

```text
State / region
      ↓
City
      ↓
Mapped soil
      ↓
Property lead / evaluation request
```

Regional guidance should be factual and data-driven. State or regional differences belong in structured content/configuration, not duplicated JSX.

## Component design briefs

### TrustStrip
Replace ordinary card-grid styling with a restrained credibility/specification strip. Use thin dividers, whitespace, concise labels, and minimal custom iconography. Current content themes are property-specific help, foundation repair guidance, clear next steps, and local soil context.

### FoundationSigns
Evolve the current symptom interaction into a premium visual selection experience. Users can select observable signs such as diagonal cracks, sticking doors, uneven floors, or wall gaps. The response must remain interpretive and cautious, not diagnostic. Preserve the evaluation CTA.

### SoilIntelligence
Present mapped soil information like a premium property intelligence/engineering report. Prioritize clear metrics, a risk scale, mapped soil profile, source attribution, and explicit mapped-data limitations. Do not imply that PI or soil mapping proves movement at a specific home.

### FoundationDiagram
Use a refined architectural/engineering visual language to explain slab, soil layers, moisture, movement, drainage, and support concepts. Avoid cartoon styling. Keep explanatory text accessible and crawlable outside the illustration.

### CostEstimator
Make the tool feel like a high-end decision/quote-planning interface rather than a generic calculator. Preserve cautious scope logic and avoid presenting an online estimate as a binding repair quote.

### RepairOptions
Use reusable visual solution cards or panels for concepts such as supports/piers, drainage correction, plumbing/leak work, and monitoring. Wording must make clear that the appropriate option depends on property evidence.

### EvaluationCTA
Use a limited number of intentional visual variants. A dark conversion break can reconnect lower-page content to the cinematic hero and provide visual rhythm. CTA language should focus on requesting a foundation evaluation or understanding the next step.

## Implementation order

Recommended sequence:
1. Establish `components/foundation/` and shared design tokens/patterns as needed.
2. Extract/refine TrustStrip and SoilIntelligence.
3. Refine FoundationSigns / existing CrackAnalyzer.
4. Refine FoundationDiagram.
5. Refine CostEstimator.
6. Refine RepairOptions and conversion-break CTA.
7. Extract the already-approved cinematic hero once the shared component conventions are established.
8. Audit desktop/mobile visual rhythm, accessibility, Core Web Vitals, internal links, and treatment/control isolation.

Do not redesign all components in one unvalidated commit. Use small validated batches.

## Experiment isolation

The September 2026 commercial SEO treatment is separate from the design system.

Treatment membership lives in `lib/commercialSeoTreatments.ts` and is documented in `docs/SEO-EXPERIMENT-2026-09.md`.

A global component redesign must not accidentally:
- add control cities to the treatment
- change treatment-specific headings/copy on controls
- alter experiment membership
- introduce treatment-only internal links sitewide

Shared presentation can change globally while experiment-specific content remains guarded by the treatment registry.

## Build and branch workflow

For this project:
1. Make implementation changes on `seo-build-validation`.
2. Keep commits coherent and documented.
3. Wait for the exact validation-head Vercel build to succeed.
4. Only then fast-forward/promote the validated batch to `seo-foundation-implementation`.
5. Do not merge to `master` or merge PR #1 without explicit user instruction.
6. Do not describe a build as fixed/passed before Vercel or equivalent CI confirms the exact commit.

Production database writes are separate from design work and require explicit authorization.

## Maintainer rule

If opening this project from scratch, start with:
1. this document for the design/programmatic architecture
2. `docs/SEO-EXPERIMENT-2026-09.md` for SEO experiment history and current treatment rules
3. `app/services/foundation-repair/[city]/page.tsx` for the current shared service-page composition
4. `lib/commercialSeoTreatments.ts` for treatment membership and treatment copy
5. the shared foundation components for presentation/business logic

The core rule is:

**One visual system + reusable components + structured local data + server-rendered SEO content.**

Do not solve a local city-page problem with one-off markup if the same need can be represented by a reusable component, content helper, or documented variant.


## Implementation log

### 2026-09-19 - first reusable component batch

The first design-system implementation batch is now present on `seo-build-validation`.

- `components/TrustBadges.tsx` remains the compatibility entry point used by existing pages, but its presentation has been redesigned as the approved premium credibility/specification strip rather than four generic circular-icon cards.
- `components/foundation/SoilIntelligence.tsx` is the first new component in the dedicated foundation component namespace.
- The shared city service template now delegates its mapped-soil presentation to `SoilIntelligence` instead of owning that large presentation block inline.
- Soil values, city, slug, ZIP, screening class, report availability, and locally generated intro copy are passed into the component as data. No city-specific styling was introduced.
- The soil panel keeps the mapped-data limitation visible and keeps the detailed soil-report link as real HTML.
- The existing `SoilRiskWidget` in the hero is a separate address-search interaction and was intentionally not folded into `SoilIntelligence` in this batch.

This batch establishes the intended pattern: extract shared presentation while preserving existing data sources, SEO semantics, treatment isolation, and business logic. Continue future migrations in small validated batches rather than rewriting the whole page at once.

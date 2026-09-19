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

The shared city hero is implemented in:
`components/foundation/FoundationHero.tsx`

It uses:
- local decorative asset `/foundation-hero-generated.webp`
- responsive background positioning to keep the house visible on mobile
- layered dark/left-side gradients for readable real HTML
- live `SoilRiskWidget` above the image
- real H1, paragraph, breadcrumb, links, and CTA
- no UI or text baked into the image

The city route now passes location and SEO-treatment-derived strings into the hero rather than owning the hero presentation CSS. Treatment membership and copy selection remain outside the component, preserving experiment isolation.

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


### 2026-09-19 - foundation signs interaction redesign

The shared `components/CrackAnalyzer.tsx` presentation was redesigned as the next design-system batch. It remains one reusable component for all city service pages and still receives only `city` and mapped PI context from the shared template.

The interaction now uses a light architectural selection panel paired with a dark interpretation panel, matching the premium visual rhythm established by the cinematic hero and Soil Intelligence component. Symptom choices remain observable homeowner signs, not diagnoses. Selecting a sign reveals cautious interpretation, mapped-soil context, and the existing evaluation path. The address field and symptom parameter remain real form controls submitted to `/book-analysis`.

No treatment-city membership, SEO metadata, city-specific styling, soil classification logic, or production data was changed in this batch.


### 2026-09-19 - foundation evidence sequence redesign

The shared `components/FoundationDiagram.tsx` was redesigned as a reusable evidence-to-repair sequence rather than a row of three generic dark cards. The component now combines a dark architectural explanation panel with a light three-stage decision sequence: measure movement, identify contributors, and compare repair scopes.

The presentation reinforces the commercial message that repair selection should follow property evidence while preserving the existing limitation that mapped soil data cannot prescribe a repair type or depth. All explanatory copy remains real HTML. No city-specific design logic, treatment membership, SEO metadata, production data, or repair recommendations were added.


### 2026-09-19 - foundation planning tool redesign

The shared `components/CostEstimator.tsx` was redesigned as a premium foundation planning and scope-decision interface. The component intentionally does not present a fabricated dollar estimate because the existing inputs do not support property-specific pricing. Instead, homeowners select the closest observable symptom pattern and receive a clear statement of what still needs to be checked and the appropriate next-step category.

The visual treatment now uses the same architectural light/dark rhythm as the Foundation Signs experience, with restrained blue as the shared action color. The city and mapped PI remain data inputs, the address and selected symptom continue through the existing `/book-analysis` form path, and all explanatory content remains real HTML.

No city-specific styling, treatment membership, pricing claims, SEO metadata, soil classification logic, or production data was changed.


### 2026-09-19 - repair options and conversion-break batch

Two additional reusable components now live in the dedicated foundation namespace:

- `components/foundation/RepairOptions.tsx`
- `components/foundation/EvaluationCTA.tsx`

The treatment-only repair-options block was extracted from the city template into `RepairOptions`. It presents support/piers, drainage correction, plumbing/leak work, and monitoring as distinct proposal categories while repeatedly tying selection to property evidence. The treatment guard remains in the shared city route, so this extraction does not expose the treatment-only section to control cities.

The former generic dark CTA block was replaced by `EvaluationCTA`, a reusable dark conversion break that reconnects the lower page to the premium hero language. It uses a single evaluation action plus concise trust points and does not claim a diagnosis, free service, engineering relationship, or guaranteed repair outcome.

The shared city template now orchestrates both components instead of owning their presentation markup. No treatment membership, SEO metadata, production data, or city-specific styling was changed.


### 2026-09-19 - cinematic hero extraction

The approved cinematic service hero was extracted into `components/foundation/FoundationHero.tsx`. The component now owns the hero image layers, responsive mobile/desktop background positioning, breadcrumb presentation, headline/description presentation, evaluation CTA, credibility labels, and the existing live `SoilRiskWidget` placement.

The shared city route remains responsible for selecting treatment versus control copy. It passes the resolved eyebrow, H1 lead, description, CTA label, state route, and location values into the component. This keeps SEO experiment membership and content logic outside the visual component while eliminating the large hero presentation block from the route.

The extraction intentionally preserves the approved `/foundation-hero-generated.webp` asset path and the mobile framing/overlay values that were visually approved. No treatment membership, metadata, production data, soil logic, or conversion destination was changed.


### 2026-09-19 - regional guidance and soil action-plan batch

The remaining mid-page context blocks were brought into the reusable design system.

- `components/foundation/RegionalFoundationGuide.tsx` now owns presentation for the structured state guidance from `lib/stateFoundationGuides.ts`. The city route passes the city and existing state guide into the component. Overview paragraphs, watch-for items, evaluation guidance, and the property-evidence limitation remain crawlable HTML.
- `components/SoilActionPlan.tsx` was visually redesigned without changing its input contract. It now uses a dark mapped-signal panel paired with a light practical next-step sequence for documenting symptoms, checking water conditions, and asking for evidence behind a proposed scope.
- The shared city route no longer contains the large inline regional-guidance markup.

No state-guide facts were rewritten in this batch. No city-specific styling, treatment membership, SEO metadata, production data, soil classification thresholds, or conversion destinations were changed.


### 2026-09-19 - FAQ and nearby-location batch

The lower service-page content is now part of the reusable foundation component system.

- `components/foundation/FoundationFAQ.tsx` owns the FAQ presentation. It preserves native `details`/`summary` HTML so answers remain server-rendered and accessible without adding client JavaScript. Questions and answers are still generated by the shared city route and passed in as content.
- `components/foundation/NearbyFoundationLocations.tsx` owns the nearby-city internal-link section. Every nearby location remains a normal Next.js link to the existing service URL, preserving crawlable internal linking while improving hierarchy and visual consistency.
- The city route no longer owns FAQ accordion styling or nearby-location card styling.

This batch does not change FAQ generation, neighbor selection, distances, service URLs, schema, treatment membership, metadata, production data, or indexability logic.


### 2026-09-19 - full service-page composition audit

A page-level audit was performed after the reusable component redesigns.

Changes made:
- The shared content column was widened from `max-w-4xl` to `max-w-5xl` so split-layout tools have adequate desktop breathing room while retaining responsive side padding.
- Mobile page padding and vertical entry spacing were tightened to reduce the feeling of stacked oversized cards on small screens.
- The remaining inline treatment-only local-focus block was extracted into `components/foundation/CommercialLocalFocus.tsx`. Treatment membership remains in the route, preserving the experiment boundary.
- The local-focus shortcuts remain normal anchor/link navigation to repair options, planning factors, and the evaluation path.
- The hero CTA received an explicit keyboard focus treatment and minimum target height.
- Existing native FAQ disclosure controls, semantic headings, breadcrumb navigation, crawlable nearby-city links, and server-rendered content were preserved.
- No additional client component was introduced during the audit. Interactive client JavaScript remains concentrated in the existing Foundation Signs and Foundation Planning tools (plus the pre-existing soil search widget).

Audit conclusions:
- Dark surfaces are now reserved for deliberate emphasis: the cinematic hero, evidence/soil-signal panels inside mixed sections, interactive interpretation panels, and the lower conversion break. The page does not need additional full-width dark sections.
- Component order is coherent for the intended journey: commercial context -> observable signs -> mapped evidence -> evaluation logic -> regional/local context -> repair comparison -> planning -> conversion -> FAQ -> nearby internal links.
- FAQ and nearby locations should remain low-interaction server components.
- Avoid further visual redesign until real mobile/desktop QA or performance data identifies a concrete issue.

Performance note:
- The cinematic background remains a CSS background because it is decorative and the approved composition depends on cover positioning. Its WebP should remain compressed and locally hosted. Do not add JavaScript or a duplicate image element solely for decoration without a measured LCP reason.

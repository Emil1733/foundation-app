export type CommercialSeoTreatment = {
  cohort: "treatment";
  title: (city: string, state: string) => string;
  eyebrow: (city: string, state: string) => string;
  h1Lead: string;
  hero: (city: string, state: string) => string;
  cta: string;
};

/**
 * GSC-supported commercial SEO experiment started 2026-09-17.
 *
 * Treatment URLs were selected because they already had meaningful impressions
 * and were generally close enough to page-one visibility that CTR/relevance
 * improvements can be measured without rewriting the whole programmatic site.
 *
 * Keep this list small until the experiment has enough post-change GSC data.
 * Controls documented in docs/SEO-EXPERIMENT-2026-09.md must not be added here
 * during the measurement window.
 */
export const COMMERCIAL_SEO_TREATMENTS: Record<string, CommercialSeoTreatment> = {
  "cedar-park-tx": createTreatment(),
  "allen-tx-75002": createTreatment(),
  "schertz-tx": createTreatment(),
  "boerne-tx": createTreatment(),
  "lewisville-tx": createTreatment(),
};

function createTreatment(): CommercialSeoTreatment {
  return {
    cohort: "treatment",
    title: (city, state) => `Foundation Repair ${city} ${state} | Evaluation & Options`,
    eyebrow: (city, state) => `Foundation Repair Guidance for ${city}, ${state}`,
    h1Lead: "Foundation Repair",
    hero: (city, state) =>
      `Seeing cracks, sticking doors, uneven floors, or other signs of movement in ${city}? Review warning signs, local soil context, and property-specific evaluation steps before choosing a foundation repair scope.`,
    cta: "Request a Foundation Evaluation",
  };
}

export function getCommercialSeoTreatment(slug: string) {
  return COMMERCIAL_SEO_TREATMENTS[slug] ?? null;
}

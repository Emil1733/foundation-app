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
 * Keep this list small until the experiment has enough post-change GSC data.
 * Controls in docs/SEO-EXPERIMENT-2026-09.md must not be added during the
 * initial measurement window.
 *
 * IMPORTANT: treatment keys must match target_locations.slug exactly.
 * The live Allen record is `allen-tx`; the earlier `allen-tx-75002` key did
 * not match the database-backed route and therefore never received treatment.
 */
export const COMMERCIAL_SEO_TREATMENTS: Record<string, CommercialSeoTreatment> = {
  "cedar-park-tx": createTreatment(),
  "allen-tx": createTreatment(),
  "schertz-tx": createTreatment(),
  "boerne-tx": createTreatment(),
  "lewisville-tx": createTreatment(),
};

function createTreatment(): CommercialSeoTreatment {
  return {
    cohort: "treatment",
    title: (city, state) => `Foundation Repair in ${city}, ${state} | Evaluation & Options`,
    eyebrow: (city, state) => `Foundation Repair Guidance for ${city}, ${state}`,
    h1Lead: "Foundation Repair",
    hero: (city) =>
      `Seeing cracks, sticking doors, uneven floors, or other signs of movement in ${city}? Review warning signs, local soil context, and property-specific evaluation steps before choosing a foundation repair scope.`,
    cta: "Request a Foundation Evaluation",
  };
}

export function getCommercialSeoTreatment(slug: string) {
  return COMMERCIAL_SEO_TREATMENTS[slug] ?? null;
}

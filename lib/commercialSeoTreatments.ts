export type CommercialSeoTreatment = {
  cohort: "treatment";
  title: (city: string, state: string) => string;
  eyebrow: (city: string, state: string) => string;
  h1Lead: string;
  hero: (city: string, state: string) => string;
  cta: string;
  localFocus: (city: string) => string;
};

/**
 * GSC-supported commercial SEO experiment started 2026-09-17.
 * Keep this list small until the experiment has enough post-change GSC data.
 * Controls in docs/SEO-EXPERIMENT-2026-09.md must not be added during the
 * initial measurement window.
 *
 * IMPORTANT: treatment keys must match target_locations.slug exactly.
 */
export const COMMERCIAL_SEO_TREATMENTS: Record<string, CommercialSeoTreatment> = {
  "cedar-park-tx": createTreatment(
    (city) => `For ${city} homeowners, the useful comparison is not simply pier type or advertised price. A repair proposal should connect the observed movement pattern, drainage conditions, floor elevations, and affected area to the recommended scope.`,
  ),
  "allen-tx": createTreatment(
    (city) => `In ${city}, compare foundation repair proposals against measured movement and water conditions at the property. Ask which areas are actually out of tolerance, what evidence shows ongoing movement, and why each proposed support is needed.`,
  ),
  "schertz-tx": createTreatment(
    (city) => `${city} sits in a part of Central Texas where mapped ground conditions can change over relatively short distances. Use the local soil record as context, then make the repair decision from property measurements, drainage, and the actual symptom pattern.`,
  ),
  "boerne-tx": createTreatment(
    (city) => `Around ${city}, slope, shallow rock, fill, drainage paths, and soil conditions can all matter. A useful repair evaluation should identify the likely movement mechanism before recommending piers, leveling, drainage work, or monitoring.`,
  ),
  "lewisville-tx": createTreatment(
    (city) => `For a ${city} home with cracks, sticking doors, or floor variation, compare dated symptoms with floor elevations and drainage before selecting a repair. The mapped soil record can strengthen that review, but it should not determine the repair by itself.`,
  ),
};

function createTreatment(localFocus: (city: string) => string): CommercialSeoTreatment {
  return {
    cohort: "treatment",
    title: (city, state) => `Foundation Repair ${city}, ${state} | Evaluation & Options`,
    eyebrow: (city, state) => `Foundation Repair in ${city}, ${state}`,
    h1Lead: "Foundation Repair",
    hero: (city) =>
      `Seeing cracks, uneven floors, sticking doors, or other signs of foundation movement in ${city}? Request an evaluation to understand what may be causing the problem and what repair options may make sense for your home.`,
    cta: "Request a Foundation Evaluation",
    localFocus,
  };
}

export function getCommercialSeoTreatment(slug: string) {
  return COMMERCIAL_SEO_TREATMENTS[slug] ?? null;
}

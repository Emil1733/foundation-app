export type CommercialSeoTreatment = {
  cohort: "treatment";
  title: (city: string, state: string) => string;
  description: (city: string, state: string) => string;
  eyebrow: (city: string, state: string) => string;
  h1Lead: string;
  hero: (city: string, state: string) => string;
  cta: string;
  localFocus: (city: string) => string;
  profile: CityFoundationProfile;
};

export type CityFoundationProfile = {
  mapUnitSymbol: string;
  kicker: string;
  heading: string;
  summary: string[];
  priorities: Array<{ label: string; copy: string }>;
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
  "cedar-park-tx": createTreatment({
    description: (city, state) => `Foundation repair in ${city}, ${state}: review warning signs, sloped-site drainage, mapped Eckrant clay, evaluation steps, and repair options for your home.`,
    localFocus: (city) => `For ${city} homeowners, the useful comparison is not simply pier type or advertised price. A repair proposal should connect the observed movement pattern, drainage conditions, floor elevations, and affected area to the recommended scope.`,
    profile: {
      mapUnitSymbol: "EaD",
      kicker: "Cedar Park property context",
      heading: "What the Cedar Park soil record changes about the evaluation",
      summary: [
        "The registry point for Cedar Park maps to Eckrant cobbly clay on 1 to 8 percent slopes. Its recorded Plasticity Index is 32, which makes moisture-related movement worth considering, while the slope range also puts runoff direction and grade changes on the checklist.",
        "That combination does not establish that a house needs piers. It means a useful evaluation should compare the side of the home showing symptoms with roof discharge, downhill drainage, exposed rock, landscaping, and measured floor elevations.",
      ],
      priorities: [
        { label: "Trace the water", copy: "Note where roof runoff and uphill drainage travel during a hard rain." },
        { label: "Check the grade", copy: "Look for movement concentrated near a slope, retaining feature, or cut-and-fill transition." },
        { label: "Demand a measured scope", copy: "Ask how elevations and the symptom pattern support each proposed repair location." },
      ],
    },
  }),
  "allen-tx": createTreatment({
    description: (city, state) => `Foundation repair in ${city}, ${state}: review warning signs, mapped Houston Black clay, drainage evidence, evaluation steps, and repair options for your home.`,
    localFocus: (city) => `In ${city}, compare foundation repair proposals against measured movement and water conditions at the property. Ask which areas are actually out of tolerance, what evidence shows ongoing movement, and why each proposed support is needed.`,
    profile: {
      mapUnitSymbol: "HoB",
      kicker: "Allen property context",
      heading: "Why moisture patterns deserve attention in an Allen evaluation",
      summary: [
        "The mapped registry point in Allen is Houston Black clay on 1 to 3 percent slopes, with a recorded Plasticity Index of 44. That is a strong screening signal for moisture sensitivity, but it is still area-level context rather than proof of movement at a particular address.",
        "The practical question is whether water conditions and the measured movement pattern line up. Compare dry and wet sides of the house, downspout discharge, irrigation, large vegetation, plumbing concerns, and changes documented over time before accepting a structural scope.",
      ],
      priorities: [
        { label: "Compare both sides", copy: "Look for a moisture imbalance rather than treating the entire perimeter as identical." },
        { label: "Separate symptoms from cause", copy: "Cracks and sticking doors matter most when they align with repeatable measurements." },
        { label: "Review the proposed supports", copy: "Each pier or stabilization point should correspond to the documented area of concern." },
      ],
    },
  }),
  "schertz-tx": createTreatment({
    description: (city, state) => `Foundation repair in ${city}, ${state}: understand warning signs, mapped Eddy clay loam, site drainage, evaluation steps, and repair options for your home.`,
    localFocus: (city) => `${city} sits in a part of Central Texas where mapped ground conditions can change over relatively short distances. Use the local soil record as context, then make the repair decision from property measurements, drainage, and the actual symptom pattern.`,
    profile: {
      mapUnitSymbol: "EgC",
      kicker: "Schertz property context",
      heading: "A Schertz foundation review should account for grade as well as soil",
      summary: [
        "The Schertz registry point maps to Eddy very gravelly clay loam on 3 to 8 percent slopes. Its recorded Plasticity Index is 18.52, a moderate screening signal that does not support treating every local crack as a severe expansive-clay problem.",
        "Because this map unit includes a noticeable slope range, drainage paths, erosion, placed fill, and movement near grade transitions deserve a close look. The repair discussion should explain whether the evidence points to moisture change, settlement, construction details, or a combination.",
      ],
      priorities: [
        { label: "Walk the drainage path", copy: "Check where stormwater enters, crosses, and leaves the lot." },
        { label: "Inspect transitions", copy: "Pay attention to additions, patios, utility trenches, and visible changes in grade." },
        { label: "Match the remedy to the cause", copy: "Ask why monitoring, drainage work, or structural support fits the observed mechanism." },
      ],
    },
  }),
  "boerne-tx": createTreatment({
    description: (city, state) => `Foundation repair in ${city}, ${state}: review warning signs, mapped Tarpley clay, Hill Country drainage, evaluation steps, and repair options for your home.`,
    localFocus: (city) => `Around ${city}, slope, shallow rock, fill, drainage paths, and soil conditions can all matter. A useful repair evaluation should identify the likely movement mechanism before recommending piers, leveling, drainage work, or monitoring.`,
    profile: {
      mapUnitSymbol: "18",
      kicker: "Boerne property context",
      heading: "Boerne sites call for more than a generic clay-soil explanation",
      summary: [
        "The mapped point for Boerne is Tarpley clay on 1 to 3 percent slopes, with a recorded Plasticity Index of 28.6. The record is useful evidence of moisture sensitivity, but Hill Country sites can also involve shallow rock, fill, and drainage shaped by the lot itself.",
        "Before choosing a repair, identify where movement is concentrated and whether it follows a slope, an addition, a drainage route, or a construction transition. A proposal should distinguish those site factors from broad claims about Texas clay.",
      ],
      priorities: [
        { label: "Read the lot", copy: "Document slope, exposed rock, retaining features, and where water collects or accelerates." },
        { label: "Locate the change", copy: "Compare symptoms with additions, filled areas, and transitions in floor elevation." },
        { label: "Ask what was ruled out", copy: "A credible scope should address drainage, leaks, and construction details before prescribing support." },
      ],
    },
  }),
  "lewisville-tx": createTreatment({
    description: (city, state) => `Foundation repair in ${city}, ${state}: review warning signs, mapped sandy loam, drainage evidence, evaluation steps, and repair options for your home.`,
    localFocus: (city) => `For a ${city} home with cracks, sticking doors, or floor variation, compare dated symptoms with floor elevations and drainage before selecting a repair. The mapped soil record can strengthen that review, but it should not determine the repair by itself.`,
    profile: {
      mapUnitSymbol: "50",
      kicker: "Lewisville property context",
      heading: "The Lewisville record argues against assuming every issue is expansive clay",
      summary: [
        "The registry point in Lewisville maps to Konsil fine sandy loam on 1 to 3 percent slopes. Its recorded Plasticity Index is 8.8, a lower screening result than the clay-rich units found in some other parts of North Texas.",
        "That does not rule out foundation movement. It changes the order of questions: check drainage, leaks, erosion, fill, additions, and construction transitions, then compare those conditions with elevations and symptoms before blaming high-plasticity clay or selecting a repair system.",
      ],
      priorities: [
        { label: "Avoid the metro-wide assumption", copy: "Use the mapped local record instead of treating all North Texas ground as the same clay." },
        { label: "Check localized causes", copy: "Look closely at plumbing routes, discharge points, additions, and disturbed fill." },
        { label: "Verify active movement", copy: "Use dated symptoms and repeatable measurements before committing to structural work." },
      ],
    },
  }),
};

function createTreatment({
  description,
  localFocus,
  profile,
}: Pick<CommercialSeoTreatment, "description" | "localFocus" | "profile">): CommercialSeoTreatment {
  return {
    cohort: "treatment",
    title: (city, state) => `Foundation Repair ${city}, ${state} | Evaluation & Options`,
    description,
    eyebrow: (city, state) => `Foundation Repair in ${city}, ${state}`,
    h1Lead: "Foundation Repair",
    hero: (city) =>
      `Seeing cracks, uneven floors, sticking doors, or other signs of foundation movement in ${city}? Request an evaluation to understand what may be causing the problem and what repair options may make sense for your home.`,
    cta: "Request a Foundation Evaluation",
    localFocus,
    profile,
  };
}

export function getCommercialSeoTreatment(slug: string) {
  return COMMERCIAL_SEO_TREATMENTS[slug] ?? null;
}

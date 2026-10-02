export type CommercialSeoTreatment = {
  cohort: "initial" | "second-wave";
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
  "katy-tx": createTreatment({
    cohort: "second-wave",
    description: (city, state) => `Foundation repair in ${city}, ${state}: review cracks, drainage, mapped Snakecreek sandy loam, evaluation steps, and repair options for your home.`,
    localFocus: (city) => `For a ${city} home, standing water, slow drainage, fill, and plumbing leaks may be more useful clues than a broad claim about Houston-area clay. Compare those conditions with floor elevations and the location of changing cracks before choosing a repair scope.`,
    profile: {
      mapUnitSymbol: "Bg",
      kicker: "Katy property context",
      heading: "The Katy record puts drainage ahead of a generic clay explanation",
      summary: [
        "The registry point in Katy maps to Snakecreek fine sandy loam on 0 to 1 percent slopes. The record identifies it as somewhat poorly drained and frequently flooded, with a Plasticity Index of 7. Those details point toward water movement and support conditions rather than a simple high-plasticity-clay assumption.",
        "That record does not mean a particular house has flooded or needs structural repair. It does mean the evaluation should look closely at ponding, roof discharge, plumbing routes, placed fill, and whether the observed movement is localized or continuing.",
      ],
      priorities: [
        { label: "Check where water lingers", copy: "Look for ponding, slow runoff, and discharge that stays close to the slab after rain." },
        { label: "Rule out localized loss of support", copy: "Compare symptoms with plumbing lines, filled areas, additions, and visibly disturbed ground." },
        { label: "Confirm movement before repair", copy: "Use elevations and dated observations to separate an active problem from an old, stable crack." },
      ],
    },
  }),
  "cypress-tx": createTreatment({
    cohort: "second-wave",
    description: (city, state) => `Foundation repair in ${city}, ${state}: review cracks, drainage, mapped Clodine soil, evaluation steps, and repair options for your home.`,
    localFocus: (city) => `In ${city}, a useful proposal should explain how drainage, plumbing, fill, and measured movement relate to the part of the home showing symptoms. The mapped record adds context, but it should not be used by itself to sell a whole-house repair.`,
    profile: {
      mapUnitSymbol: "Ce",
      kicker: "Cypress property context",
      heading: "Why drainage belongs near the top of a Cypress evaluation",
      summary: [
        "The Cypress registry point maps to a Clodine-Urban land complex on 0 to 1 percent slopes. It is recorded as somewhat poorly drained, with a Plasticity Index of 5.24. That lower PI does not rule out movement, but it makes a blanket expansive-clay explanation less persuasive.",
        "On a nearly level site, water can remain near the foundation when grading, discharge, or drainage is inadequate. An evaluation should compare those conditions with cracks, floor elevations, plumbing routes, and construction transitions before recommending stabilization.",
      ],
      priorities: [
        { label: "Inspect after rain", copy: "Note ponding, saturated landscaping, and downspouts that discharge beside the foundation." },
        { label: "Look for a localized cause", copy: "Check whether movement follows a plumbing route, addition, low area, or disturbed fill." },
        { label: "Ask for the measured pattern", copy: "A repair scope should identify where movement was measured and why each support is proposed." },
      ],
    },
  }),
  "cleburne-tx": createTreatment({
    cohort: "second-wave",
    description: (city, state) => `Foundation repair in ${city}, ${state}: review cracks, mapped Ponder soil, moisture conditions, evaluation steps, and repair options for your home.`,
    localFocus: (city) => `For a ${city} property, compare the repair proposal with the measured direction of movement and the way water is managed around the slab. The recommendation should explain whether drainage work, monitoring, or structural support fits the evidence.`,
    profile: {
      mapUnitSymbol: "PoB",
      kicker: "Cleburne property context",
      heading: "The Cleburne record makes uneven moisture worth investigating",
      summary: [
        "The registry point in Cleburne maps to the Ponder-Urban land complex on 1 to 3 percent slopes. Its recorded Plasticity Index is 30.84, a high screening result that makes changes in soil moisture relevant to a foundation review.",
        "The map still cannot determine what is happening beneath an individual house. Compare wet and dry sides of the foundation, roof discharge, vegetation, plumbing concerns, and floor elevations to see whether the symptoms form a consistent movement pattern.",
      ],
      priorities: [
        { label: "Compare moisture conditions", copy: "Look for a persistent wet side, a dry side, or concentrated irrigation near the affected area." },
        { label: "Map the symptoms", copy: "Check whether cracks, sticking openings, and elevation changes point to the same part of the house." },
        { label: "Require a specific scope", copy: "Ask how each proposed repair location corresponds to documented movement." },
      ],
    },
  }),
  "sugar-land-tx": createTreatment({
    cohort: "second-wave",
    description: (city, state) => `Foundation repair in ${city}, ${state}: review warning signs, mapped Pledger clay, drainage evidence, evaluation steps, and repair options.`,
    localFocus: (city) => `In ${city}, clay-related movement is a reasonable question, but the repair decision still needs property evidence. Compare moisture conditions, floor elevations, plumbing concerns, and changes over time before accepting a pier layout or leveling plan.`,
    profile: {
      mapUnitSymbol: "Pa",
      kicker: "Sugar Land property context",
      heading: "The Sugar Land record supports a closer look at moisture patterns",
      summary: [
        "The Sugar Land registry point maps to Pledger clay on 0 to 1 percent slopes, with a recorded Plasticity Index of 48.08. That is a severe screening result for moisture sensitivity, although it does not establish that a particular foundation is moving.",
        "Because the mapped ground is nearly level, small grading and drainage differences can matter around the building footprint. A useful evaluation should compare water sources and dry areas with floor elevations, crack history, vegetation, and plumbing evidence.",
      ],
      priorities: [
        { label: "Look for imbalance", copy: "Compare irrigation, shade, roof discharge, and soil moisture around all sides of the home." },
        { label: "Document change", copy: "Use dates and repeatable measurements instead of relying on one crack or one visit." },
        { label: "Review every proposed support", copy: "The repair layout should follow the measured movement pattern, not a standard spacing plan." },
      ],
    },
  }),
  "mesquite-tx": createTreatment({
    cohort: "second-wave",
    description: (city, state) => `Foundation repair in ${city}, ${state}: review cracks, mapped Heiden clay, slope and drainage evidence, evaluation steps, and repair options.`,
    localFocus: (city) => `For a ${city} home, soil moisture and drainage deserve attention, especially where the lot slopes or shows erosion. A credible proposal should connect those site conditions and measured floor movement to the recommended repair area.`,
    profile: {
      mapUnitSymbol: "42",
      kicker: "Mesquite property context",
      heading: "Mesquite evaluations should consider both clay movement and erosion",
      summary: [
        "The registry point in Mesquite maps to moderately eroded Heiden clay on 2 to 5 percent slopes. Its recorded Plasticity Index is 40, a severe screening result for moisture sensitivity, while the mapped slope and erosion description also make runoff direction relevant.",
        "Those facts are context, not a diagnosis. The property review should determine whether symptoms align with moisture differences, downhill drainage, erosion, a plumbing concern, or a construction transition before a structural repair is selected.",
      ],
      priorities: [
        { label: "Follow the runoff", copy: "Identify where water accelerates, collects, or carries soil away during heavy rain." },
        { label: "Compare high and low sides", copy: "Check whether symptoms and elevations correspond to the lot's slope or an eroded area." },
        { label: "Separate cause from symptom", copy: "Ask whether water control, monitoring, or structural support addresses the documented mechanism." },
      ],
    },
  }),
  "fort-gaines-ga": createTreatment({
    cohort: "second-wave",
    description: (city, state) => `Foundation repair in ${city}, ${state}: review cracks, drainage, mapped Troup loamy sand, evaluation steps, and repair options for your home.`,
    localFocus: (city) => `Around ${city}, sandy soil, runoff, erosion, fill, and plumbing leaks can matter more than a generic red-clay explanation. Compare the affected area with the lot and floor-elevation pattern before deciding that piers or leveling are warranted.`,
    profile: {
      mapUnitSymbol: "TrB",
      kicker: "Fort Gaines property context",
      heading: "The Fort Gaines record points away from a one-size-fits-all clay story",
      summary: [
        "The Fort Gaines registry point maps to Troup loamy sand on 0 to 5 percent slopes. It is recorded as somewhat excessively drained, with a Plasticity Index of 0. That makes a high-plasticity-clay explanation a poor fit for this mapped point.",
        "Foundation movement can still occur where water erodes support, fill settles, plumbing leaks, or construction crosses changing ground. The useful question is whether one of those conditions matches the location and direction of measured movement at the property.",
      ],
      priorities: [
        { label: "Check for soil loss", copy: "Look for washout, erosion channels, exposed edges, or runoff concentrated near the foundation." },
        { label: "Inspect construction transitions", copy: "Pay attention to additions, utility trenches, porches, and areas likely built on fill." },
        { label: "Verify the proposed cause", copy: "Ask what evidence supports the diagnosis before selecting a stabilization method." },
      ],
    },
  }),
  "ellaville-ga": createTreatment({
    cohort: "second-wave",
    description: (city, state) => `Foundation repair in ${city}, ${state}: review cracks, mapped Orangeburg loamy sand, drainage, evaluation steps, and repair options.`,
    localFocus: (city) => `For a ${city} property, do not assume every foundation symptom comes from expansive red clay. Review drainage, erosion, fill, plumbing, and floor elevations together so the proposed repair matches the actual area of concern.`,
    profile: {
      mapUnitSymbol: "OeA",
      kicker: "Ellaville property context",
      heading: "The Ellaville record calls for evidence beyond the usual red-clay assumption",
      summary: [
        "The registry point in Ellaville maps to well-drained Orangeburg loamy sand on 0 to 2 percent slopes. Its recorded Plasticity Index is 10.08, a lower screening result than the clay-rich units often associated with foundation movement.",
        "That does not rule out settlement or another foundation concern. Drainage concentration, erosion, poorly compacted fill, leaks, and construction transitions can still affect support, so the evaluation should test those possibilities against the measured movement pattern.",
      ],
      priorities: [
        { label: "Look beyond the soil label", copy: "Check drainage, plumbing, fill, and construction history instead of assuming expansive clay." },
        { label: "Locate the affected area", copy: "Compare cracks and sticking openings with elevations and exterior conditions nearby." },
        { label: "Match repair to evidence", copy: "Ask why the proposed method fits the observed cause and the limited area involved." },
      ],
    },
  }),
};

function createTreatment({
  cohort = "initial",
  description,
  localFocus,
  profile,
}: Pick<CommercialSeoTreatment, "description" | "localFocus" | "profile"> & { cohort?: CommercialSeoTreatment["cohort"] }): CommercialSeoTreatment {
  return {
    cohort,
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

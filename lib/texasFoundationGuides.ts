import type { StateFoundationGuide } from "@/lib/stateFoundationGuides";

export type TexasFoundationGuide = StateFoundationGuide & {
  region: string;
  sources: Array<{ label: string; url: string }>;
};

const physicalRegions = { label: "Physical Regions of Texas", url: "https://www.texasalmanac.com/articles/physical-regions" };
const texasSoils = { label: "Soils of Texas", url: "https://www.texasalmanac.com/articles/soils-of-texas" };

const guides: Record<string, TexasFoundationGuide> = {
  north: {
    name: "North Texas and the Blackland Prairie", region: "north", sources: [physicalRegions, texasSoils],
    overview: [
      "Across much of North Texas, the Blackland belt meets the Cross Timbers and North Central Plains. That change can happen over a fairly short drive, so it is a mistake to assume every Dallas–Fort Worth property sits on the same kind of clay. The mapped soil unit on this page is more useful than a metro-wide label.",
      "Where clay-rich soil is present, changes in moisture deserve attention. Roof runoff, a leak, thirsty vegetation, or a long dry spell can affect one side of a house differently from another. That unevenness matters more than the simple fact that North Texas has hot summers and heavy rain at times.",
    ],
    watchFor: ["Cracks or trim gaps that change through wet and dry periods", "Several doors beginning to bind in the same part of the house", "Ponding, erosion, or concentrated downspout discharge beside the slab"],
    evaluation: "Compare dated observations with drainage conditions and floor elevations. A repair proposal should explain the measured pattern of movement and why the recommended system fits it.",
  },
  central: {
    name: "Central Texas and the Balcones region", region: "central", sources: [physicalRegions, { label: "USGS South-Central Texas setting", url: "https://pubs.usgs.gov/circ/circ1212/introduction.htm" }],
    overview: [
      "Central Texas sits across a real landscape transition. The Balcones Escarpment separates the Edwards Plateau from the lower Gulf Coastal Plain, and communities along the corridor can encounter shallow limestone, deeper clay, or placed fill. Those conditions call for different questions; they do not point automatically to one repair method.",
      "Sloping lots, rock close to the surface, drainage paths, and the boundary between cut and fill can all influence how a foundation behaves. The USDA map unit provides a starting point, but measurements at the house are needed to tell soil movement from construction, drainage, or plumbing problems.",
    ],
    watchFor: ["Movement concentrated near a slope or a cut-and-fill transition", "Water repeatedly crossing or collecting beside one part of the foundation", "Cracks that reopen while nearby doors or floor levels also change"],
    evaluation: "Document the lot, drainage, and elevation pattern before discussing piers or leveling. Where shallow rock or a steep grade is involved, structural or geotechnical input may be appropriate.",
  },
  gulf: {
    name: "the Texas Gulf Coast", region: "gulf", sources: [physicalRegions, { label: "Texas Water Development Board: Gulf Coast Aquifer", url: "https://www.twdb.texas.gov/groundwater/aquifer/majors/gulf-coast.asp" }],
    overview: [
      "The Gulf Coast is generally low and gently sloping, but its ground is not uniform. Coastal prairie clay, sand, river deposits, urban fill, and poorly drained areas can occur across the region. Near Houston and Galveston, regional land subsidence is also documented, although that does not diagnose movement at an individual house.",
      "Water management is often the first practical issue to check. Intense rain, slow drainage, plumbing leaks, and fill placed during development can each affect support beneath a slab. A soil name by itself cannot separate those causes.",
    ],
    watchFor: ["Standing water, erosion, or soil loss after heavy rain", "Localized settlement near plumbing routes, additions, or filled ground", "Changes that continue after an obvious drainage or leak problem is corrected"],
    evaluation: "Start with drainage and leak checks, then compare the symptom pattern with floor elevations. In subsidence areas, distinguish broad regional lowering from movement within the building footprint.",
  },
  east: {
    name: "East Texas", region: "east", sources: [physicalRegions, texasSoils],
    overview: [
      "East Texas includes the Pine Belt and adjoining Post Oak country, where sandy surface soils, clayey subsoils, slopes, and stream bottoms create more variety than the phrase “Texas clay” suggests. A mapped unit with loam or sand should not be described as if it behaves like deep Blackland clay.",
      "On wooded or rolling sites, runoff, erosion, roots, and changes made during grading may be as important as shrink-swell potential. The useful evidence comes from how water moves across the lot and whether the house is changing over time.",
    ],
    watchFor: ["Erosion or soft ground on the downhill side of the house", "Localized changes near large trees, drainage swales, or disturbed fill", "Cracks accompanied by a measurable change in floor level"],
    evaluation: "Walk the drainage path and note slopes, fill, vegetation, and plumbing before selecting a repair. The proposed scope should match the affected area rather than assuming whole-house movement.",
  },
  west: {
    name: "West Texas and the High Plains", region: "west", sources: [physicalRegions, texasSoils],
    overview: [
      "West Texas spans the High Plains, Rolling Plains, plateau country, and the Trans-Pecos. Rainfall is generally lower and more variable than in eastern Texas, while local ground may range from deep agricultural soil to caliche, shallow rock, or valley deposits. There is no single “West Texas soil” response.",
      "Long dry periods can make irrigation and plumbing leaks stand out because they wet small areas of otherwise dry ground. At the same time, poor compaction, erosion, and construction across changing material can produce settlement that is not caused by expansive clay.",
    ],
    watchFor: ["A wet area beside an otherwise dry foundation perimeter", "Settlement near utility trenches, additions, or placed fill", "Changes following a leak, concentrated irrigation, or an unusually wet period"],
    evaluation: "Check for leaks and uneven water application, then document elevations and construction transitions. Do not prescribe moisture control or underpinning until the likely mechanism is supported by site evidence.",
  },
  south: {
    name: "South Texas and the Rio Grande Plain", region: "south", sources: [physicalRegions, texasSoils],
    overview: [
      "South Texas includes the Rio Grande Plain, Brush Country, the Coastal Bend, and the Lower Valley. The region becomes drier inland, while river, coastal, and irrigated areas can have very different moisture conditions. A city label alone is not enough to describe the ground beneath a house.",
      "Irrigation, drainage after intense storms, leaking lines, and fill used to shape a lot can create sharp moisture differences around a slab. In the Lower Valley and near waterways, alluvial material adds another reason to rely on the mapped unit and property measurements rather than a statewide clay claim.",
    ],
    watchFor: ["Movement concentrated beside irrigated landscaping or a suspected leak", "Ponding or erosion after a short, intense storm", "Separation that progresses in one area instead of remaining stable"],
    evaluation: "Compare water sources, grading, crack history, and floor elevations. Any repair recommendation should identify the observed cause and explain why drainage work, monitoring, or structural work is justified.",
  },
};

export function getTexasFoundationGuide(latitude: number, longitude: number): TexasFoundationGuide {
  if (latitude < 29.2) return guides.south;
  if (latitude >= 29.2 && latitude < 31.5 && longitude >= -100 && longitude <= -97.3) return guides.central;
  if (latitude < 30.7 && longitude > -97.3) return guides.gulf;
  if (longitude > -95.6) return guides.east;
  if (latitude >= 31.2 && longitude > -98.4) return guides.north;
  return guides.west;
}

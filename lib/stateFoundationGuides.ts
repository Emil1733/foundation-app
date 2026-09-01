export type StateFoundationGuide = {
    overview: string[];
    watchFor: string[];
    evaluation: string;
};

export const STATE_FOUNDATION_GUIDES: Record<string, StateFoundationGuide> = {
    AZ: {
        overview: [
            "Arizona's dry climate can make the ground look predictable, but foundations are often stressed by uneven moisture rather than rainfall alone. Irrigation, a plumbing leak, or runoff concentrated beside one corner of a slab can wet soil that has remained dry elsewhere. That contrast matters more than a simple statewide label such as \"desert soil.\"",
            "The Arizona locations in this registry commonly include Laveen and Gilman loams, along with localized clay loam and sandy loam. Those materials do not behave identically. Before recommending piers or leveling, an evaluation should consider the mapped soil, site drainage, landscaping, and the pattern of movement inside the home.",
        ],
        watchFor: [
            "Diagonal cracks that continue through more than a surface finish",
            "Doors that bind seasonally or floors that change slope across one room",
            "Persistent water near the slab from irrigation, grading, or a suspected leak",
        ],
        evaluation: "Start with drainage and leak checks, then document elevations and crack patterns. Repair should be based on evidence of active structural movement—not on one isolated crack or a soil map by itself.",
    },
    CO: {
        overview: [
            "Colorado foundation conditions vary sharply between the Front Range, plains, mountain valleys, and Western Slope. Along the Front Range, development may cross loam, clay-rich material, or weathered bedrock within a short distance. Snowmelt, summer storms, dry periods, and grading can then create very different moisture conditions around the same house.",
            "Registry records frequently identify Nunn, Ascalon, Weld, Vona, and Kim soils. Many mapped locations are moderate risk, while some carry high or severe ratings. That mix is why a statewide claim about \"Colorado soil\" is not useful enough for a repair decision. The local map unit and the building site's drainage history deserve more weight.",
        ],
        watchFor: [
            "Stair-step masonry cracks or drywall cracks that reopen after repair",
            "Basement-wall movement, especially where surface water drains toward the house",
            "Changes that follow snowmelt, heavy rain, or prolonged dry weather",
        ],
        evaluation: "A useful assessment separates slab or footing movement from cosmetic shrinkage and basement-wall pressure. Elevation measurements, drainage observations, and local soil information should agree before structural work is proposed.",
    },
    FL: {
        overview: [
            "Much of Florida's mapped residential ground is sandy rather than highly expansive clay. In this registry, Candler, Myakka, Tavares, and Astatula sands appear often. Sand can drain well, but it can also lose support when water is poorly controlled, fill is inadequately compacted, or a plumbing and drainage problem carries fine material away.",
            "Florida's intense rainfall and high seasonal groundwater make water management central to foundation performance. A crack does not automatically mean the soil is swelling, and a generic clay-based repair explanation may miss the real cause. The site's grading, gutters, downspouts, drainage paths, and history of nearby excavation all provide useful context.",
        ],
        watchFor: [
            "Localized floor settlement near plumbing runs, additions, or poorly compacted fill",
            "Erosion, standing water, or soil loss beside the slab after heavy rain",
            "Cracks or door misalignment that are widening rather than remaining stable",
        ],
        evaluation: "First rule out active leaks and drainage failures. If movement is measurable, the next step may include floor-elevation mapping and a site-specific geotechnical or structural review before selecting a stabilization method.",
    },
    GA: {
        overview: [
            "Georgia's familiar red ground is not one uniform soil. Registry locations commonly include Cecil, Madison, and Appling soils, particularly across the Piedmont. These weathered soils may provide good support when undisturbed and properly drained, but cut-and-fill construction, erosion, slope runoff, and uneven moisture can create localized settlement.",
            "Conditions also change from the mountains to the Piedmont and Coastal Plain, so a repair approach that fits one part of Georgia may be wrong in another. The useful question is not simply whether a home sits on \"red clay,\" but how the mapped soil, lot grading, fill history, and observed movement fit together.",
        ],
        watchFor: [
            "Stair-step brick cracks or separation around exterior openings",
            "Settlement where a house, porch, or driveway crosses cut and fill",
            "Erosion channels, soft ground, or downspouts discharging beside the foundation",
        ],
        evaluation: "Correct obvious water-control problems first and track whether cracks are changing. When symptoms are progressive, elevation data and an independent structural evaluation can distinguish active foundation movement from normal material shrinkage.",
    },
};

import { AlertTriangle, Droplets, ArrowDown, CheckCircle2 } from "lucide-react";

interface SoilActionPlanProps {
    soil: {
        plasticity_index: number;
        shrink_swell_potential: number;
        risk_level: string;
        map_unit_name: string;
    } | null;
    city: string;
}

export default function SoilActionPlan({ soil, city }: SoilActionPlanProps) {
    if (!soil) return null;

    const pi = Number(soil.plasticity_index);
    const isSevere = pi > 35;
    const isHigh = pi > 20 && pi <= 35;
    const isModerate = pi <= 20;

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 my-10">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
                Engineer's Action Plan for {city}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* DYNAMIC ADVICE BLOCK */}
                <div>
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        {isSevere ? (
                            <><AlertTriangle className="w-5 h-5 text-red-500" /> Critical Swell Protocol</>
                        ) : isHigh ? (
                            <><ArrowDown className="w-5 h-5 text-orange-500" /> Active Zone Management</>
                        ) : (
                            <><Droplets className="w-5 h-5 text-blue-500" /> Moisture Maintenance</>
                        )}
                    </h4>

                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {isSevere && (
                            `The ${soil.map_unit_name} in your area has a Plasticity Index of ${pi.toFixed(1)}, which is considered EXTREME. Shallow repairs (concrete pressed pilings) have a 60% failure rate here because the active zone extends deeper than 12 feet.`
                        )}
                        {isHigh && (
                            `With a Plasticity Index of ${pi.toFixed(1)}, this soil expands with enough force to lift a 40-ton slab. The priority is bypassing this "active zone" using steel piers locked into load-bearing strata.`
                        )}
                        {isModerate && (
                            `Your soil Risk Level is Moderate (PI: ${pi.toFixed(1)}). Major structural failure is less likely if drainage is managed correctly. Ensure gutters extend 5ft from the foundation.`
                        )}
                    </p>

                    <ul className="space-y-2">
                        {isSevere && (
                            <>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <strong>Require:</strong> Double-walled steel piers.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <strong>Avoid:</strong> Concrete cylinders (too much friction).
                                </li>
                            </>
                        )}
                        {isHigh && (
                            <>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <strong>Recommendation:</strong> Deep steel piers.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <strong>Focus:</strong> Soaker hoses in summer.
                                </li>
                            </>
                        )}
                        {isModerate && (
                            <>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <strong>Focus:</strong> Root barriers for large trees.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <strong>Routine:</strong> Bi-annual plumb level checks.
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                {/* VISUAL CONTEXT - Always distinct based on risk */}
                <div className={`p-6 rounded-xl border ${isSevere ? 'bg-red-50 border-red-100' : isHigh ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Geological Verdict
                    </span>
                    <div className="mt-4">
                        <div className="text-4xl font-extrabold text-slate-900 mb-2">
                            {isSevere ? "UNSTABLE" : isHigh ? "ACTIVE" : "MANAGEABLE"}
                        </div>
                        <p className="text-sm text-slate-600">
                            {isSevere
                                ? "This zip code requires P.E. oversight for all repairs."
                                : isHigh
                                    ? "Standard piering methods are effective if depth is verified."
                                    : "Preventative maintenance is the highest ROI strategy here."
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
                Foundation Next-Step Plan for {city}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* DYNAMIC ADVICE BLOCK */}
                <div>
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        {isSevere ? (
                            <><AlertTriangle className="w-5 h-5 text-red-500" /> Higher-Sensitivity Soil Context</>
                        ) : isHigh ? (
                            <><ArrowDown className="w-5 h-5 text-orange-500" /> Movement and Moisture Review</>
                        ) : (
                            <><Droplets className="w-5 h-5 text-blue-500" /> Practical Monitoring</>
                        )}
                    </h4>

                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {isSevere && (
                            `The mapped ${soil.map_unit_name} has a Plasticity Index of ${pi.toFixed(1)}. Higher plasticity can increase sensitivity to moisture change, but it does not identify the soil directly beneath a home or determine a repair method.`
                        )}
                        {isHigh && (
                            `The mapped Plasticity Index of ${pi.toFixed(1)} makes drainage, plumbing history, crack progression, and floor-elevation measurements especially useful when evaluating possible movement.`
                        )}
                        {isModerate && (
                            `The mapped Plasticity Index is ${pi.toFixed(1)}. Soil-related movement may be less pronounced, but drainage, fill, erosion, plumbing leaks, and construction details can still affect foundation support.`
                        )}
                    </p>

                    <ul className="space-y-2">
                        {isSevere && (
                            <>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <strong>Document:</strong> Date and measure cracks, sticking openings, and floor changes.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <strong>Ask:</strong> What property-specific evidence supports the proposed repair scope?
                                </li>
                            </>
                        )}
                        {isHigh && (
                            <>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <strong>Check:</strong> Roof runoff, grading, irrigation, and possible plumbing leaks.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <strong>Compare:</strong> Floor elevations and observed changes before selecting repairs.
                                </li>
                            </>
                        )}
                        {isModerate && (
                            <>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <strong>Maintain:</strong> Consistent drainage and discharge water away from the structure.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                    <strong>Monitor:</strong> Photograph changes over time and seek an evaluation if they progress.
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                {/* VISUAL CONTEXT - Always distinct based on risk */}
                <div className={`p-6 rounded-xl border ${isSevere ? 'bg-red-50 border-red-100' : isHigh ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Mapped Soil Signal
                    </span>
                    <div className="mt-4">
                        <div className="text-4xl font-extrabold text-slate-900 mb-2">
                            {isSevere ? "HIGHER" : isHigh ? "ELEVATED" : "MODERATE"}
                        </div>
                        <p className="text-sm text-slate-600">
                            {isSevere
                                ? "A property evaluation should establish whether movement is active before a repair is selected."
                                : isHigh
                                    ? "Use the map as context, then compare it with drainage, symptoms, and measurements at the home."
                                    : "Monitor visible changes and address water-control problems before drawing structural conclusions."
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

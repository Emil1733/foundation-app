import { AlertTriangle, Droplets, ArrowDown, CheckCircle2 } from "lucide-react";

interface SoilActionPlanProps {
    soil?: {
        plasticity_index: number | string | null;
        shrink_swell_potential: number | string | null;
        risk_level: string | null;
        map_unit_name: string | null;
    } | null;
    city: string;
    riskLevel?: string;
}

export default function SoilActionPlan({ soil, city, riskLevel }: SoilActionPlanProps) {
    const rawPi = soil?.plasticity_index;\n    const parsedPi = rawPi === null || rawPi === undefined || rawPi === "" ? null : Number(rawPi);\n    const pi = parsedPi !== null && Number.isFinite(parsedPi) && parsedPi >= 0 ? parsedPi : null;
    const screeningClass = riskLevel || soil?.risk_level || "Not classified";
    const isSevere = screeningClass === "Severe";
    const isHigh = screeningClass === "High";
    const isModerate = screeningClass === "Moderate" || screeningClass === "Lower";

    if (!soil && screeningClass === "Not classified") return null;

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 my-10">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Foundation Next-Step Plan for {city}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        {isSevere ? <><AlertTriangle className="w-5 h-5 text-red-500" /> Higher-Sensitivity Soil Context</>
                            : isHigh ? <><ArrowDown className="w-5 h-5 text-orange-500" /> Movement and Moisture Review</>
                            : <><Droplets className="w-5 h-5 text-blue-500" /> Practical Monitoring</>}
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {soil && pi !== null
                            ? `The mapped ${soil.map_unit_name || "soil"} record has a Plasticity Index of ${pi.toFixed(1)} and a ${screeningClass.toLowerCase()} registry screening classification. This is mapped context, not a property diagnosis or repair prescription.`
                            : `The mapped screening class for this location is ${screeningClass.toLowerCase()}. Use it as context alongside property-specific drainage, symptoms, measurements, and construction details.`}
                    </p>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" /><span><strong>Document:</strong> Date and measure cracks, sticking openings, and floor changes.</span></li>
                        <li className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" /><span><strong>Check:</strong> Roof runoff, grading, irrigation, and possible plumbing leaks.</span></li>
                        <li className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" /><span><strong>Ask:</strong> What property-specific evidence supports the proposed repair scope?</span></li>
                    </ul>
                </div>
                <div className={`p-6 rounded-xl border ${isSevere ? 'bg-red-50 border-red-100' : isHigh ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mapped Soil Signal</span>
                    <div className="mt-4">
                        <div className="text-4xl font-extrabold text-slate-900 mb-2">{screeningClass.toUpperCase()}</div>
                        <p className="text-sm text-slate-600">
                            {isSevere || isHigh
                                ? "Compare the mapped context with drainage, symptoms, and measurements at the home before selecting a repair."
                                : isModerate
                                    ? "Monitor visible changes and address water-control problems before drawing structural conclusions."
                                    : "Property-specific evidence is required before drawing structural conclusions."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

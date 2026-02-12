'use client';

import { useState } from 'react';
import { ArrowUpRight, ArrowRight, Minus, Maximize2, X, AlertTriangle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

type CrackType = 'diagonal' | 'stairstep' | 'horizontal';

export default function VisualProofGallery() {
    const [activeType, setActiveType] = useState<CrackType | null>(null);

    const cracks = {
        diagonal: {
            id: 'diagonal',
            title: "Diagonal Shear Crack",
            location: "Interior Drywall (above doors/windows)",
            cause: "Differential Settlement",
            severity: "HIGH",
            description: "Occurs when one part of the foundation drops while the other remains stable. The 'vector' of the crack points to the settling corner. In expansive clay zones, this is often caused by 'corner drop' during dry seasons when the soil shrinks away from the slab perimeter.",
            risk_pi: "> 25",
            icon: <ArrowUpRight className="w-16 h-16 text-slate-300 stroke-[1]" />,
            technical_note: "Refer to ASCE 7-22 for structural deflection limits."
        },
        stairstep: {
            id: 'stairstep',
            title: "Stair-Step Fracture",
            location: "Exterior Brick Veneer",
            cause: "Masonry Bond Failure",
            severity: "MODERATE",
            description: "Bricks rotate as the beam deflects. If the gap is wider at the top than the bottom, the corner is dropping. This is a classic forensic signature of a rotating grade beam. If the crack passes through the bricks (shear) rather than the mortar (bond), it indicates a higher rate of movement.",
            risk_pi: "> 15",
            icon: <div className="flex flex-col gap-1 items-center justify-center w-16 h-16 opacity-30">
                <div className="flex gap-1"><div className="w-4 h-2 bg-slate-400"></div><div className="w-4 h-2 bg-slate-400"></div></div>
                <div className="flex gap-1 pl-4"><div className="w-4 h-2 bg-slate-400"></div><div className="w-4 h-2 bg-slate-400"></div></div>
                <div className="flex gap-1 pl-8"><div className="w-4 h-2 bg-slate-400"></div><div className="w-4 h-2 bg-slate-400"></div></div>
            </div>,
            technical_note: "Verify mortar type (Type N vs S) for historical masonry forensic analysis."
        },
        horizontal: {
            id: 'horizontal',
            title: "Horizontal Bowing",
            location: "Basement Walls / Stem Walls",
            cause: "Hydrostatic Pressure",
            severity: "CRITICAL",
            description: "Expansive clay soil pushing laterally against the wall. This is a sign of potential wall collapse. The lateral load from saturated clay can exceed 100 PSF per foot of depth, far exceeding the design capacity of unreinforced CMU walls. This requires immediate carbon fiber stabilization or steel I-beams.",
            risk_pi: "> 35",
            icon: <Minus className="w-16 h-16 text-slate-300 stroke-[1]" />,
            technical_note: "Immediate forensic structural inspection required."
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-6 text-white text-center">
                <h3 className="text-xl font-bold">Forensic Crack Identification Guide</h3>
                <p className="text-slate-400 text-sm">Match your symptoms to engineering failure modes.</p>
            </div>

            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {(Object.keys(cracks) as CrackType[]).map((key) => {
                    const item = cracks[key];
                    return (
                        <div key={key} className="p-6 hover:bg-slate-50 transition group cursor-pointer" onClick={() => setActiveType(key)}>
                            <div className="h-40 bg-slate-900 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden ring-4 ring-transparent group-hover:ring-blue-100 transition">
                                {/* Placeholder / Icon Presentation */}
                                {item.icon}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-slate-900/50 backdrop-blur-sm">
                                    <span className="text-white text-xs font-bold flex items-center gap-1">
                                        <Maximize2 className="w-4 h-4" /> View Analysis
                                    </span>
                                </div>
                            </div>

                            <h4 className="font-bold text-slate-900 text-lg mb-1">{item.title}</h4>
                            <div className="text-xs font-mono text-slate-500 mb-3">{item.location}</div>

                            <div className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                item.severity === 'CRITICAL' ? "bg-red-100 text-red-800" :
                                    item.severity === 'HIGH' ? "bg-orange-100 text-orange-800" :
                                        "bg-yellow-100 text-yellow-800"
                            )}>
                                {item.severity} SEVERITY
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* DETAIL MODAL */}
            {activeType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setActiveType(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setActiveType(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/3 flex items-center justify-center bg-slate-100 rounded-xl">
                                {cracks[activeType].icon}
                            </div>
                            <div className="w-full md:w-2/3">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">{cracks[activeType].title}</h2>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        PI RISK: {cracks[activeType].risk_pi}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <span className="text-xs text-slate-400 uppercase font-bold text-tracking-wider">Root Cause</span>
                                        <p className="text-slate-700 font-medium">{cracks[activeType].cause}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 uppercase font-bold text-tracking-wider">Forensic Signatures</span>
                                        <p className="text-slate-600 text-sm leading-relaxed">{cracks[activeType].description}</p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <div className="flex items-start gap-3 bg-yellow-50 p-4 rounded-lg">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-yellow-800 font-medium">Engineer's Note</p>
                                            <p className="text-xs text-yellow-700 mt-1">
                                                Cosmetic patching (paint/spackle) will fail within 3 months if the underlying {cracks[activeType].cause.toLowerCase()} is not stabilized with piers.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

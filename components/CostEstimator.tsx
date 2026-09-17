"use client";

import { useState } from "react";
import { Calculator, ShieldAlert, BadgeDollarSign } from "lucide-react";

export default function CostEstimator({ city, pi }: { city: string; pi?: number }) {
  const [severity, setSeverity] = useState<string | null>(null);
  const levels = [
    { id: "cosmetic", label: "Minor / Cosmetic Pattern", desc: "Hairline cracks, slight drywall separation, or an isolated sticking door.", cannot: "Symptoms alone cannot price a repair", next: "Document and monitor" },
    { id: "moderate", label: "Multiple Movement Signs", desc: "Exterior cracks, several alignment changes, or noticeable floor variation.", cannot: "The affected area must be measured", next: "Request an evaluation" },
    { id: "severe", label: "Significant or Changing Symptoms", desc: "Large or changing cracks, plumbing concerns, or substantial measured floor differences.", cannot: "Cause and stability need prompt review", next: "Prioritize an on-site review" },
  ];
  const activeLevel = levels.find((l) => l.id === severity);
  const plasticity = Number.isFinite(pi) ? Number(pi) : null;

  return (
    <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden my-12 border border-slate-700 font-sans">
      <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center gap-3">
        <Calculator className="text-emerald-500 w-6 h-6" />
        <h2 className="text-xl font-extrabold text-white tracking-wide uppercase">Foundation Repair Scope Planner</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 md:p-8 bg-slate-900">
          <p className="text-slate-400 font-bold mb-6 uppercase tracking-widest text-xs">Step 1: Choose the closest symptom pattern</p>
          <div className="flex flex-col gap-4">
            {levels.map((level) => (
              <button key={level.id} onClick={() => setSeverity(level.id)} className={`flex flex-col gap-2 p-5 rounded-2xl border-2 transition text-left ${severity === level.id ? "border-emerald-500 bg-slate-800" : "border-slate-800 hover:bg-slate-800"}`}>
                <span className="font-extrabold text-lg text-white">{level.label}</span>
                <span className="text-sm text-slate-500 leading-relaxed">{level.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="p-6 md:p-8 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800">
          <p className="text-slate-500 font-bold mb-6 uppercase tracking-widest text-xs">Planning Guidance</p>
          {!activeLevel ? (
            <div className="min-h-[320px] flex flex-col items-center justify-center text-slate-600 space-y-4">
              <BadgeDollarSign className="w-16 h-16 opacity-20" />
              <p className="text-center text-lg">Choose a symptom pattern.<br/><span className="text-sm text-slate-500">This organizes the next step. It does not diagnose movement or estimate a repair.</span></p>
            </div>
          ) : (
            <div className="min-h-[320px] flex flex-col">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-6">
                <div className="flex justify-between gap-4 mb-4"><span className="text-slate-400 font-bold text-sm uppercase">What symptoms cannot establish</span><span className="text-right text-red-300 text-sm">{activeLevel.cannot}</span></div>
                <div className="flex justify-between gap-4 border-t border-slate-800 pt-4"><span className="text-emerald-400 font-extrabold uppercase flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> Sensible next step</span><span className="text-right text-white font-extrabold">{activeLevel.next}</span></div>
              </div>
              <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                <p className="text-slate-400 text-sm leading-relaxed"><span className="text-white font-bold block mb-2 uppercase tracking-wider text-xs">Why this matters</span>{plasticity === null ? `Repair type and cost in ${city} depend on measured movement, affected area, access, drainage, construction, and the proposed scope.` : <>The mapped soil PI is <strong className="text-emerald-400 font-mono">{plasticity.toFixed(1)}</strong>, but that value cannot determine whether a property needs structural repair or what a repair should cost. Compare measurements, written scopes, exclusions, and warranty terms.</>}</p>
              </div>
              <form action="/book-analysis" className="mt-8 flex flex-col sm:flex-row gap-3">
                <input type="hidden" name="symptom" value={activeLevel.id} />
                <input type="text" name="address" autoComplete="street-address" placeholder={`Enter ${city} Address...`} className="w-full sm:flex-1 px-5 py-4 rounded-xl bg-slate-900 text-white border border-slate-700 focus:border-emerald-500 outline-none" required />
                <button type="submit" className="w-full sm:w-auto text-slate-900 bg-emerald-400 hover:bg-emerald-300 font-extrabold px-6 py-4 rounded-xl">Request Review</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

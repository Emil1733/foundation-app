"use client";

import { useState } from "react";
import { Activity, Calculator, ShieldAlert, BadgeDollarSign } from "lucide-react";

export default function CostEstimator({ city, pi }: { city: string; pi?: number }) {
  const [severity, setSeverity] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (id: string) => {
    if (severity === id && showResult) return;
    setSeverity(id);
    setIsCalculating(true);
    setShowResult(false);
    setTimeout(() => {
      setIsCalculating(false);
      setShowResult(true);
    }, 1800);
  };

  const levels = [
    {
      id: "cosmetic",
      label: "Phase 1: Cosmetic / Minor",
      desc: "Hairline cracks, slight drywall separation, minor sticking doors.",
      contractor: "$4,500 - $7,000",
      trueCost: "$2,800 - $4,200",
      color: "from-blue-400 to-cyan-500",
      bg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      border: "border-blue-500"
    },
    {
      id: "moderate",
      label: "Phase 2: Moderate Structural",
      desc: "Visible exterior brick cracks, doors failing to latch, noticeable floor sloping.",
      contractor: "$12,000 - $18,500",
      trueCost: "$8,500 - $11,200",
      color: "from-yellow-400 to-orange-500",
      bg: "bg-yellow-500/10",
      iconColor: "text-yellow-500",
      border: "border-yellow-500"
    },
    {
      id: "severe",
      label: "Phase 3: Severe Failure",
      desc: "Large stair-step brick cracks, plumbing breaks, major foundation shifting.",
      contractor: "$22,000 - $35,000+",
      trueCost: "$16,000 - $24,000",
      color: "from-red-500 to-rose-600",
      bg: "bg-red-500/10",
      iconColor: "text-red-500",
      border: "border-red-600"
    }
  ];

  const activeLevel = levels.find((l) => l.id === severity);
  const plasticity = pi || 35;

  return (
    <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden my-12 border border-slate-700 font-sans">
      <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center gap-3">
        <Calculator className="text-emerald-500 w-6 h-6" />
        <h2 className="text-xl font-extrabold text-white tracking-wide uppercase">Anti-Markup Cost Estimator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side */}
        <div className="p-6 md:p-8 bg-slate-900">
          <p className="text-slate-400 font-bold mb-6 uppercase tracking-widest text-xs">Step 1: Select Damage Phase</p>
          <div className="flex flex-col gap-4">
            {levels.map((level) => {
              const isActive = severity === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => handleSelect(level.id)}
                  className={`flex flex-col gap-2 p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                    isActive 
                      ? `${level.border} bg-slate-800 shadow-[0_0_15px_rgba(16,185,129,0.1)]` 
                      : "border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-extrabold text-lg ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {level.label}
                    </span>
                    {isActive && !isCalculating && showResult && <Activity className={`w-5 h-5 ${level.iconColor} animate-pulse`} />}
                  </div>
                  <span className="text-sm text-slate-500 leading-relaxed">{level.desc}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Side */}
        <div className="p-6 md:p-8 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 relative">
          <p className="text-slate-500 font-bold mb-6 uppercase tracking-widest text-xs">Forensic Breakdown</p>

          {!severity && !isCalculating && !showResult && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-600 space-y-4">
              <BadgeDollarSign className="w-16 h-16 opacity-20" />
              <p className="text-center px-4 font-medium text-lg">Awaiting input... <br/><span className="text-sm font-normal text-slate-500">Select a damage phase to bypass contractor pricing.</span></p>
            </div>
          )}

          {isCalculating && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-300">
              <div className="relative w-24 h-24">
                 <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin"></div>
                 <div className="absolute inset-3 rounded-full border-l-4 border-teal-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
                 <div className="absolute inset-6 rounded-full border-b-4 border-green-400 animate-spin" style={{ animationDuration: '0.8s' }}></div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-emerald-400 font-mono font-bold tracking-widest animate-pulse">STRIPPING CONTRACTOR MARKUP...</p>
                <p className="text-slate-500 text-xs font-mono">Calculating material yield for {city.toUpperCase()}</p>
                <p className="text-slate-500 text-xs font-mono">Cross-referencing soil PI: {plasticity.toFixed(1)}</p>
              </div>
            </div>
          )}

          {showResult && activeLevel && (
            <div className="animate-in fade-in zoom-in-95 duration-500 h-full flex flex-col min-h-[400px]">
              <div>
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-400 font-bold text-sm uppercase">Standard Contractor Quote</span>
                    <span className="text-red-400 font-mono line-through opacity-70">{activeLevel.contractor}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                    <span className="text-emerald-400 font-extrabold text-lg uppercase tracking-wide flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> True Engineering Cost</span>
                    <span className="text-white font-mono font-extrabold text-2xl">{activeLevel.trueCost}</span>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 relative overflow-hidden">
                  <div className={`absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b ${activeLevel.color}`}></div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    <span className="text-white font-bold block mb-2 uppercase tracking-wider text-xs">Why the huge gap?</span> 
                    Most contractors in {city} charge a flat 40-50% sales commission markup. Because your soil PI is <strong className="text-emerald-400 font-mono">{plasticity.toFixed(1)}</strong>, cheap shallow patches will fail. You need steel-driven piers, but you shouldn't pay a salesman to broker them.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 mb-2">
                <p className="text-slate-400 font-bold mb-3 text-xs uppercase tracking-widest">Get Wholesale Engineering Protocol</p>
                <form action="/book-analysis" className="flex flex-col sm:flex-row gap-3">
                  <input type="hidden" name="symptom" value={activeLevel.id} />
                  <input
                      type="text"
                      name="address"
                      autoComplete="street-address"
                      placeholder={`Enter ${city} Address...`}
                      className="w-full sm:flex-1 px-5 py-4 rounded-xl bg-slate-900 text-white border border-slate-700 focus:border-emerald-500 outline-none transition-colors placeholder:text-slate-600"
                      required
                  />
                  <button type="submit" className="w-full sm:w-auto text-slate-900 bg-emerald-400 hover:bg-emerald-300 font-extrabold px-6 py-4 rounded-xl transition hover:scale-105 shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)]">
                      Bypass Salesmen
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Zap, TrendingDown, Layers, DoorOpen, Activity, Search } from "lucide-react";

export default function CrackAnalyzer({ city, pi }: { city: string; pi?: number }) {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (id: string) => {
    if (selectedIssue === id && showResult) return; // Already selected
    setSelectedIssue(id);
    setIsScanning(true);
    setShowResult(false);
    setTimeout(() => {
      setIsScanning(false);
      setShowResult(true);
    }, 1500); // 1.5 second "calculation" delay
  };

  const issues = [
    {
      id: "stair-step",
      label: "Stair-Step Cracks (Brick)",
      icon: TrendingDown,
      risk: "High Risk",
      desc: "Classic indicator of differential settlement. The soil under one part of your slab is shrinking/swelling faster than the rest.",
      color: "from-orange-500 to-red-500",
      bg: "bg-orange-500/10",
      iconColor: "text-orange-500",
      border: "border-orange-500"
    },
    {
      id: "horizontal",
      label: "Horizontal Wall Cracks",
      icon: Layers,
      risk: "Severe Risk",
      desc: "Indicates hydrostatic pressure pushing laterally against the foundation. Requires immediate engineering review.",
      color: "from-red-600 to-rose-600",
      bg: "bg-red-500/10",
      iconColor: "text-red-500",
      border: "border-red-600"
    },
    {
      id: "doors",
      label: "Sticking Doors / Windows",
      icon: DoorOpen,
      risk: "Moderate-High Risk",
      desc: "The framing of the house is torquing because the center of the slab is lifting (heave) or dropping relative to the perimeter.",
      color: "from-yellow-400 to-orange-400",
      bg: "bg-yellow-500/10",
      iconColor: "text-yellow-500",
      border: "border-yellow-500"
    },
    {
      id: "hairline",
      label: "Vertical Hairline Cracks",
      icon: Zap,
      risk: "Low Risk",
      desc: "Often cosmetic. Normal concrete curing or minor thermal expansion. Keep an eye on it to ensure it doesn't widen.",
      color: "from-blue-400 to-cyan-500",
      bg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      border: "border-blue-500"
    },
  ];

  const activeIssue = issues.find((i) => i.id === selectedIssue);
  const plasticity = pi || 35; // Default high PI if not provided

  return (
    <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden my-12 border border-slate-700 font-sans">
      {/* Header */}
      <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center gap-3">
        <Activity className="text-blue-500 w-6 h-6 animate-pulse" />
        <h2 className="text-xl font-extrabold text-white tracking-wide uppercase">Geological Risk Simulator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Inputs */}
        <div className="p-6 md:p-8 bg-slate-900">
          <p className="text-slate-400 font-bold mb-6 uppercase tracking-widest text-xs">Step 1: Select Observable Symptom</p>
          <div className="flex flex-col gap-3">
            {issues.map((issue) => {
              const Icon = issue.icon;
              const isActive = selectedIssue === issue.id;
              return (
                <button
                  key={issue.id}
                  onClick={() => handleSelect(issue.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                    isActive 
                      ? `${issue.border} bg-slate-800 shadow-[0_0_15px_rgba(59,130,246,0.1)]` 
                      : "border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className={`p-3 rounded-xl ${isActive ? issue.bg : 'bg-slate-800'}`}>
                    <Icon className={`w-6 h-6 ${isActive ? issue.iconColor : 'text-slate-400'}`} />
                  </div>
                  <span className={`font-bold text-lg text-left flex-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {issue.label}
                  </span>
                  {isActive && !isScanning && showResult && <CheckCircle2 className={`w-6 h-6 ${issue.iconColor} animate-in zoom-in`} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Output Screen */}
        <div className="p-6 md:p-8 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 relative">
          <p className="text-slate-500 font-bold mb-6 uppercase tracking-widest text-xs">Diagnostic Output</p>

          {!selectedIssue && !isScanning && !showResult && (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-slate-600 space-y-4">
              <Search className="w-16 h-16 opacity-20" />
              <p className="text-center px-4 font-medium text-lg">Waiting for symptom input... <br/><span className="text-sm font-normal text-slate-500">Select a crack type to run the diagnostic.</span></p>
            </div>
          )}

          {isScanning && (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-300">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-r-4 border-indigo-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className="absolute inset-4 rounded-full border-b-4 border-cyan-400 animate-spin" style={{ animationDuration: '2s' }}></div>
              </div>
              <div className="text-center">
                <p className="text-cyan-400 font-mono font-bold tracking-widest animate-pulse">ANALYZING SOIL DATA...</p>
                <p className="text-slate-500 text-xs mt-2 font-mono">Location: {city.toUpperCase()}</p>
                <p className="text-slate-500 text-xs mt-1 font-mono">Plasticity Index: {plasticity.toFixed(1)}</p>
              </div>
            </div>
          )}

          {showResult && activeIssue && (
            <div className="animate-in fade-in zoom-in-95 duration-500 h-full flex flex-col min-h-[350px]">
              <div>
                <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 bg-gradient-to-r ${activeIssue.color} text-white shadow-lg`}>
                  {activeIssue.risk}
                </div>
                
                <h3 className="text-2xl font-extrabold text-white mb-3">Diagnostic Match</h3>
                <p className="text-slate-300 leading-relaxed mb-6 text-lg">{activeIssue.desc}</p>
                
                <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 mb-6 relative overflow-hidden">
                  <div className={`absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b ${activeIssue.color}`}></div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    <span className="text-white font-bold block mb-2 uppercase tracking-wider text-xs">Geological Context:</span> 
                    Because {city} has an active soil PI of <span className="text-red-400 font-mono font-bold bg-red-400/10 px-1.5 py-0.5 rounded">{plasticity.toFixed(1)}</span>, this symptom is highly correlated with seasonal volumetric soil expansion.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 mb-2">
                <p className="text-slate-400 font-bold mb-3 text-xs uppercase tracking-widest">Generate P.E. Protocol</p>
                <form action="/book-analysis" className="flex flex-col sm:flex-row gap-3">
                  <input type="hidden" name="symptom" value={activeIssue.id} />
                  <input
                      type="text"
                      name="address"
                      autoComplete="street-address"
                      placeholder={`Enter ${city} Address...`}
                      className="w-full sm:flex-1 px-5 py-4 rounded-xl bg-slate-900 text-white border border-slate-700 focus:border-blue-500 outline-none transition-colors placeholder:text-slate-600"
                      required
                  />
                  <button type="submit" className={`w-full sm:w-auto text-white font-extrabold px-6 py-4 rounded-xl transition hover:scale-105 bg-gradient-to-r ${activeIssue.color} shadow-lg`}>
                      Get Report
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

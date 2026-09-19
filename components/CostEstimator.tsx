"use client";

import { useState } from "react";
import { Check, ClipboardCheck, Gauge, MapPin, Ruler, ShieldCheck } from "lucide-react";

const levels = [
  { id: "cosmetic", step: "01", label: "Minor / Cosmetic Pattern", short: "Isolated or small changes", desc: "Hairline cracks, slight drywall separation, or an isolated sticking door.", cannot: "Symptoms alone cannot price a repair.", next: "Document and monitor", icon: Ruler },
  { id: "moderate", step: "02", label: "Multiple Movement Signs", short: "Several related symptoms", desc: "Exterior cracks, several alignment changes, or noticeable floor variation.", cannot: "The affected area must be measured.", next: "Request an evaluation", icon: Gauge },
  { id: "severe", step: "03", label: "Significant or Changing Symptoms", short: "Large, changing, or urgent signs", desc: "Large or changing cracks, plumbing concerns, or substantial measured floor differences.", cannot: "Cause and stability need prompt review.", next: "Prioritize an on-site review", icon: ShieldCheck },
];

export default function CostEstimator({ city, pi }: { city: string; pi?: number }) {
  const [severity, setSeverity] = useState<string | null>(null);
  const activeLevel = levels.find((level) => level.id === severity);
  const plasticity = Number.isFinite(pi) ? Number(pi) : null;

  return (
    <section className="my-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
      <div className="border-b border-slate-200 px-6 py-7 md:px-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700">Foundation Planning</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">What should you do next?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Match the closest symptom pattern to organize your next step. This does not diagnose movement or estimate a repair price.</p>
          </div>
          <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 md:flex"><ClipboardCheck className="h-4 w-4 text-blue-700" aria-hidden="true" />Scope planning guide</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
        <div className="bg-slate-50/70 p-5 md:p-7">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Choose the closest match</p>
          <div className="space-y-3">
            {levels.map((level) => {
              const Icon = level.icon;
              const active = severity === level.id;
              return (
                <button key={level.id} type="button" onClick={() => setSeverity(level.id)} aria-pressed={active}
                  className={`group w-full rounded-2xl border p-5 text-left transition ${active ? "border-blue-300 bg-white shadow-[0_10px_30px_rgba(37,99,235,0.10)]" : "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white"}`}>
                  <div className="flex items-start gap-4">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${active ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}><Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">{level.step}</span><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-transparent"}`}><Check className="h-3.5 w-3.5" aria-hidden="true" /></span></span>
                      <span className="mt-1 block text-base font-bold text-slate-950">{level.label}</span>
                      <span className="mt-1 block text-xs font-medium text-slate-500">{level.short}</span>
                      <span className="mt-3 block text-sm leading-6 text-slate-600">{level.desc}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-[500px] bg-slate-950 p-6 text-white md:p-8">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_90%_5%,rgba(37,99,235,0.16),transparent_38%)]" />
          <div className="relative flex h-full flex-col">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Your next step</p>

            {!activeLevel ? (
              <div className="flex flex-1 flex-col justify-center py-12">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-300"><ClipboardCheck className="h-7 w-7" aria-hidden="true" /></div>
                <h3 className="max-w-md text-2xl font-bold">A repair quote starts with a scope.</h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">Choose the closest pattern. The useful question is not just what a repair might cost, but what evidence supports the proposed work.</p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col pt-6">
                <span className="w-fit rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">{activeLevel.label}</span>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Still needs to be checked</p>
                    <p className="mt-3 text-sm font-semibold leading-6 text-white">{activeLevel.cannot}</p>
                  </div>
                  <div className="rounded-2xl border border-blue-400/20 bg-blue-400/[0.08] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">Recommended next step</p>
                    <p className="mt-3 text-sm font-bold leading-6 text-white">{activeLevel.next}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Why this matters in {city}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {plasticity === null
                      ? `Repair type and cost depend on measured movement, affected area, access, drainage, construction, and the proposed scope.`
                      : <>The mapped soil PI is <strong className="font-mono text-white">{plasticity.toFixed(1)}</strong>, but that value cannot determine whether this property needs structural repair or what a repair should cost. Compare measurements, written scopes, exclusions, and warranty terms.</>}
                  </p>
                </div>

                <form action="/book-analysis" className="mt-auto pt-7">
                  <input type="hidden" name="symptom" value={activeLevel.id} />
                  <label htmlFor="planning-address" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Request a property-specific evaluation</label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                      <input id="planning-address" type="text" name="address" autoComplete="street-address" placeholder={`Enter ${city} address...`} className="w-full rounded-xl border border-white/15 bg-white/[0.06] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" required />
                    </div>
                    <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500">Request Evaluation</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

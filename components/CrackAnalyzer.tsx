"use client";

import { useState } from "react";
import { Check, DoorOpen, Layers3, MoveDownRight, ScanSearch, Zap } from "lucide-react";

const issues = [
  { id: "stair-step", label: "Stair-Step Cracks", detail: "Brick or masonry", icon: MoveDownRight, status: "Evaluation recommended", desc: "A stair-step pattern can accompany differential movement, but its cause and significance depend on location, width, progression, and the surrounding structure." },
  { id: "horizontal", label: "Horizontal Wall Cracks", detail: "Wall or masonry", icon: Layers3, status: "Prompt review", desc: "A horizontal crack deserves prompt review, particularly if it is widening, bowing, leaking, or accompanied by other movement. Several causes are possible." },
  { id: "doors", label: "Sticking Doors / Windows", detail: "Openings changing", icon: DoorOpen, status: "Track the pattern", desc: "A sticking opening can result from humidity, hardware, framing, or foundation movement. Multiple changing openings make a property evaluation more useful." },
  { id: "hairline", label: "Vertical Hairline Cracks", detail: "Narrow or stable", icon: Zap, status: "Monitor changes", desc: "A narrow, stable crack may be cosmetic. Photograph and measure it so widening, displacement, or related symptoms are easier to identify." },
];

export default function CrackAnalyzer({ city, pi }: { city: string; pi?: number }) {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const activeIssue = issues.find((issue) => issue.id === selectedIssue);
  const plasticity = Number.isFinite(pi) ? Number(pi) : null;

  return (
    <section className="my-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
      <div className="border-b border-slate-200 px-6 py-7 md:px-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700">Foundation Signs</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">What are you seeing?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Select an observable sign to understand what it may mean and what evidence is useful before choosing a repair.</p>
          </div>
          <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 md:flex"><ScanSearch className="h-4 w-4 text-blue-700" aria-hidden="true" />Property evaluation guide</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-slate-50/70 p-5 md:p-7">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Select a sign</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {issues.map((issue) => {
              const Icon = issue.icon;
              const active = issue.id === selectedIssue;
              return (
                <button key={issue.id} type="button" onClick={() => setSelectedIssue(issue.id)} aria-pressed={active}
                  className={`group flex min-h-20 items-center gap-4 rounded-2xl border p-4 text-left transition ${active ? "border-blue-300 bg-white shadow-[0_10px_30px_rgba(37,99,235,0.10)]" : "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white"}`}>
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${active ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}><Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-900">{issue.label}</span><span className="mt-1 block text-xs text-slate-500">{issue.detail}</span></span>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-transparent"}`}><Check className="h-3.5 w-3.5" aria-hidden="true" /></span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-[420px] bg-slate-950 p-6 text-white md:p-8">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(37,99,235,0.16),transparent_35%)]" />
          <div className="relative flex h-full flex-col">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">What this may mean</p>
            {!activeIssue ? (
              <div className="flex flex-1 flex-col justify-center py-12">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-300"><ScanSearch className="h-7 w-7" aria-hidden="true" /></div>
                <h3 className="max-w-md text-2xl font-bold">Start with the pattern, not the repair.</h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">A single symptom rarely tells the whole story. Choose what you are seeing, then compare it with drainage, measurements, and changes over time.</p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col pt-6">
                <span className="mb-5 w-fit rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">{activeIssue.status}</span>
                <h3 className="text-2xl font-bold md:text-3xl">{activeIssue.label}</h3>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">{activeIssue.desc}</p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Mapped soil context</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {plasticity === null ? <>No mapped Plasticity Index is available for this record. The visible pattern and whether it is changing matter more than a citywide assumption.</> : <>The mapped soil record for {city} has a PI of <strong className="font-mono text-white">{plasticity.toFixed(1)}</strong>. This adds moisture-sensitivity context, but it cannot diagnose the cause of a crack at a specific property.</>}
                  </p>
                </div>

                <form action="/book-analysis" className="mt-auto pt-7">
                  <input type="hidden" name="symptom" value={activeIssue.id} />
                  <label htmlFor="foundation-sign-address" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Get help with your foundation</label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input id="foundation-sign-address" type="text" name="address" autoComplete="street-address" placeholder={`Enter ${city} address...`} className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" required />
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

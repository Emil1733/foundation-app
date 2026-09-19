import { Binoculars, Compass, MapPinned } from "lucide-react";
import type { StateFoundationGuide } from "@/lib/stateFoundationGuides";

export default function RegionalFoundationGuide({ city, guide }: { city: string; guide: StateFoundationGuide }) {
  return (
    <section className="mb-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
      <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
        <div className="p-6 md:p-8">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
            <MapPinned className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700">{guide.name} Foundation Context</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">Regional Foundation Guidance for {city}</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            {guide.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/70 p-6 md:p-8 lg:border-l lg:border-t-0">
          <div>
            <div className="flex items-center gap-3">
              <Binoculars className="h-5 w-5 text-blue-700" aria-hidden="true" />
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-900">What to watch for</h3>
            </div>
            <ul className="mt-5 space-y-4">
              {guide.watchFor.map((item, index) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[10px] font-bold text-blue-700">{String(index + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Compass className="h-5 w-5 text-blue-700" aria-hidden="true" />
              <h3 className="text-sm font-bold text-slate-950">Evaluation approach</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{guide.evaluation}</p>
            <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">Regional guidance is context only. Repair decisions should be tied to evidence from the property.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Droplets, Eye, Pipette, ShieldCheck } from "lucide-react";

const options = [
  { label: "Support / Piers", eyebrow: "Structural support", copy: "A proposal may use localized supports or piers when measured movement and the affected area support structural stabilization.", icon: ShieldCheck },
  { label: "Drainage Correction", eyebrow: "Water management", copy: "Grading, discharge, and drainage changes may be part of the scope when water concentration is contributing to changing soil conditions.", icon: Droplets },
  { label: "Plumbing / Leak Work", eyebrow: "Moisture source", copy: "Plumbing investigation or repair may matter when a leak or abnormal moisture source could be affecting conditions near the foundation.", icon: Pipette },
  { label: "Monitoring", eyebrow: "Evidence first", copy: "Monitoring can be appropriate when current evidence does not yet support structural work or when the pattern needs to be measured over time.", icon: Eye },
];

export default function RepairOptions({ city }: { city: string }) {
  return (
    <section id="repair-options" className="mb-12 scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
      <div className="border-b border-slate-200 px-6 py-7 md:px-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700">Compare The Scope</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">Foundation Repair Options in {city}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Common proposals can solve very different problems. The appropriate option depends on the movement mechanism, affected area, access, foundation type, and measurements at the property.</p>
      </div>

      <div className="grid sm:grid-cols-2">
        {options.map(({ label, eyebrow, copy, icon: Icon }, index) => (
          <article key={label} className={`group p-6 transition hover:bg-slate-50/70 md:p-7 ${index % 2 === 1 ? "sm:border-l sm:border-slate-200" : ""} ${index > 1 ? "border-t border-slate-200" : index === 1 ? "border-t border-slate-200 sm:border-t-0" : ""}`}>
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
              <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
            <h3 className="mt-1 text-lg font-bold text-slate-950">{label}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
          </article>
        ))}
      </div>

      <div className="border-t border-slate-200 bg-slate-50/70 px-6 py-5 md:px-8">
        <p className="text-sm leading-6 text-slate-600"><strong className="text-slate-900">When comparing proposals:</strong> ask for the measurements or other evidence behind the scope, which areas are included, what is excluded, how drainage or plumbing concerns are handled, and what the warranty actually covers.</p>
      </div>
    </section>
  );
}

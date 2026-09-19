import { ArrowDown, Droplets, Gauge, Ruler, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    eyebrow: "Measure movement",
    title: "Establish the pattern",
    copy: "Floor elevations, crack history, opening alignment, and repeat measurements help distinguish active, historic, and cosmetic changes.",
    icon: Ruler,
  },
  {
    number: "02",
    eyebrow: "Identify contributors",
    title: "Review water and support",
    copy: "Drainage, plumbing, grading, fill, vegetation, foundation design, and subsurface conditions can change what an appropriate response looks like.",
    icon: Droplets,
  },
  {
    number: "03",
    eyebrow: "Compare scopes",
    title: "Tie the proposal to evidence",
    copy: "Ask why a proposed system, location, quantity, and depth match the measured problem. Compare exclusions and warranty terms as well as price.",
    icon: ShieldCheck,
  },
];

export default function FoundationDiagram() {
  return (
    <section className="my-12 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-[0_28px_80px_rgba(2,6,23,0.16)]">
      <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
        <div className="relative overflow-hidden border-b border-slate-800 p-7 md:p-9 lg:border-b-0 lg:border-r">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(37,99,235,0.20),transparent_40%)]" />
          <div className="relative">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300">Repair Scope</p>
            <h2 className="max-w-md text-3xl font-bold tracking-tight md:text-4xl">The repair should follow the evidence.</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">
              Different support systems address different conditions. Mapped soil can add context, but it cannot determine the correct repair type or depth for an individual property.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Decision sequence</p>
                  <p className="mt-1 text-sm font-semibold text-white">Evidence before scope</p>
                </div>
                <Gauge className="h-5 w-5 text-blue-300" aria-hidden="true" />
              </div>

              <div className="relative pl-5">
                <div aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-blue-400 via-blue-500/60 to-slate-700" />
                {["Observe", "Measure", "Identify cause", "Compare repair"].map((label, index) => (
                  <div key={label} className="relative flex items-center gap-3 py-2.5">
                    <span aria-hidden="true" className={`absolute -left-5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 ${index === 3 ? "bg-blue-400" : "bg-slate-600"}`} />
                    <span className={`text-sm ${index === 3 ? "font-bold text-white" : "text-slate-400"}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 text-slate-900 md:p-8">
          <div className="space-y-3">
            {steps.map(({ number, eyebrow, title, copy, icon: Icon }, index) => (
              <div key={number}>
                <article className="group grid gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:grid-cols-[auto_1fr] sm:p-6">
                  <div className="flex items-center gap-3 sm:block">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                      <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.18em] text-slate-400 sm:mt-3 sm:block">{number}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                  </div>
                </article>
                {index < steps.length - 1 && (
                  <div className="flex h-5 items-center justify-center text-slate-300">
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-6 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
            Planning guidance only. The appropriate repair, if any, should be based on property evidence and a qualified evaluation rather than mapped soil data alone.
          </p>
        </div>
      </div>
    </section>
  );
}

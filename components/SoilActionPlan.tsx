import { AlertTriangle, Check, ClipboardList, Droplets, Gauge, SearchCheck } from "lucide-react";

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
  const rawPi = soil?.plasticity_index;
  const parsedPi = rawPi === null || rawPi === undefined || rawPi === "" ? null : Number(rawPi);
  const pi = parsedPi !== null && Number.isFinite(parsedPi) && parsedPi >= 0 ? parsedPi : null;
  const screeningClass = riskLevel || soil?.risk_level || "Not classified";
  const isElevated = screeningClass === "Severe" || screeningClass === "High";

  if (!soil && screeningClass === "Not classified") return null;

  const actions = [
    { label: "Document", copy: "Date and measure cracks, sticking openings, and floor changes.", icon: ClipboardList },
    { label: "Check", copy: "Review roof runoff, grading, irrigation, and possible plumbing leaks.", icon: Droplets },
    { label: "Ask", copy: "What property-specific evidence supports the proposed repair scope?", icon: SearchCheck },
  ];

  return (
    <section className="my-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
      <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
        <div className="relative overflow-hidden bg-slate-950 p-6 text-white md:p-8">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(37,99,235,0.20),transparent_42%)]" />
          <div className="relative">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300">Mapped Soil Signal</p>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Foundation Next-Step Plan for {city}</h2>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Screening class</p>
                  <p className="mt-2 text-3xl font-bold">{screeningClass}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-300">
                  {isElevated ? <AlertTriangle className="h-5 w-5" aria-hidden="true" /> : <Gauge className="h-5 w-5" aria-hidden="true" />}
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                {soil && pi !== null
                  ? <>The mapped {soil.map_unit_name || "soil"} record has a Plasticity Index of <strong className="font-mono text-white">{pi.toFixed(1)}</strong>. This is mapped context, not a property diagnosis or repair prescription.</>
                  : "No reportable mapped Plasticity Index is available for this location. Property-specific drainage, symptoms, measurements, and construction details matter more than a citywide assumption."}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">Practical next steps</p>
          <h3 className="mt-2 text-xl font-bold text-slate-950">{isElevated ? "Compare the soil signal with the property." : "Build a simple evidence record before drawing conclusions."}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {isElevated
              ? "Higher mapped sensitivity makes moisture and movement evidence more useful, but it still does not prove that a specific home needs structural repair."
              : "Visible changes, water conditions, and repeat measurements provide the context needed to decide whether further evaluation makes sense."}
          </p>

          <div className="mt-6 grid gap-3">
            {actions.map(({ label, copy, icon: Icon }, index) => (
              <div key={label} className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.8} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-[0.16em] text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-bold text-slate-950">{label}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p>
                </div>
                <Check className="mt-1 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

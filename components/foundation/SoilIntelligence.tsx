import Link from "next/link";
import { Database, Gauge, Layers3, MoveRight } from "lucide-react";
import { SoilScreeningClass, hasDisplayableZip } from "@/lib/soilRisk";

type SoilRecord = {
  map_unit_name?: string | null;
  plasticity_index?: number | string | null;
  shrink_swell_potential?: number | string | null;
};

type SoilIntelligenceProps = {
  city: string;
  slug: string;
  zipCode?: string | null;
  soil: SoilRecord | null;
  riskClass: SoilScreeningClass;
  soilReportAvailable: boolean;
  intro: string;
};

const riskStops: SoilScreeningClass[] = ["Lower", "Moderate", "High", "Severe"];

function riskPosition(risk: SoilScreeningClass) {
  if (risk === "Lower") return "12.5%";
  if (risk === "Moderate") return "37.5%";
  if (risk === "High") return "62.5%";
  if (risk === "Severe") return "87.5%";
  return null;
}

export default function SoilIntelligence({
  city,
  slug,
  zipCode,
  soil,
  riskClass,
  soilReportAvailable,
  intro,
}: SoilIntelligenceProps) {
  const piNumber =
    soil?.plasticity_index === null || soil?.plasticity_index === undefined || soil?.plasticity_index === ""
      ? null
      : Number(soil.plasticity_index);
  const hasPi = piNumber !== null && Number.isFinite(piNumber) && piNumber >= 0;
  const piDisplay = hasPi ? piNumber.toFixed(1) : "Not reported";

  const shrinkNumber =
    soil?.shrink_swell_potential === null ||
    soil?.shrink_swell_potential === undefined ||
    soil?.shrink_swell_potential === ""
      ? null
      : Number(soil.shrink_swell_potential);
  const hasShrink = shrinkNumber !== null && Number.isFinite(shrinkNumber);
  const markerPosition = riskPosition(riskClass);

  return (
    <section className="mb-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
      <div className="border-b border-slate-200 bg-slate-950 px-6 py-7 text-white md:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300">Property Intelligence</p>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Mapped Soil Context for {city}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              {hasDisplayableZip(zipCode) ? `USDA/NRCS mapped soil screening context for ZIP ${zipCode}` : "USDA/NRCS mapped soil screening context for this location"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Database className="h-4 w-4 text-blue-400" aria-hidden="true" />
            USDA / NRCS mapped data
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <p className="max-w-3xl text-base leading-7 text-slate-600">{intro}</p>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Plasticity Index</p>
                <div className="mt-2 flex items-end gap-3">
                  <span className="font-mono text-5xl font-bold tracking-tight text-slate-950">{piDisplay}</span>
                  {hasPi && (
                    <span className="mb-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                      {riskClass}
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600">
                <Gauge className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-7">
              <div className="relative h-2 overflow-visible rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500">
                {markerPosition && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-slate-950 shadow"
                    style={{ left: markerPosition }}
                  />
                )}
              </div>
              <div className="mt-3 grid grid-cols-4 text-center text-[9px] font-bold uppercase tracking-wider text-slate-500">
                {riskStops.map((stop) => <span key={stop}>{stop}</span>)}
              </div>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              {hasPi ? "Mapped screening value, not a measurement from the property." : "No reportable mapped PI is available for this record."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Layers3 className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Mapped Soil Profile</p>
              <p className="mt-2 text-lg font-bold leading-6 text-slate-900">{soilReportAvailable ? soil?.map_unit_name : "No usable mapped record"}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Shrink-Swell Context</p>
              <p className="mt-3 font-mono text-3xl font-bold text-slate-950">{hasShrink ? `${shrinkNumber.toFixed(1)}%` : "Not reported"}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Mapped linear-extensibility context. Site conditions can vary.</p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">How to use this</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Use mapped soil as context when comparing cracks, drainage, floor elevations, and changes over time. It should not determine a repair scope by itself.
              </p>
            </div>
          </div>
        </div>

        {soilReportAvailable && (
          <Link
            href={`/learn/${slug}-soil-analysis`}
            className="group mt-6 flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4 transition hover:border-blue-300 hover:bg-blue-50/50"
          >
            <span>
              <strong className="block text-sm text-slate-900">View {city} Soil Risk Report</strong>
              <span className="mt-1 block text-xs text-slate-500">Review the mapped soil record and interpretation.</span>
            </span>
            <MoveRight className="h-5 w-5 text-blue-700 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}

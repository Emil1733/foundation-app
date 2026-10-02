import { ClipboardCheck, MapPinned } from "lucide-react";
import type { CityFoundationProfile as CityFoundationProfileData } from "@/lib/commercialSeoTreatments";

export default function CityFoundationProfile({
  profile,
}: {
  profile: CityFoundationProfileData;
}) {
  return (
    <section className="my-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
      <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
        <div className="p-6 md:p-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
            <MapPinned className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700">{profile.kicker}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">{profile.heading}</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            {profile.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
            Mapped soil describes the registry point, not every lot in the city. Confirm conditions at the property before choosing a repair.
          </p>
        </div>

        <div className="border-t border-slate-200 bg-slate-50/70 p-6 md:p-8 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-blue-700" aria-hidden="true" />
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-900">What to verify at the property</h3>
          </div>
          <div className="mt-5 space-y-3">
            {profile.priorities.map((priority, index) => (
              <div key={priority.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h4 className="text-sm font-bold text-slate-950">{priority.label}</h4>
                </div>
                <p className="mt-2 pl-10 text-sm leading-6 text-slate-600">{priority.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

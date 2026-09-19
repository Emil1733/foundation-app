import { ClipboardCheck, Compass, MapPinned, Wrench } from "lucide-react";

const items = [
  {
    label: "Property-Specific",
    title: "Evaluation focused on your home",
    icon: ClipboardCheck,
  },
  {
    label: "Foundation-Focused",
    title: "Repair guidance and next steps",
    icon: Wrench,
  },
  {
    label: "Local Context",
    title: "Mapped soil conditions for your area",
    icon: MapPinned,
  },
  {
    label: "Clear Options",
    title: "Understand before committing",
    icon: Compass,
  },
];

export default function TrustBadges() {
  return (
    <section aria-label="Foundation evaluation benefits" className="my-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ label, title, icon: Icon }, index) => (
          <div
            key={label}
            className={[
              "group relative flex items-start gap-4 px-5 py-6 sm:px-6",
              index > 0 ? "border-t border-slate-200 sm:border-t-0" : "",
              index === 1 ? "sm:border-l" : "",
              index === 2 ? "sm:border-t lg:border-l lg:border-t-0" : "",
              index === 3 ? "sm:border-l sm:border-t lg:border-t-0" : "",
            ].join(" ")}
          >
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50/70 text-blue-700 transition-colors group-hover:bg-blue-100">
              <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">{label}</p>
              <p className="text-sm font-semibold leading-5 text-slate-900">{title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import { ChevronDown, HelpCircle } from "lucide-react";

type FAQ = { q: string; a: string };

export default function FoundationFAQ({ city, faqs }: { city: string; faqs: FAQ[] }) {
  return (
    <section className="mb-12">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700">Homeowner Questions</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">Foundation Repair Questions in {city}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Practical answers for comparing symptoms, soil context, evaluation steps, and repair proposals.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        {faqs.map((faq, index) => (
          <details key={faq.q} className="group border-b border-slate-200 last:border-b-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 text-left transition hover:bg-slate-50/70 md:px-7 [&::-webkit-details-marker]:hidden">
              <span className="flex items-start gap-4">
                <span className="mt-0.5 font-mono text-[10px] font-bold tracking-wider text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-sm font-bold leading-6 text-slate-950 md:text-base">{faq.q}</span>
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-open:rotate-180 group-open:border-blue-200 group-open:bg-blue-50 group-open:text-blue-700">
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </span>
            </summary>
            <div className="px-5 pb-6 md:px-7">
              <p className="ml-0 max-w-3xl border-l-2 border-blue-100 pl-5 text-sm leading-7 text-slate-600 md:ml-10">{faq.a}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

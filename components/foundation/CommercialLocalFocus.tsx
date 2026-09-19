import Link from "next/link";
import { ArrowDown, ClipboardCheck } from "lucide-react";

export default function CommercialLocalFocus({ city, copy }: { city: string; copy: string }) {
  return (
    <section className="mb-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-8">
      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
          <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700">Local Repair Context</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Choosing Foundation Repair in {city}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
          <nav aria-label="Foundation repair page shortcuts" className="mt-6 flex flex-wrap gap-2">
            <a href="#repair-options" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">Repair options <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <a href="#foundation-cost" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">Planning factors <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" /></a>
            <Link href="/book-analysis" className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800">Request evaluation</Link>
          </nav>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function EvaluationCTA({ city }: { city: string }) {
  return (
    <section className="relative mb-12 overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-[0_28px_80px_rgba(2,6,23,0.18)] md:px-10 md:py-12">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(37,99,235,0.24),transparent_38%)]" />
      <div aria-hidden="true" className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full border border-blue-400/10" />
      <div aria-hidden="true" className="absolute -bottom-10 right-16 h-40 w-40 rounded-full border border-blue-400/10" />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300">Property-Specific Next Step</p>
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">Concerned about foundation movement in {city}?</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">Cracks, uneven floors, sticking doors, and other changes can have several causes. Request an evaluation to understand the evidence and what options may make sense before committing to a repair.</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-300">
            {["Property-specific review", "Clear next steps", "Compare repair options"].map((item) => (
              <span key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" aria-hidden="true" />{item}</span>
            ))}
          </div>
        </div>

        <Link href="/book-analysis" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-500 lg:w-auto">
          Request a Foundation Evaluation <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

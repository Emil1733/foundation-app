import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import HeroLeadForm from "@/components/foundation/HeroLeadForm";

type FoundationHeroProps = {
  city: string;
  state: string;
  stateHref: string;
  stateName: string;
  eyebrow: string;
  h1Lead: string;
  description: string;
  ctaLabel: string;
};

export default function FoundationHero({
  city,
  state,
  stateHref,
  stateName,
  eyebrow,
  h1Lead,
  description,
  ctaLabel,
}: FoundationHeroProps) {
  return (
    <header className="relative isolate overflow-hidden bg-slate-950 px-6 py-10 text-white md:py-16 lg:py-20">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-30 bg-cover bg-[position:62%_center] sm:bg-[position:68%_center] lg:bg-[position:center_48%] motion-reduce:transform-none"
        style={{ backgroundImage: "url('/foundation-hero-generated.webp')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-slate-950/28 sm:bg-slate-950/24 lg:bg-slate-950/20" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,6,23,0.78)_0%,rgba(2,6,23,0.58)_46%,rgba(2,6,23,0.20)_76%,rgba(2,6,23,0.30)_100%)] lg:bg-[linear-gradient(90deg,rgba(2,6,23,0.82)_0%,rgba(2,6,23,0.62)_34%,rgba(2,6,23,0.14)_66%,rgba(2,6,23,0.24)_100%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-slate-950/32 to-transparent" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
        <div>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-400">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></li>
              <li><Link href="/locations" className="hover:text-white">Service Areas</Link></li>
              <li><ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></li>
              <li><Link href={stateHref} className="hover:text-white">{stateName}</Link></li>
              <li><ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></li>
              <li aria-current="page" className="text-slate-200">{city}</li>
            </ol>
          </nav>

          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-200">
            <ShieldCheck className="h-4 w-4 text-blue-400" aria-hidden="true" />
            <span>{eyebrow}</span>
          </div>

          <h1 className="mb-6 text-3xl font-extrabold leading-[1.08] sm:text-4xl md:text-5xl lg:text-[3.35rem]">
            {h1Lead}{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">in {city}, {state}</span>
          </h1>
          <p className="mb-6 max-w-xl text-lg leading-relaxed text-slate-300">{description}</p>

          <Link href="/book-analysis" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            {ctaLabel}
          </Link>
          <p className="mt-3 text-sm text-slate-400">Get help understanding the next step before committing to a repair.</p>

          <div className="mt-6 flex flex-wrap gap-6 border-t border-slate-700/50 pt-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <span>USDA Soil Context</span>
            <span>Property-Specific Review</span>
            <span>Compare Repair Options</span>
          </div>
        </div>

        <div className="relative">
          <HeroLeadForm city={city} />
        </div>
      </div>
    </header>
  );
}

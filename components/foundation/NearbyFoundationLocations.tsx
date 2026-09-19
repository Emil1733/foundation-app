import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

type Neighbor = { id: string | number; slug: string; city: string; state: string; distanceMiles: number };

export default function NearbyFoundationLocations({ city, neighbors }: { city: string; neighbors: Neighbor[] }) {
  if (neighbors.length === 0) return null;

  return (
    <section className="border-t border-slate-200 pt-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700">Nearby Service Areas</p>
          <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-950">
            <MapPin className="h-5 w-5 text-blue-700" aria-hidden="true" />
            Foundation Repair Near {city}
          </h2>
        </div>
        <p className="max-w-sm text-xs leading-5 text-slate-500">Explore nearby location guides with local foundation and mapped-soil context.</p>
      </div>

      <nav aria-label={`Foundation repair locations near ${city}`} className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {neighbors.map((neighbor) => (
          <Link key={neighbor.id} href={`/services/foundation-repair/${neighbor.slug}`} className="group flex min-h-28 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]">
            <div className="flex items-start justify-between gap-3">
              <span className="font-bold text-slate-950 transition group-hover:text-blue-700">{neighbor.city}, {neighbor.state}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-700" aria-hidden="true" />
            </div>
            <span className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{neighbor.distanceMiles.toFixed(0)} miles away</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}

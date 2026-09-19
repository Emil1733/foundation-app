import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { BookOpen, MapPin, ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Pagination from '@/components/Pagination';
import { paginatedUrl, parsePageNumber, type PageSearchParams } from '@/lib/pagination';

export const revalidate = 3600;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const PAGE_SIZE = 48;

export async function generateMetadata({
    searchParams,
}: {
    searchParams: PageSearchParams;
}): Promise<Metadata> {
    const page = parsePageNumber((await searchParams).page) || 1;
    const title = page === 1
        ? 'Foundation Repair Education Hub | Soil & Structural Analysis'
        : `Foundation Repair Education Hub – Page ${page}`;
    const description = page === 1
        ? 'Explore local soil-risk reports, foundation settlement warning signs, and structural evaluation guidance for communities across the United States.'
        : `Browse page ${page} of local foundation soil-risk reports and settlement guides from the Foundation Risk Registry.`;
    const url = paginatedUrl('https://foundationrisk.org/learn', page);

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            images: ['/logo.png'],
        },
    };
}

export default async function LearnPage({
    searchParams,
}: {
    searchParams: PageSearchParams;
}) {
    const query = await searchParams;
    if (query.page === '1') permanentRedirect('/learn');

    const currentPage = parsePageNumber(query.page);
    if (!currentPage) notFound();

    const rangeStart = (currentPage - 1) * PAGE_SIZE;
    const rangeEnd = rangeStart + PAGE_SIZE - 1;

    const { data: locations, count, error } = await supabase
        .from('target_locations')
        .select(`
            city, 
            state, 
            slug,
            soil_cache (
                map_unit_name,
                risk_level,
                plasticity_index
            )
        `, { count: 'exact' })
        .order('city')
        .range(rangeStart, rangeEnd);

    if (error?.code === 'PGRST103') notFound();
    if (error) throw new Error(`Unable to load soil reports: ${error.message}`);
    if (!locations || count === null) notFound();

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
    if (currentPage > totalPages) notFound();

    const criticalCities = currentPage === 1
        ? (await supabase
            .from('target_locations')
            .select(`
                city,
                state,
                slug,
                soil_cache!inner (
                    map_unit_name,
                    risk_level,
                    plasticity_index
                )
            `)
            .in('soil_cache.risk_level', ['Severe', 'High'])
            .order('created_at', { ascending: false })
            .limit(6)).data || []
        : [];

    const firstResult = rangeStart + 1;
    const lastResult = Math.min(rangeEnd + 1, count);

    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            <header className="relative isolate overflow-hidden bg-slate-950 px-6 py-16 text-white md:py-20">
                <div aria-hidden="true" className="absolute inset-0 -z-30 bg-cover bg-[position:center_48%]" style={{ backgroundImage: "url('/foundation-hero-generated.webp')" }} />
                <div aria-hidden="true" className="absolute inset-0 -z-20 bg-slate-950/64" />
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.72)_52%,rgba(2,6,23,0.48)_100%)]" />
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-4 py-1.5 text-sm font-semibold text-blue-200 mb-6">
                        <BookOpen className="w-4 h-4" /> Foundation & Soil Resource Library
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                        Local Soil Context for Better Foundation Decisions
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-8">
                        Review mapped USDA soil context, foundation warning signs, and practical evaluation questions before choosing a repair scope.
                    </p>
                    <Link href="/book-analysis" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 font-bold text-white transition hover:bg-blue-500">
                        <ShieldCheck className="h-5 w-5" /> Request a Foundation Evaluation
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-12 px-6">

                {currentPage === 1 && criticalCities.length > 0 && (
                    <section aria-labelledby="featured-risk-zones">
                        <h2 id="featured-risk-zones" className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-red-500 rounded-full" aria-hidden="true"></span>
                            Featured Soil Reports
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6 mb-16">
                            {criticalCities.map((loc) => (
                        <Link
                            key={loc.slug}
                            href={`/learn/${loc.slug}-soil-analysis`}
                            className="group block bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500 group-hover:bg-red-600 transition"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">
                                        Soil and Foundation Context in {loc.city}, {loc.state}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                                        <MapPin className="w-4 h-4" />
                                        <span>Primary Soil: <strong>
                                            {(() => {
                                                const soil = Array.isArray(loc.soil_cache) ? loc.soil_cache[0] : loc.soil_cache;
                                                return soil?.map_unit_name || 'Expansive Clay';
                                            })()}
                                        </strong></span>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition" />
                            </div>
                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                {(() => {
                                    const soil = Array.isArray(loc.soil_cache) ? loc.soil_cache[0] : loc.soil_cache;
                                    const pi = soil?.plasticity_index;
                                    return `Review mapped ${pi ? `PI ${Number(pi).toFixed(1)}` : 'soil'} context in ${loc.city}, including moisture sensitivity and questions to consider during a property evaluation.`;
                                })()}
                            </p>
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wide flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Read Soil Report
                            </span>
                        </Link>
                            ))}
                        </div>
                    </section>
                )}

                <section aria-labelledby="regional-soil-profiles">
                    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <h2 id="regional-soil-profiles" className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-500 rounded-full" aria-hidden="true"></span>
                            Regional Soil Profiles
                        </h2>
                        <p className="text-sm text-slate-500">
                            Showing {firstResult.toLocaleString()}–{lastResult.toLocaleString()} of {count.toLocaleString()} reports
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {locations.map((loc) => (
                        <Link
                            key={loc.slug}
                            href={`/learn/${loc.slug}-soil-analysis`}
                            className="block bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition"
                        >
                            <h3 className="font-bold text-slate-900 mb-1">{loc.city} Soil Guide</h3>
                            <p className="text-xs text-slate-500 mb-3">
                                {(() => {
                                    const soil = Array.isArray(loc.soil_cache) ? loc.soil_cache[0] : loc.soil_cache;
                                    return soil?.map_unit_name || 'Local Geological Data';
                                })()}
                            </p>
                            <span className="text-blue-600 text-sm font-medium hover:underline">Read Analysis &rarr;</span>
                        </Link>
                        ))}
                    </div>

                    <Pagination
                        basePath="/learn"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemLabel="Soil reports"
                    />
                </section>

            </main>
        </div>
    );
}

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { MapPin, ShieldAlert, ChevronRight, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Pagination from '@/components/Pagination';
import { paginatedUrl, parsePageNumber, type PageSearchParams } from '@/lib/pagination';
import { STATE_FOUNDATION_GUIDES } from '@/lib/stateFoundationGuides';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 604800; // ISR: Cache for 1 week to protect Vercel compute and Supabase DB

const PAGE_SIZE = 36;

const STATE_NAMES: Record<string, string> = {
    "texas": "TX", "florida": "FL", "georgia": "GA", "colorado": "CO", 
    "tennessee": "TN", "north-carolina": "NC", "arizona": "AZ", "kansas": "KS", 
    "oklahoma": "OK", "mississippi": "MS", "louisiana": "LA", "missouri": "MO",
    "south-carolina": "SC", "virginia": "VA", "nevada": "NV", "utah": "UT"
};

const INVERSE_STATE_NAMES: Record<string, string> = {
    "TX": "Texas", "FL": "Florida", "GA": "Georgia", "CO": "Colorado", 
    "TN": "Tennessee", "NC": "North Carolina", "AZ": "Arizona", "KS": "Kansas", 
    "OK": "Oklahoma", "MS": "Mississippi", "LA": "Louisiana", "MO": "Missouri",
    "SC": "South Carolina", "VA": "Virginia", "NV": "Nevada", "UT": "Utah"
};

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ state: string }>;
    searchParams: PageSearchParams;
}): Promise<Metadata> {
    const { state } = await params;
    const stateAbbr = STATE_NAMES[state.toLowerCase()];
    if (!stateAbbr) return { title: "Not Found" };

    const fullStateName = INVERSE_STATE_NAMES[stateAbbr];
    const page = parsePageNumber((await searchParams).page) || 1;
    const baseUrl = `https://foundationrisk.org/locations/${state.toLowerCase()}`;
    const url = paginatedUrl(baseUrl, page);
    const title = page === 1
        ? `${fullStateName} Foundation Repair Service Areas | Foundation Risk Registry`
        : `${fullStateName} Foundation Repair Areas – Page ${page}`;
    const description = page === 1
        ? `Explore foundation repair service areas and local soil-risk profiles across ${fullStateName}. Select a city to review settlement conditions and evaluation options.`
        : `Browse page ${page} of foundation repair service areas and local soil-risk profiles across ${fullStateName}.`;

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

export default async function StateHubPage({
    params,
    searchParams,
}: {
    params: Promise<{ state: string }>;
    searchParams: PageSearchParams;
}) {
    const { state } = await params;
    const stateAbbr = STATE_NAMES[state.toLowerCase()];

    if (!stateAbbr) return notFound();

    const fullStateName = INVERSE_STATE_NAMES[stateAbbr];
    const foundationGuide = STATE_FOUNDATION_GUIDES[stateAbbr];
    const query = await searchParams;
    const basePath = `/locations/${state.toLowerCase()}`;
    if (query.page === '1') permanentRedirect(basePath);

    const currentPage = parsePageNumber(query.page);
    if (!currentPage) notFound();

    const rangeStart = (currentPage - 1) * PAGE_SIZE;
    const rangeEnd = rangeStart + PAGE_SIZE - 1;

    const { data: locations, count, error } = await supabase
        .from('target_locations')
        .select('city, slug', { count: 'exact' })
        .eq('state', stateAbbr)
        .order('city')
        .range(rangeStart, rangeEnd);

    if (error?.code === 'PGRST103') notFound();
    if (error) throw new Error(`Unable to load ${fullStateName} service areas: ${error.message}`);
    if (!locations || count === null || count === 0) return notFound();

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
    if (currentPage > totalPages) notFound();

    const currentPageUrl = paginatedUrl(
        `https://foundationrisk.org${basePath}`,
        currentPage,
    );
    const firstResult = rangeStart + 1;
    const lastResult = Math.min(rangeEnd + 1, count);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://foundationrisk.org" },
            { "@type": "ListItem", "position": 2, "name": "Service Areas", "item": "https://foundationrisk.org/locations" },
            {
                "@type": "ListItem",
                "position": 3,
                "name": currentPage === 1 ? fullStateName : `${fullStateName} – Page ${currentPage}`,
                "item": currentPageUrl,
            }
        ]
    };

    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            
            <header className="bg-slate-900 text-white py-16 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 -z-10" />
                <div className="max-w-7xl mx-auto">
                    <Link href="/locations" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to National Directory
                    </Link>
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-200 text-sm font-semibold mb-6 backdrop-blur-sm">
                        <ShieldAlert className="w-4 h-4 text-blue-400" />
                        <span>{fullStateName} Geological Authority</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        {fullStateName} Service Areas{currentPage > 1 ? ` – Page ${currentPage}` : ''}
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl">
                        Explore foundation repair and forensic evaluation options across <strong>{count.toLocaleString()} service areas</strong> in {fullStateName}. Select a city to view its local soil profile.
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Cities and Communities
                    </h2>
                    <p className="text-sm text-slate-500">
                        Showing {firstResult.toLocaleString()}–{lastResult.toLocaleString()} of {count.toLocaleString()} areas
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {locations.map(loc => (
                        <Link
                            key={loc.slug}
                            href={`/services/foundation-repair/${loc.slug}`}
                            className="group flex items-center justify-between bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 p-5 rounded-xl transition-all duration-200 hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-100 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <MapPin className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-800 group-hover:text-blue-800 text-lg">
                                        {loc.city}
                                    </span>
                                    <span className="block text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
                                        Foundation Repair
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                        </Link>
                    ))}
                </div>

                <Pagination
                    basePath={basePath}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemLabel={`${fullStateName} service areas`}
                />

                {currentPage === 1 && foundationGuide && (
                    <section
                        aria-labelledby="state-foundation-guide"
                        className="mt-16 border-t border-slate-200 pt-12"
                    >
                        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,1fr)]">
                            <div>
                                <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                                    Local context before a repair decision
                                </p>
                                <h2 id="state-foundation-guide" className="text-3xl font-bold tracking-tight text-slate-900">
                                    What {fullStateName} homeowners should know about soil and foundation movement
                                </h2>
                                <div className="mt-6 space-y-5 text-base leading-8 text-slate-700">
                                    {foundationGuide.overview.map(paragraph => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>

                            <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900">Signs worth documenting</h3>
                                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                                    {foundationGuide.watchFor.map(item => (
                                        <li key={item} className="flex gap-3">
                                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-hidden="true" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </aside>
                        </div>

                        <div className="mt-8 rounded-2xl bg-slate-900 px-6 py-7 text-slate-100 sm:px-8">
                            <h3 className="text-xl font-bold">A sensible evaluation sequence</h3>
                            <p className="mt-3 max-w-4xl leading-7 text-slate-300">
                                {foundationGuide.evaluation}
                            </p>
                            <Link
                                href="/learn"
                                className="mt-5 inline-flex items-center gap-2 font-semibold text-blue-300 hover:text-white"
                            >
                                Browse the soil-report library <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

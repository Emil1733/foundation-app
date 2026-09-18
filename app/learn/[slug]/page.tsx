import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Activity, Info, ShieldCheck, ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { getStateRoute } from "@/lib/stateRoutes";
import { classifySoilPlasticityIndex } from "@/lib/soilRisk";

export const revalidate = 86400;
export async function generateStaticParams() { return []; }

async function getCityData(slugParam: string) {
    if (!slugParam) return null;
    const citySlug = slugParam.replace('-soil-analysis', '');
    const { data: location, error: locError } = await supabase
        .from('target_locations')
        .select('id, city, state, created_at')
        .eq('slug', citySlug)
        .single();
    if (locError || !location) return null;

    const { data: soil, error: soilError } = await supabase
        .from('soil_cache')
        .select('*')
        .eq('location_id', location.id)
        .maybeSingle();
    if (soilError) console.error(`Error fetching soil for ${citySlug}:`, soilError);
    return { ...location, soil_cache: soil };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const cityData = await getCityData(slug);
    if (!cityData) return { title: 'Not Found' };
    const title = `${cityData.city} Foundation Soil Risk: Settlement Guide`;
    const description = `Check foundation soil risk in ${cityData.city}, ${cityData.state}. Review mapped ground conditions, warning signs, and sensible next steps before choosing a repair plan.`;
    return {
        title,
        description,
        alternates: { canonical: `https://foundationrisk.org/learn/${slug}` },
        openGraph: { title, description, url: `https://foundationrisk.org/learn/${slug}`, images: ['/logo.png'] },
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const cityData = await getCityData(slug);
    if (!cityData) notFound();

    const soil = Array.isArray(cityData.soil_cache) ? cityData.soil_cache[0] : cityData.soil_cache;
    if (!soil?.map_unit_name) notFound();

    const citySlug = slug.replace('-soil-analysis', '');
    const stateRoute = getStateRoute(cityData.state);
    const rawPi = soil.plasticity_index;
    const pi = rawPi === null || rawPi === undefined || rawPi === "" ? null : Number(rawPi);
    const hasPi = pi !== null && Number.isFinite(pi) && pi >= 0;
    const riskClass = classifySoilPlasticityIndex(soil.plasticity_index);
    const rawShrinkSwell = soil.shrink_swell_potential;
    const shrinkSwellNumber = rawShrinkSwell === null || rawShrinkSwell === undefined || rawShrinkSwell === "" ? null : Number(rawShrinkSwell);
    const shrinkSwell = shrinkSwellNumber !== null && Number.isFinite(shrinkSwellNumber) ? `${shrinkSwellNumber.toFixed(1)}% LEP` : 'Not reported';
    const mapUnitName = soil.map_unit_name;
    const componentName = soil.component_name || 'Not reported';
    const drainageClass = soil.drainage_class || 'Not reported';
    const publishedAt = soil.created_at || cityData.created_at;
    const publishedDate = new Date(publishedAt);
    const hasValidPublishedDate = !Number.isNaN(publishedDate.getTime());

    const riskContext = !hasPi
        ? 'A plasticity value was not available for this record, so no PI-based interpretation should be inferred.'
        : riskClass === 'Severe' || riskClass === 'High'
            ? `The recorded PI of ${pi!.toFixed(1)} makes moisture sensitivity worth considering alongside property-specific evidence. This is a screening signal, not proof that a foundation is moving.`
            : riskClass === 'Moderate'
                ? `The recorded PI of ${pi!.toFixed(1)} indicates some potential for moisture-related volume change. Drainage and site history remain important when interpreting symptoms.`
                : `The recorded PI of ${pi!.toFixed(1)} indicates lower mapped plasticity. Drainage, erosion, fill, plumbing leaks, and construction details can still affect support.`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Service Areas", "item": "https://foundationrisk.org/locations" },
                    { "@type": "ListItem", "position": 2, "name": `${cityData.city} Foundation Repair`, "item": `https://foundationrisk.org/services/foundation-repair/${citySlug}` },
                    { "@type": "ListItem", "position": 3, "name": `${cityData.city} Soil Analysis`, "item": `https://foundationrisk.org/learn/${slug}` }
                ]
            },
            {
                "@type": "Article",
                "headline": `${cityData.city} Soil and Foundation Risk: ${mapUnitName}`,
                ...(hasValidPublishedDate && { "datePublished": publishedDate.toISOString() }),
                "author": { "@type": "Organization", "name": "Foundation Risk Registry Research Team", "url": "https://foundationrisk.org/about" },
                "image": "https://foundationrisk.org/logo.png",
                "publisher": { "@type": "Organization", "name": "Foundation Risk Registry", "url": "https://foundationrisk.org", "logo": { "@type": "ImageObject", "url": "https://foundationrisk.org/logo.png" } },
                "description": `A plain-language review of mapped ${mapUnitName} conditions in ${cityData.city}, including soil plasticity, drainage context, warning signs, and appropriate next steps.`,
                "mainEntityOfPage": { "@type": "WebPage", "@id": `https://foundationrisk.org/learn/${slug}` }
            }
        ]
    };

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-50">
                <Link href="/book-analysis" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"><ShieldCheck className="w-5 h-5" /> Request a Foundation Evaluation</Link>
            </div>

            <main>
                <article className="max-w-3xl mx-auto py-12 px-6" itemScope itemType="https://schema.org/Article">
                    <header className="mb-10">
                        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
                            <ol className="flex flex-wrap items-center gap-2">
                                <li><Link href="/" className="hover:text-blue-700">Home</Link></li><li><ChevronRight className="h-3.5 w-3.5" /></li>
                                <li><Link href="/locations" className="hover:text-blue-700">Service Areas</Link></li><li><ChevronRight className="h-3.5 w-3.5" /></li>
                                <li><Link href={stateRoute.href} className="hover:text-blue-700">{stateRoute.name}</Link></li><li><ChevronRight className="h-3.5 w-3.5" /></li>
                                <li><Link href={`/services/foundation-repair/${citySlug}`} className="hover:text-blue-700">{cityData.city}</Link></li><li><ChevronRight className="h-3.5 w-3.5" /></li>
                                <li aria-current="page" className="text-slate-700">Soil report</li>
                            </ol>
                        </nav>
                        <div className="inline-flex bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">Local Soil Report</div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">{cityData.city} Soil and Foundation Risk: <span className="text-blue-700">{mapUnitName}</span></h1>
                        <div className="text-sm text-slate-600 border-l-4 border-blue-200 pl-4">Primary data: USDA/NRCS SSURGO. Mapped context only, not a property diagnosis.</div>
                    </header>

                    <aside className="mb-10 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 text-sm leading-6 text-slate-700">
                        <h2 className="text-base font-bold text-slate-900">How this report was prepared</h2>
                        <p className="mt-2">Foundation Risk Registry translates mapped USDA/NRCS soil data into plain-language foundation context. The figures describe a mapped soil unit around {cityData.city}; they do not confirm the soil directly beneath an individual home or diagnose structural movement.</p>
                    </aside>

                    <div className="mb-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                        <h2 className="text-xl font-bold text-slate-900">Looking for foundation repair in {cityData.city}?</h2>
                        <p className="mt-2 text-slate-700">Use this soil report as supporting context, then review warning signs, evaluation steps, repair-scope questions, and options on the commercial city guide.</p>
                        <Link href={`/services/foundation-repair/${citySlug}`} className="mt-4 inline-flex items-center gap-2 font-bold text-emerald-800 hover:underline">Foundation Repair in {cityData.city}, {cityData.state}<ChevronRight className="w-4 h-4" /></Link>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-12">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" /> Mapped Soil Profile: {cityData.city}, {cityData.state}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div><span className="block text-xs text-slate-500 uppercase font-bold">Soil Type</span><span className="font-bold text-slate-900">{componentName}</span></div>
                            <div><span className="block text-xs text-slate-500 uppercase font-bold">Plasticity (PI)</span><span className="font-mono text-xl font-bold text-slate-900">{hasPi ? pi!.toFixed(1) : 'N/A'}</span></div>
                            <div><span className="block text-xs text-slate-500 uppercase font-bold">Expansion Potential</span><span className="font-bold text-slate-900">{shrinkSwell}</span></div>
                            <div><span className="block text-xs text-slate-500 uppercase font-bold">Screening Class</span><span className="font-bold text-slate-900">{riskClass}</span></div>
                        </div>
                    </div>

                    <div className="prose prose-slate prose-lg max-w-none">
                        <h2>What the mapped data shows</h2>
                        <p>The USDA map unit associated with this {cityData.city} record is <strong>{mapUnitName}</strong>. Its listed component is <strong>{componentName}</strong>, with drainage reported as <strong>{drainageClass.toLowerCase()}</strong>. These labels describe an area on a survey map. Conditions can change within a lot and may be altered by grading, imported fill, construction, or drainage work.</p>
                        <p>{hasPi ? <>For this record, the Plasticity Index is <strong>{pi!.toFixed(1)}</strong> and the registry screening class is <strong>{riskClass}</strong>. </> : null}{riskContext}</p>

                        <h2>How to interpret this for a home in {cityData.city}</h2>
                        <p>A mapped screening class is context, not a diagnosis. Two houses in the same map unit can perform differently because of roof runoff, plumbing leaks, tree placement, slope, foundation design, and previous repairs.</p>
                        <p>Document where water collects after rain, photograph cracks with dates and a ruler for scale, and note changes in doors, windows, trim, and floors. If symptoms progress, property-specific measurements can help determine whether movement is active, historic, or cosmetic.</p>

                        <div className="my-8 bg-blue-50 border-l-4 border-blue-500 p-6 text-slate-700"><strong className="block text-slate-900">What this report cannot tell you</strong>Survey data does not establish bearing conditions beneath the house or the correct repair system, quantity, or depth. Those questions require property-specific evidence.</div>

                        <h2>What a sound evaluation should establish</h2>
                        <ul>
                            <li><strong>Is movement active?</strong> Compare dated symptoms and repeat measurements.</li>
                            <li><strong>Is water contributing?</strong> Review grading, drainage, irrigation, and plumbing.</li>
                            <li><strong>What supports the proposed scope?</strong> Ask how the repair design follows from measurements and site conditions.</li>
                        </ul>

                        <div className="bg-blue-600 text-white p-8 rounded-2xl not-prose my-12 shadow-xl">
                            <h3 className="text-xl font-bold">Check the mapped context for your address</h3>
                            <p className="text-blue-100 text-sm mb-4">Use local data as a screening step before deciding whether an on-site evaluation is needed.</p>
                            <AddressAutocomplete city={cityData.city} />
                        </div>
                    </div>

                    <div className="mt-16 bg-slate-900 rounded-2xl p-10 text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Need to evaluate foundation symptoms in {cityData.city}?</h2>
                        <p className="text-lg text-slate-300 mb-8">Move from mapped context to property-specific evidence before choosing a repair scope.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={`/services/foundation-repair/${citySlug}`} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl">Review {cityData.city} Foundation Repair Guide</Link>
                            <Link href="/book-analysis" className="border border-white/20 hover:bg-white/10 text-white font-bold py-3 px-8 rounded-xl">Request an Evaluation</Link>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}

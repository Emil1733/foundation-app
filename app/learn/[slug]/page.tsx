import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { MapPin, Activity, Info, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import AddressAutocomplete from "@/components/AddressAutocomplete";

export const revalidate = 86400; // ISR: Rebuild every 24 hours

// 1. Build pages on-demand instead of at build time to prevent Vercel timeout
export async function generateStaticParams() {
    return []; // Return empty array to force ISR on-demand generation
}

// 2. Fetch Data for Specific Slug
async function getCityData(slugParam: string) {
    if (!slugParam) return null;

    // Extract "plano-tx-75024" from "plano-tx-75024-soil-analysis"
    const citySlug = slugParam.replace('-soil-analysis', '');

    // Step 1: Get Location Data
    const { data: location, error: locError } = await supabase
        .from('target_locations')
        .select('*')
        .eq('slug', citySlug)
        .single();

    if (locError || !location) {
        console.error(`Error fetching location for ${citySlug}:`, locError);
        return null;
    }

    // Step 2: Get Soil Data manually to avoid JOIN issues
    const { data: soil, error: soilError } = await supabase
        .from('soil_cache')
        .select('*')
        .eq('location_id', location.id)
        .maybeSingle(); // Use maybeSingle as soil might be missing

    if (soilError) {
        console.error(`Error fetching soil for ${citySlug}:`, soilError);
    }

    // Combine data
    return {
        ...location,
        soil_cache: soil // This might be null, which is handled in the component
    };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const cityData = await getCityData(slug);
        if (!cityData) return { title: 'Not Found' };

        const title = `${cityData.city} Foundation Soil Risk: Settlement Guide`;
        const description = `Check foundation soil risk in ${cityData.city}, ${cityData.state}. Review mapped ground conditions, warning signs, and sensible next steps before choosing a repair plan.`;

        return {
            title,
            description,
            alternates: {
                canonical: `https://foundationrisk.org/learn/${slug}`,
            },
            openGraph: {
                title,
                description,
                url: `https://foundationrisk.org/learn/${slug}`,
                images: ['/logo.png'],
            },
        };
    } catch (e) {
        console.error('Metadata generation failed:', e);
        return { title: 'Foundation Analysis' };
    }
}

export default async function ArticlePage(props: { params: Promise<{ slug: string }> }) {
    try {
        const params = await props.params;
        console.log(`[Build Debug] Building page for slug: ${params.slug}`);
        const cityData = await getCityData(params.slug);

        if (!cityData) {
            console.error(`[Build Error] No city data found for slug: ${params.slug}`);
            notFound();
        }
        console.log(`[Build Debug] City Data keys: ${Object.keys(cityData).join(', ')}`);

        // Safe access for soil_cache which might come as array
        const rawSoil = cityData.soil_cache;
        const soil = Array.isArray(rawSoil) ? rawSoil[0] : rawSoil;
        console.log(`[Build Debug] Soil Data for ${params.slug}:`, JSON.stringify(soil));

        // Safe defaults if soil data is missing entirely
        const pi = Number(soil?.plasticity_index || 0);
        const rawNeighborhoods = Array.isArray(cityData.neighborhoods) ? cityData.neighborhoods : [];
        const neighborhoodNames = rawNeighborhoods.map((n: any) => typeof n === 'string' ? n : n?.name || 'Unknown Area');
        const shrinkSwell = Number(soil?.shrink_swell_potential || 0).toFixed(1);

        // LOGIC: DYNAMIC ADVICE BASED ON PI
        const isHighRisk = pi > 25;
        const isModerate = pi > 15 && pi <= 25;
        const citySlug = params.slug.replace('-soil-analysis', '');
        const mapUnitName = soil?.map_unit_name || 'Mapped local soil unit';
        const componentName = soil?.component_name || 'Not specified';
        const drainageClass = soil?.drainage_class || 'Not reported';
        const riskClass = soil?.risk_level || (isHighRisk ? 'High' : isModerate ? 'Moderate' : 'Lower');
        const riskContext = isHighRisk
            ? `The recorded PI of ${pi.toFixed(1)} suggests that moisture-related volume change deserves careful attention. This is a screening signal, not proof that a particular foundation is moving.`
            : isModerate
                ? `The recorded PI of ${pi.toFixed(1)} indicates some potential for moisture-related movement. Drainage and site history remain important when interpreting cracks or floor changes.`
                : `The recorded PI of ${pi.toFixed(1)} indicates relatively low plasticity. Expansive-soil movement may be less likely, although drainage, erosion, fill, plumbing leaks, and construction details can still affect support.`;
        const publishedAt = soil?.created_at || cityData.created_at;
        const updatedAt = soil?.updated_at || cityData.updated_at;
        const publishedDate = new Date(publishedAt);
        const hasValidPublishedDate = !Number.isNaN(publishedDate.getTime());
        const modifiedDate = updatedAt ? new Date(updatedAt) : null;
        const hasDistinctModifiedDate = Boolean(
            modifiedDate
            && !Number.isNaN(modifiedDate.getTime())
            && modifiedDate.getTime() !== publishedDate.getTime(),
        );
        const formattedPublishedDate = hasValidPublishedDate
            ? publishedDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC',
            })
            : null;

        // 2. Fetch "Nearby" Cities (Spiderweb - Nearest Neighbor Logic)
        const { data: allLocations } = await supabase
            .from("target_locations")
            .select("city, slug, latitude, longitude");

        let neighbors: any[] = [];

        if (allLocations && cityData.latitude && cityData.longitude) {
            const getDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
                const R = 6371; // km
                const dLat = ((lat2 - lat1) * Math.PI) / 180;
                const dLon = ((lon2 - lon1) * Math.PI) / 180;
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos((lat1 * Math.PI) / 180) *
                    Math.cos((lat2 * Math.PI) / 180) *
                    Math.sin(dLon / 2) *
                    Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c;
            };

            neighbors = allLocations
                .filter((l) => l.slug !== citySlug)
                .map((l) => ({
                    ...l,
                    dist: getDist(cityData.latitude, cityData.longitude, l.latitude, l.longitude),
                }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 6);
        }

        // SCHEMA.ORG JSON-LD (E-E-A-T & BREADCRUMBS)
        const jsonLd = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Service Areas",
                            "item": "https://foundationrisk.org/locations"
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": `${cityData.city} Foundation Repair`,
                            "item": `https://foundationrisk.org/services/foundation-repair/${citySlug}`
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": `${cityData.city} Soil Analysis`,
                            "item": `https://foundationrisk.org/learn/${params.slug}`
                        }
                    ]
                },
                {
                    "@type": "Article",
                    "headline": `${cityData.city} Soil and Foundation Risk: ${mapUnitName}`,
                    ...(hasValidPublishedDate && { "datePublished": publishedDate.toISOString() }),
                    ...(hasDistinctModifiedDate && { "dateModified": modifiedDate!.toISOString() }),
                    "author": {
                        "@type": "Organization",
                        "name": "Foundation Risk Registry Research Team",
                        "url": "https://foundationrisk.org/about"
                    },
                    "image": "https://foundationrisk.org/logo.png",
                    "publisher": {
                        "@type": "Organization",
                        "name": "Foundation Risk Registry",
                        "url": "https://foundationrisk.org",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://foundationrisk.org/logo.png"
                        }
                    },
                    "description": `A plain-language review of mapped ${mapUnitName} conditions in ${cityData.city}, including soil plasticity, drainage context, warning signs, and appropriate next steps.`,
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `https://foundationrisk.org/learn/${params.slug}`
                    }
                }
            ]
        };

        return (
            <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                {/* STICKY MOBILE CTA */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-50">
                <Link href="/book-analysis" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Request a Foundation Evaluation
                </Link>
            </div>
                <main>
                    <article
                        className="max-w-3xl mx-auto py-12 px-6"
                        itemScope
                        itemType="https://schema.org/Article"
                    >
                    {/* HEADER */}
                    <header className="mb-12">
                        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                            Local Soil Report
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                            {cityData.city} Soil and Foundation Risk: <span className="text-blue-700">{mapUnitName}</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-l-4 border-blue-200 pl-4 py-1">
                            <div>
                                <span className="block text-xs font-bold text-slate-900 uppercase tracking-tighter">Prepared by</span>
                                <Link href="/about" rel="author" itemProp="author" className="text-slate-700 hover:text-blue-700 hover:underline">
                                    Foundation Risk Registry Research Team
                                </Link>
                            </div>
                            {formattedPublishedDate && (
                                <div>
                                    <span className="block text-xs font-bold text-slate-900 uppercase tracking-tighter">Published</span>
                                    <time dateTime={publishedDate.toISOString()} itemProp="datePublished" className="text-slate-700">
                                        {formattedPublishedDate}
                                    </time>
                                </div>
                            )}
                            <div>
                                <span className="block text-xs font-bold text-slate-900 uppercase tracking-tighter">Primary data</span>
                                <span className="text-slate-700">USDA/NRCS SSURGO</span>
                            </div>
                        </div>
                    </header>

                    <aside className="mb-12 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 text-sm leading-6 text-slate-700" aria-labelledby="report-methodology">
                        <h2 id="report-methodology" className="text-base font-bold text-slate-900">How this report was prepared</h2>
                        <p className="mt-2">
                            Our research team translates mapped data from the <a href="https://www.nrcs.usda.gov/resources/data-and-reports/soil-survey-geographic-database-ssurgo" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">USDA Natural Resources Conservation Service SSURGO database</a> into plain-language foundation context. The figures describe the mapped soil unit around {cityData.city}; they do not confirm the soil directly beneath an individual home or diagnose structural movement.
                        </p>
                        <p className="mt-2">
                            Use this report as a starting point alongside drainage observations, crack history, and—when movement appears active—an independent on-site evaluation. Read more about <Link href="/about" className="font-semibold text-blue-700 hover:underline">our research approach</Link> and <Link href="/disclaimer" className="font-semibold text-blue-700 hover:underline">data limitations</Link>.
                        </p>
                    </aside>

                    {/* KEY STATS WIDGET */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-12">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" aria-hidden="true" />
                            Geological Profile: {cityData.city}, {cityData.state}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <span className="block text-xs text-slate-500 uppercase font-bold">Soil Type</span>
                                <span className="font-bold text-slate-900">{componentName}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase font-bold">Plasticity (PI)</span>
                                <span className={`font-mono text-xl font-bold ${isHighRisk ? 'text-red-700' : 'text-slate-900'}`}>
                                    {pi.toFixed(1)}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase font-bold">Expansion Potential</span>
                                <span className="font-bold text-slate-900">{shrinkSwell}% LEP</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase font-bold">Risk Class</span>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs text-white font-bold ${isHighRisk ? 'bg-red-700' : 'bg-green-700'}`}>
                                    {riskClass.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT BODY */}
                    <div className="prose prose-slate prose-lg max-w-none">

                        <h2 className="text-2xl font-bold text-slate-900">What the mapped data shows</h2>
                        <p>
                            The USDA map unit associated with this {cityData.city} record is <strong>{mapUnitName}</strong>. Its listed component is <strong>{componentName}</strong>, with a drainage classification of <strong>{drainageClass.toLowerCase()}</strong>. These labels describe an area on a survey map; conditions can change within a lot and may be altered by grading, imported fill, construction, or drainage work.
                        </p>
                        <p>
                            Plasticity Index measures how the fine-grained portion of a material changes as its moisture content changes. For this record, the PI is <strong>{pi.toFixed(1)}</strong> and the registry class is <strong>{riskClass}</strong>. {riskContext}
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-8">How to interpret this for a home in {cityData.city}</h2>
                        <p>
                            A mapped risk level is context, not a diagnosis. Two houses in the same map unit can perform differently because of roof runoff, plumbing leaks, tree placement, slope, foundation design, and previous repairs. A useful review compares the mapped ground conditions with what is actually happening at the property.
                        </p>
                        <p>
                            Begin with simple observations: note where water collects after rain, confirm that downspouts discharge away from the structure, and photograph cracks with dates and a ruler for scale. If doors, floors, or cracks continue to change, floor-elevation measurements and an independent structural evaluation can help determine whether movement is active, historic, or cosmetic.
                        </p>

                        <div className="my-8 bg-blue-50 border-l-4 border-blue-500 p-6 text-slate-700">
                            <strong className="block text-slate-900">What this report cannot tell you</strong>
                            Survey data does not establish the depth of seasonally active material, bearing capacity beneath the house, or the right repair system. Those questions require property-specific evidence and, when warranted, field investigation.
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mt-8">Warning signs worth tracking</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Cracks that are changing:</strong> Record width, length, and location rather than relying on a single photograph.</li>
                            <li><strong>Doors or windows that begin binding:</strong> Several related alignment changes are more informative than one sticky door.</li>
                            <li><strong>Floor-level changes:</strong> A measured pattern across multiple rooms provides better evidence than how a floor feels underfoot.</li>
                            <li><strong>Water-control problems:</strong> Ponding, erosion, leaking plumbing, or concentrated discharge can change support around part of a foundation.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 mt-8">What a sound evaluation should establish</h2>
                        <div className="not-prose mt-6 mb-8 overflow-hidden rounded-xl border border-slate-200">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-slate-50 font-bold text-slate-900">
                                    <tr>
                                        <th className="px-6 py-4">Question</th>
                                        <th className="px-6 py-4">Useful evidence</th>
                                        <th className="px-6 py-4">Why it matters</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    <tr>
                                        <td className="px-6 py-4 font-medium">Is movement active?</td>
                                        <td className="px-6 py-4">Dated crack records and repeat elevation measurements</td>
                                        <td className="px-6 py-4">Historic movement may not require structural work</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium">Is water contributing?</td>
                                        <td className="px-6 py-4">Grading, drainage, irrigation, and plumbing observations</td>
                                        <td className="px-6 py-4">Correcting the source may prevent further change</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium">What support is available?</td>
                                        <td className="px-6 py-4">Site exploration and a design tied to actual subsurface conditions</td>
                                        <td className="px-6 py-4">Repair type and depth cannot be selected from a map unit alone</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-blue-600 text-white p-8 rounded-2xl not-prose my-12 shadow-xl border-4 border-blue-400">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <ShieldCheck className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Check the mapped context for your address</h3>
                                    <p className="text-blue-100 text-sm">Use local data as a screening step before deciding whether an on-site evaluation is needed.</p>
                                </div>
                            </div>
                            <AddressAutocomplete city={cityData.city} />
                            <p className="text-center text-xs text-blue-50 mt-4 uppercase tracking-wider font-bold">
                                Property-specific evaluation · No repair recommendation from map data alone
                            </p>
                        </div>

                        {neighborhoodNames.length > 0 && (
                            <div className="not-prose">
                                <h3 className="text-xl font-bold text-slate-900">Communities included in the {cityData.city} directory</h3>
                                <p className="mt-2 text-slate-600">These names help organize nearby records; they do not imply that every property shares the same subsurface conditions.</p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {neighborhoodNames.map((n: string) => (
                                        <span key={n} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                                            {n}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SPIDERWEB (NEARBY CITIES) */}
                        {neighbors && neighbors.length > 0 && (
                            <div className="mt-12 mb-8 border-t border-slate-200 pt-10 not-prose">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" /> Nearby Regional Soil Reports
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {neighbors.map((n) => (
                                        <Link
                                            key={n.slug}
                                            href={`/learn/${n.slug}-soil-analysis`}
                                            prefetch={false}
                                            className="text-slate-500 hover:text-blue-600 text-sm flex items-center gap-2 transition-colors border border-slate-100 p-3 rounded-lg hover:border-blue-100 hover:bg-blue-50"
                                        >
                                            <Activity className="w-4 h-4 text-slate-300" /> {n.city} Soil Data
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CTA FOOTER */}
                    <div className="mt-16 bg-slate-900 rounded-2xl p-10 text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Unsure about your cracks?</h2>
                        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                            Don't guess. Compare your symptoms against our forensic database or take the diagnostic quiz.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/quiz" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition">
                                Take the 60-Second Quiz
                            </Link>
                            <Link href="/safety/visual-guide" className="bg-transparent border border-white/20 hover:bg-white/10 text-white font-bold py-3 px-8 rounded-xl transition flex items-center justify-center gap-2">
                                <Info className="w-5 h-5" /> View Visual Guide
                            </Link>
                        </div>
                    </div>

                    </article>
                </main>
            </div>
        );
    } catch (error) {
        console.error(`[Build Critical Error] Failed to render page`, error);
        return (
            <div className="p-12 text-center">
                <h1 className="text-2xl font-bold text-red-600">Engineering Data Unavailable</h1>
                <p className="text-slate-600">We could not retrieve the specific soil parameters for this location.</p>
            </div>
        );
    }
}

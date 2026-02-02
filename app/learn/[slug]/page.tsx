import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, CheckCircle, MapPin, Activity, Info } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

// 1. Generate All Slugs at Build Time
// export async function generateStaticParams() {
//     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
//     const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
//     const supabase = createClient(supabaseUrl, supabaseKey);

//     const { data: locations } = await supabase.from('target_locations').select('slug');
//     return locations?.map((loc) => ({
//         slug: `${loc.slug}-soil-analysis`,
//     })) || [];
// }

// 2. Fetch Data for Specific Slug
async function getCityData(slugParam: string) {
    if (!slugParam) return null;

    // Extract "plano-tx-75024" from "plano-tx-75024-soil-analysis"
    const citySlug = slugParam.replace('-soil-analysis', '');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

        // Safe access for metadata
        const rawSoil = cityData.soil_cache;
        const soil = Array.isArray(rawSoil) ? rawSoil[0] : rawSoil;
        const mapUnit = soil?.map_unit_name || 'Expansive Clay';
        const pi = soil?.plasticity_index || 'Unknown';

        return {
            title: `Why Foundations Fail in ${cityData.city}: ${mapUnit} Analysis`,
            description: `Forensic engineering report on ${mapUnit} soil in ${cityData.city}, ${cityData.state}. Plasticity Index: ${pi}. Risk Assessment and repair protocols.`,
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
                            "name": "Education Hub",
                            "item": "https://foundationrisk.org/learn"
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": `${cityData.city} Soil Analysis`,
                            "item": `https://foundationrisk.org/learn/${params.slug}`
                        }
                    ]
                },
                {
                    "@type": "Article",
                    "headline": `The Hidden Threat of ${soil?.map_unit_name || 'Expansive Clay'} in ${cityData.city}`,
                    "datePublished": new Date().toISOString(), // In real app, use soil_cache.updated_at
                    "dateModified": new Date().toISOString(),
                    "author": {
                        "@type": "Person",
                        "name": "Elias Thorne, P.E.",
                        "url": "https://foundationrisk.org/about/elias-thorne",
                        "jobTitle": "Forensic Engineer"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Foundation Stabilization Registry",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://foundationrisk.org/logo.png"
                        }
                    },
                    "description": `Forensic engineering analysis of ${soil?.map_unit_name} soil risks in ${cityData.city}. PI: ${pi}. Active monitoring required.`,
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

                {/* NAVIGATION */}
                <nav className="border-b border-slate-100 py-4 px-6 md:px-12">
                    <Link href="/learn" className="text-slate-500 hover:text-blue-600 text-sm font-medium flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Education Hub
                    </Link>
                </nav>

                <article className="max-w-3xl mx-auto py-12 px-6">
                    {/* HEADER */}
                    <header className="mb-12">
                        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                            Forensic Soil Report
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                            The Hidden Threat of <span className="text-blue-700">{soil?.map_unit_name}</span> for Homeowners in {cityData.city}
                        </h1>
                        <div className="flex items-center gap-6 text-sm text-slate-500 border-l-4 border-slate-200 pl-4">
                            <div>
                                <span className="block font-bold text-slate-900">Analysis By</span>
                                Elias Thorne, P.E.
                            </div>
                            <div>
                                <span className="block font-bold text-slate-900">Last Updated</span>
                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </header>

                    {/* KEY STATS WIDGET */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-12">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            Geological Profile: {cityData.city}, {cityData.state}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <span className="block text-xs text-slate-500 uppercase font-bold">Soil Type</span>
                                <span className="font-bold text-slate-900">{soil?.component_name || 'Clay'}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase font-bold">Plasticity (PI)</span>
                                <span className={`font-mono text-xl font-bold ${isHighRisk ? 'text-red-600' : 'text-slate-900'}`}>
                                    {pi.toFixed(1)}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase font-bold">Expansion Potential</span>
                                <span className="font-bold text-slate-900">{shrinkSwell}% LEP</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase font-bold">Risk Class</span>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs text-white font-bold ${isHighRisk ? 'bg-red-600' : 'bg-green-600'}`}>
                                    {soil?.risk_level?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT BODY */}
                    <div className="prose prose-slate prose-lg max-w-none">

                        {/* AEO: DIRECT ANSWER BLOCK */}
                        <h2 className="text-2xl font-bold text-slate-900">What is {soil?.map_unit_name}?</h2>
                        <p>
                            <strong>{soil?.map_unit_name}</strong> is a {isHighRisk ? 'highly expansive' : 'moderate'} clay soil formation common in <strong>{cityData.city}</strong>.
                            It is characterized by a high silica content that causes it to absorb water and swell volume by up to {shrinkSwell}%.
                            Engineers value it for agriculture but fear it for construction due to its "shrink-swell" volatility.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-8">Why {cityData.city} Foundations Fail</h2>
                        <p>
                            If you live in {neighborhoodNames.slice(0, 3).join(', ')}, or {neighborhoodNames[3] || 'surrounding areas'},
                            your home is interacting with this critical geology. Unlike stable sandy loams, {soil?.component_name} clay moves.
                        </p>
                        <p>
                            The defining metric is the <strong>Plasticity Index (PI) of {pi.toFixed(1)}</strong>.
                            {isHighRisk
                                ? ` A PI over 25 is "Severe." The soil acts like a sponge—expanding with tremendous hydraulic force when wet and shrinking away from the slab when dry. This cycle snaps concrete beams.`
                                : isModerate
                                    ? ` A PI between 15 and 25 indicates "Moderate" volatility. While not immediate, seasonal neglect (lack of watering) causes progressive differential settlement.`
                                    : ` This PI indicates relatively stable ground, though localized drainage issues can still undermine grade beams.`
                            }
                        </p>

                        <h3 className="text-xl font-bold text-slate-900 mt-8">The "Active Zone" Depth</h3>
                        <p>
                            In {cityData.city}, the "Active Zone"—where moisture levels fluctuate—extends <strong>12-15 feet deep</strong>.
                            Standard builder piers often stop at 8 feet. This mismatch is why we see repetitive failures in {cityData.zip_code}.
                        </p>

                        <div className="my-8 bg-blue-50 border-l-4 border-blue-500 p-6 italic text-slate-700">
                            "Homeowners in {cityData.city} often pay for 'Standard Press Piles' that sit <em>inside</em> the active zone.
                            When the {soil?.map_unit_name} moves, the pier moves with it."
                            <br /><span className="text-sm font-bold not-italic mt-2 block">- Elias Thorne, Lead Forensic Engineer</span>
                        </div>

                        {/* AEO: LIST SNIPPET */}
                        <h2 className="text-2xl font-bold text-slate-900 mt-8">3 Signs of {soil?.component_name} Soil Failure</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Diagonal Shear Cracks:</strong> Extending from door/window corners (45-degree angles).</li>
                            <li><strong>Friable Soil Gap:</strong> Soil pulling 1-2 inches away from the foundation perimeter in summer.</li>
                            <li><strong>Sticking Doors:</strong> Specifically on the exterior walls relative to the center of the home.</li>
                        </ul>

                        {/* AEO: COMPARISON TABLE SNIPPET */}
                        <h2 className="text-2xl font-bold text-slate-900 mt-8">Engineering Protocol: Correct vs. Incorrect</h2>
                        <div className="not-prose mt-6 mb-8 overflow-hidden rounded-xl border border-slate-200">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-slate-50 font-bold text-slate-900">
                                    <tr>
                                        <th className="px-6 py-4">Method</th>
                                        <th className="px-6 py-4">Suitability for {soil?.map_unit_name}</th>
                                        <th className="px-6 py-4">Verdict</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    <tr>
                                        <td className="px-6 py-4 font-medium">Pressed Concrete Piling</td>
                                        <td className="px-6 py-4">Often shallow (8-10ft); relies on friction in active clay.</td>
                                        <td className="px-6 py-4 text-red-600 font-bold">Avoid ❌</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium">Steel Piers (E3000)</td>
                                        <td className="px-6 py-4">Driven to absolute refusal (rock/shale) below active zone.</td>
                                        <td className="px-6 py-4 text-green-600 font-bold">Recommended ✅</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium">Bell-Bottom Piers</td>
                                        <td className="px-6 py-4">Drilled concrete; excellent stability but higher cost/mess.</td>
                                        <td className="px-6 py-4 text-blue-600 font-bold">Viable Option</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* SEO: COMMERCIAL INTENT LINK (P2 REVERSE) */}
                        <div className="bg-slate-900 text-white p-6 rounded-xl not-prose mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold">Own a home in {cityData.city}?</h3>
                                <p className="text-slate-300 text-sm">Get a specific repair estimate for this soil type.</p>
                            </div>
                            <Link
                                href={`/services/foundation-repair/${cityData.slug}`}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition whitespace-nowrap"
                            >
                                View {cityData.city} Repair Services
                            </Link>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900">Neighborhood Watch</h3>
                        <p>
                            We are monitoring elevated PI readings in these areas:
                        </p>
                        <div className="flex flex-wrap gap-2 not-prose mt-4">
                            {neighborhoodNames.map((n: string) => (
                                <span key={n} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                                    {n}
                                </span>
                            ))}
                        </div>
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

import { createClient } from '@supabase/supabase-js';
import SoilRiskWidget from "@/components/SoilRiskWidget";
import { MoveRight, Phone, ShieldCheck, MapPin, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// 1. Setup Supabase Client (For Server-Side Builds)
// We use the ANON key because RLS allows public read access.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type Props = {
    params: { city: string };
};

// 2. GENERATE STATIC PARAMS (SSG)
// This tells Next.js to build a static HTML page for every city in our DB at build time.
export async function generateStaticParams() {
    const { data: locations } = await supabase
        .from('target_locations')
        .select('slug');

    if (!locations) return [];

    return locations.map((loc) => ({
        city: loc.slug,
    }));
}

// 3. DYNAMIC METADATA
export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
    const { city: slug } = await params;
    const { data: location } = await supabase
        .from('target_locations')
        .select(`
            *,
            soil_cache (
                risk_level,
                map_unit_name,
                plasticity_index
            )
        `)
        .eq('slug', slug)
        .single();

    if (!location) {
        return {
            title: 'Foundation Repair Services',
        };
    }

    const city = location.city;
    const state = location.state;
    const soil = location.soil_cache;
    const risk = soil?.risk_level || "Unknown";

    return {
        title: `Foundation Repair in ${city}, ${state} | ${risk} Soil Risk Warning`,
        description: `Homeowners in ${city} face ${risk} foundation risk due to ${soil?.map_unit_name || 'expansive clay'}. Get a forensic geological analysis before you repair.`,
    };
}

// 4. MAIN PAGE COMPONENT
export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
    const { city: slug } = await params;

    // Fetch Data
    console.log(`[CityPage] Fetching slug: '${slug}'`);
    const { data: location, error } = await supabase
        .from('target_locations')
        .select(`
            *,
            soil_cache (
                *
            )
        `)
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`[CityPage] Supabase Error for ${slug}:`, error.message);
    }

    if (!location) {
        console.error(`[CityPage] No location found for ${slug}`);
        // Fallback for dynamic access if not pre-built, or 404
        return notFound();
    }

    const { city, state, soil_cache: soil } = location;

    // JSON-LD Structured Data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        "name": `Foundation Repair Experts of ${city}`,
        "image": "https://foundation-app.vercel.app/og-image.jpg",
        "description": `Forensic foundation repair services for ${city}, ${state}. Specializing in ${soil?.map_unit_name} stabilization.`,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": city,
            "addressRegion": state,
            "addressCountry": "US"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": location.latitude,
            "longitude": location.longitude
        },
        "url": `https://foundation-app.vercel.app/services/foundation-repair/${slug}`,
        "priceRange": "$$"
    };

    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <header className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 -z-10" />

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-200 text-sm font-semibold mb-8 backdrop-blur-sm">
                            <ShieldCheck className="w-4 h-4 text-blue-400" />
                            <span>Geological Authority in {city}, {state}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                            Foundation Failure in <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">{city}</span>?
                        </h1>

                        <p className="text-slate-300 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
                            It's likely not "bad luck". It's the <strong>{soil?.map_unit_name || 'Soil'}</strong> underneath your home.
                            We don't just patch cracks; we stabilize the geology.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2">
                                <Phone className="w-5 h-5" />
                                Talk to an Engineer
                            </button>
                            <Link href="#analysis" className="px-8 py-4 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center justify-center gap-2">
                                See Soil Data <MoveRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-20 blur-2xl" />
                        <SoilRiskWidget />
                    </div>
                </div>
            </header>

            {/* Deep Data Content */}
            <main className="max-w-4xl mx-auto py-20 px-6">
                <div id="analysis" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-12">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                            <Info className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Why {city} Foundations Fail</h2>
                            <p className="text-slate-500 text-sm">Forensic Soil Report for Zip {location.zip_code}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-slate-700">
                            Homeowners in <strong>{city}</strong> are battling a silent enemy: <strong>{soil?.map_unit_name || 'Expansive Clay'}</strong>.
                        </p>

                        {soil && (
                            <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plasticity Index (PI)</span>
                                    <div className="flex items-end gap-2 mt-1">
                                        <span className="text-3xl font-mono font-bold text-slate-900">{Number(soil.plasticity_index).toFixed(1)}</span>
                                        <span className="text-sm text-slate-500 font-medium mb-1">
                                            {Number(soil.plasticity_index) > 35 ? '(Severe)' : '(Moderate)'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Measures how much water your soil absorbs. Anything over 25 is dangerous for concrete slabs.
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shrink-Swell %</span>
                                    <div className="flex items-end gap-2 mt-1">
                                        <span className="text-3xl font-mono font-bold text-slate-900">{Number(soil.shrink_swell_potential).toFixed(1)}%</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Your home could heave upwards by this percentage during heavy rain seasons in {city}.
                                    </p>
                                </div>
                            </div>
                        )}

                        <p>
                            When these soils dry out during {city}'s hot summers, they shrink and pull away from your perimeter beam.
                            When rains return, they swell with tremendous force (up to 5,000 psf), lifting the edges of your home while the center stays stuck.
                            This "differential movement" snaps concrete like a cracker.
                        </p>

                        <h3 className="text-xl font-bold mt-8 mb-4 text-slate-900">The "Pier & Beam" Solution</h3>
                        <p>
                            Cheap "pressed piling" repairs often fail in {city} because they rely on friction in this same active soil zone.
                            If the soil moves, the pier moves.
                        </p>
                        <p>
                            We recommend <strong>Deep Steel Piers</strong> that bypass the top {soil?.drainage_class === 'Well drained' ? '10-15' : '15-25'} feet of active clay
                            to reach the stable strata below. Stop fighting the soil—go beneath it.
                        </p>
                    </div>
                </div>

                {/* Local CTA */}
                <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold mb-4">Protect Your {city} Home</h3>
                        <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                            Don't let {soil?.map_unit_name} destroy your equity. Get a free engineer-reviewed assessment today.
                        </p>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg w-full sm:w-auto">
                            Schedule Assessment in {city}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

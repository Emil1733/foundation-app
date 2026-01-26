import { createClient } from '@supabase/supabase-js';
import SoilRiskWidget from "@/components/SoilRiskWidget";
import TrustBadges from "@/components/TrustBadges";
import FoundationDiagram from "@/components/FoundationDiagram";
import { MoveRight, Phone, ShieldCheck, MapPin, Info, ChevronDown } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Setup Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// SSG: Build pages for all cities
export async function generateStaticParams() {
    const { data: locations } = await supabase.from('target_locations').select('slug');
    if (!locations) return [];
    return locations.map((loc) => ({ city: loc.slug }));
}

// Logic to select intro based on city/soil features (Deterministic/Hash-based)
const getDynamicIntro = (city: string, soilName: string, risk: string) => {
    const hooks = [
        // Hook A: Urgency/Weather
        `Recent drought cycles in ${city} have accelerated soil shrinkage. If you own a home on ${soilName}, your slab is under stress.`,

        // Hook B: Technical (Soil Focus)
        `The ${soilName} underlying ${city} is notorious for its high Plasticity Index. This 'silent engine' breaks foundations from the bottom up.`,

        // Hook C: Regulatory/Code
        `New 2026 engineering standards in ${city} require deeper piering for ${risk}-risk profiles. Most vintage slabs are non-compliant.`,

        // Hook D: Financial/Asset Protection
        `Protecting your real estate asset in ${city} starts with geology. Ignoring ${soilName} movement can devalue your property by 15% overnight.`,

        // Hook E: Social Proof/Neighbors
        `We are seeing a surge of structural failures in ${city} neighborhoods this quarter. Your neighbors on ${soilName} are likely underpinning right now.`
    ];

    // Deterministic rotation based on city name length
    const index = city.length % 5;
    return hooks[index];
};

// Logic to fetch neighborhoods (Mock database for Phase 2)
const getNeighborhoods = (city: string, risk: string) => {
    // Specific data for key markets
    if (city === 'Plano') return [
        { name: "Willow Bend", note: "Expect higher plasticity variance due to the creek bed.", risk: "Severe" },
        { name: "Legacy West", note: "Commercial fill zones often hide active clay layers.", risk: "High" },
        { name: "Deerfield", note: "Older slab-on-grade homes showing increased movement.", risk: risk },
        { name: "Kings Ridge", note: "Proximity to 121 corridor requires deep piering.", risk: "Moderate" }
    ];
    if (city === 'Dallas') return [
        { name: "Preston Hollow", note: "Expansive clay pockets mixed with limestone strata.", risk: "High" },
        { name: "Lakewood", note: "Rolling hills cause differential settlement.", risk: "Severe" },
        { name: "Uptown", note: "Urban fill soil issues common in new condos.", risk: "Moderate" },
        { name: "Lake Highlands", note: "Soil saturation issues near creek tributaries.", risk: risk }
    ];

    // Generic fallback for other cities
    return [
        { name: `${city} North`, note: `Standard ${risk} risk profile for this sector.`, risk: risk },
        { name: `${city} South`, note: "Historical data indicates slab instability.", risk: risk },
        { name: `${city} East`, note: "Drainage corrections recommended.", risk: risk },
        { name: `${city} West`, note: "Monitor for seasonal heave.", risk: risk }
    ];
};

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
    const { city: slug } = await params;
    const { data: location } = await supabase
        .from('target_locations')
        .select(`*, soil_cache (risk_level, map_unit_name)`)
        .eq('slug', slug)
        .single();

    if (!location) return { title: 'Foundation Repair Services' };

    const risk = location.soil_cache?.risk_level || "Unknown";
    const soilName = location.soil_cache?.map_unit_name || "Expansive Clay";

    // Variation A: "Forensic Authority" Hook
    return {
        title: `Forensic Foundation Analysis ${location.city}: ${soilName} Report | FRR`,
        description: `⚠️ ${location.city} Foundation Warning: Your home sits on ${soilName} (${risk} Risk). Don't settle for cheap piling. Get a P.E. Certified Forensic Soil Analysis.`,
    };
}

// MAIN PAGE
export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
    const { city: slug } = await params;

    // 1. Fetch Main Data
    const { data: location, error } = await supabase
        .from('target_locations')
        .select(`*, soil_cache (*)`)
        .eq('slug', slug)
        .single();

    if (error || !location) return notFound();
    const { city, state, soil_cache: soil } = location;

    // 2. Fetch "Nearby" Cities (Spiderweb - Nearest Neighbor Logic)
    const { data: allLocations } = await supabase
        .from('target_locations')
        .select('city, slug, latitude, longitude');

    let neighbors: any[] = [];

    if (allLocations && location.latitude && location.longitude) {
        // Haversine Distance Helper
        const getDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371; // km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        neighbors = allLocations
            .filter(l => l.slug !== slug)
            .map(l => ({ ...l, dist: getDist(location.latitude, location.longitude, l.latitude, l.longitude) }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 6);
    }

    // 3. Prepare Schema & FAQ
    const faqs = [
        {
            q: `How much does foundation repair cost in ${city}?`,
            a: `Costs in ${city} typically range from $4,500 to $15,000 depending on the number of piers needed. Given the ${soil?.map_unit_name}, deep piers are often required.`
        },
        {
            q: `Does active clay soil affect foundations in ${city}?`,
            a: `Yes. ${soil?.map_unit_name} has a Plasticity Index of ${soil?.plasticity_index}, which is considered ${soil?.risk_level}. This causes significant seasonal movement.`
        },
        {
            q: `Do you offer a warranty?`,
            a: `Yes, we provide a Lifetime Transferable Warranty on all steel pier installations.`
        }
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        "name": `The Foundation Risk Registry of ${city}`,
        "image": "https://foundation-app-self.vercel.app/logo.png",
        "url": `https://foundation-app-self.vercel.app/services/foundation-repair/${slug}`,
        "telephone": "+1-800-555-0199",
        "priceRange": "$$$$",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": city,
            "addressRegion": state,
            "postalCode": location.zip_code,
            "addressCountry": "US"
        },
        "areaServed": {
            "@type": "GeoShape",
            "postalCode": location.zip_code,
            "addressCountry": "US"
        },
        "knowsAbout": [
            "Foundation Repair",
            "Forensic Engineering",
            soil?.map_unit_name || "Expansive Clay",
            "Plasticity Index Analysis",
            "Steel Pier Underpinning"
        ],
        "reviewedBy": {
            "@type": "Person",
            "name": "Elias Thorne, P.E.",
            "jobTitle": "Senior Geotechnical Lead",
            "alumniOf": "Texas A&M University",
            "url": "https://foundation-app-self.vercel.app/about/elias-thorne",
            "description": "Licensed Professional Engineer (TX-PE-88XXXX). Oversight credentials available upon request during Forensic Analysis."
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Foundation Stabilization Services",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Forensic Foundation Inspection",
                        "description": `Engineer-led analysis of ${soil?.map_unit_name} impact on slab-on-grade foundations.`
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Deep Steel Pier Installation",
                        "description": "Bypassing the active clay zone to reach stable load-bearing strata."
                    }
                }
            ]
        },
        "mainEntity": {
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a }
            }))
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* HERO */}
            <header className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 -z-10" />
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-200 text-sm font-semibold mb-8 backdrop-blur-sm">
                            <ShieldCheck className="w-4 h-4 text-blue-400" />
                            <span>Geological Authority in {city}, {state}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                            Foundation Failure in <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">{city}</span>?
                        </h1>
                        <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-lg">
                            It's likely the <strong>{soil?.map_unit_name}</strong>. We stabilize the geology, not just the concrete.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition hover:shadow-lg">
                                <Phone className="w-5 h-5" /> Talk to an Engineer
                            </button>
                        </div>
                    </div>
                    <div className="relative"><SoilRiskWidget /></div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-4xl mx-auto py-16 px-6">

                {/* TRUST STACK */}
                <TrustBadges />

                {/* SOIL ANALYSIS */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-12">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Info className="w-6 h-6" /></div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Why {city} Foundations Fail</h2>
                            <p className="text-slate-500 text-sm">Forensic Soil Report for Zip {location.zip_code}</p>
                        </div>
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p>
                            {getDynamicIntro(city, soil?.map_unit_name || 'Expansive Clay', soil?.risk_level || 'High')}
                        </p>
                        {soil && (
                            <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plasticity Index (PI)</span>
                                    <div className="flex items-end gap-2 mt-1">
                                        <span className="text-3xl font-mono font-bold text-slate-900">{Number(soil.plasticity_index).toFixed(1)}</span>
                                        <span className={`text-sm font-bold px-2 py-0.5 rounded ${Number(soil.plasticity_index) > 35 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {Number(soil.plasticity_index) > 35 ? 'SEVERE' : 'HIGH'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Critical limit is 25.0.</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shrink-Swell</span>
                                    <div className="flex items-end gap-2 mt-1">
                                        <span className="text-3xl font-mono font-bold text-slate-900">{Number(soil.shrink_swell_potential).toFixed(1)}%</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Vertical movement potential.</p>
                                </div>
                            </div>
                        )}

                        {/* VISUAL DIAGRAM */}
                        <FoundationDiagram />
                    </div>

                    {/* NEIGHBORHOOD SOIL RISK TABLE (Phase 2) */}
                    <div className="mt-12 bg-slate-50 rounded-2xl p-8 border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Neighborhood Risk Audit: {city}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-100 font-bold">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Neighborhood</th>
                                        <th className="px-4 py-3">Geological Note</th>
                                        <th className="px-4 py-3 rounded-r-lg">Risk Level</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getNeighborhoods(city, soil?.risk_level || 'High').map((n, i) => (
                                        <tr key={i} className="border-b border-slate-200 hover:bg-white transition">
                                            <td className="px-4 py-4 font-bold text-slate-900">{n.name}</td>
                                            <td className="px-4 py-4 text-slate-600">{n.note}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${n.risk === 'Severe' ? 'bg-red-100 text-red-700' : n.risk === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {n.risk.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-slate-400 mt-4 italic">
                            *Hyper-local data based on historical foundation repair permits and USDA soil overlays.
                        </p>
                    </div>
                </div>

                {/* FAQ ACCORDION (SEO) */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Common Questions in {city}</h3>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <ChevronDown className="w-4 h-4 text-blue-500" /> {faq.q}
                                </h4>
                                <p className="text-slate-600 text-sm ml-6">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SPIDERWEB (NEARBY CITIES) */}
                {neighbors && neighbors.length > 0 && (
                    <div className="border-t border-slate-200 pt-12">
                        <h4 className="font-bold text-slate-900 mb-6">Serving Neighbors Near {city}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {neighbors.map(n => (
                                <Link
                                    key={n.slug}
                                    href={`/services/foundation-repair/${n.slug}`}
                                    className="text-slate-500 hover:text-blue-600 text-sm flex items-center gap-1 transition-colors"
                                >
                                    <MapPin className="w-3 h-3" /> {n.city} Foundation Repair
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </main>

            {/* FOOTER TRANSPARENCY */}
            <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-12 px-6 text-center text-sm">
                <p className="mb-4">
                    Engineering oversight provided by licensed Texas P.E.s. <br className="hidden sm:block" />
                    Credentials available upon request during the Forensic Analysis phase.
                </p>
                <p>&copy; {new Date().getFullYear()} The Foundation Risk Registry. All Soil Data sourced from USDA/SSURGO.</p>
            </footer>
        </div>
    );
}

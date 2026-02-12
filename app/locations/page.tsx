import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const metadata = {
    title: "Service Area Directory | Foundation Risk Registry",
    description: "Explore our forensic engineering service areas across Texas, Oklahoma, and Missouri. Geological profiles for every zip code.",
};

export const revalidate = 3600; // ISR every hour

export default async function LocationsMap() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://foundationrisk.org"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Service Area Directory",
                "item": "https://foundationrisk.org/locations"
            }
        ]
    };

    const { data: locations } = await supabase
        .from('target_locations')
        .select('city, state, slug')
        .order('city');

    if (!locations) return <div>Loading...</div>;

    // Group by State
    const byState = locations.reduce((acc, loc) => {
        if (!acc[loc.state]) acc[loc.state] = [];
        acc[loc.state].push(loc);
        return acc;
    }, {} as Record<string, typeof locations>);

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <header className="bg-slate-900 text-white py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-4">Forensic Service Area Directory</h1>
                    <p className="text-slate-400 leading-relaxed mb-6">
                        Complete index of all foundation repair zones monitored by our forensic analysis network. Each location listed represents a unique geological profile where the <strong>Plasticity Index (PI)</strong> and <strong>Linear Extensibility</strong> have been audited against USDA/SSURGO datasets for structural risk.
                    </p>
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Regional Risk Dynamics</h3>
                            <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                Foundation movement is highly localized. Properties in North Dallas might sit on Austin Chalk, while those in Houston deal with high-shrinkage Beaumont Clay. Our directory helps you identify the specific failure modes associated with your local soil series.
                            </p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                We monitor three primary "corridors of failure": The I-35 Clay Belt, the Blackland Prairie, and the Gulf Coast Transgressive Sequence. Each requires a different forensic approach to stabilization.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Data Integrity Standards</h3>
                            <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                Our data is refreshed quarterly using direct pulls from the Web Soil Survey (WSS). We prioritize "representative values" for PI and LEP to ensure that our risk forecasts account for the most common geological strata within a given map unit.
                            </p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                This directory is intended for forensic reference only. If your specific zip code is not listed, our team may still have borehole data available in our offline archives.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-12 px-6">
                {Object.keys(byState).sort().map(state => (
                    <div key={state} className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">
                            {state}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {byState[state].map((loc) => (
                                <Link
                                    key={loc.slug}
                                    href={`/services/foundation-repair/${loc.slug}`}
                                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors p-2 rounded hover:bg-slate-50"
                                >
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium">{loc.city}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="mt-20 p-8 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <h3 className="font-bold text-slate-900 mb-2">Don't see your city?</h3>
                    <p className="text-slate-500 text-sm mb-4">Our engineers are constantly expanding the soil risk registry.</p>
                    <Link href="/" className="text-blue-600 font-bold hover:underline">
                        Request coverage for your zip code &rarr;
                    </Link>
                </div>
            </main>
        </div>
    );
}

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { MapPin, ShieldAlert } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const metadata = {
    title: "Texas Foundation Repair Service Areas | Foundation Risk Registry",
    description: "Explore our forensic engineering service areas across Texas. We provide permanent foundation repair solutions in Dallas, Houston, Austin, and surrounding regions.",
};

export const revalidate = 3600;

export default async function LocationsMap() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://foundationrisk.org" },
            { "@type": "ListItem", "position": 2, "name": "Texas Service Areas", "item": "https://foundationrisk.org/locations" }
        ]
    };

    const { data: locations } = await supabase
        .from('target_locations')
        .select('city, state, slug')
        .eq('state', 'TX')
        .order('city');

    if (!locations) return <div>Loading...</div>;

    const houstonCities = ['Houston', 'Katy', 'Cypress', 'Sugar Land', 'Pearland', 'Spring', 'League City', 'Conroe', 'Tomball'];
    const dallasCities = ['Dallas', 'Fort Worth', 'Frisco', 'McKinney', 'Plano', 'Allen', 'Rockwall', 'Flower Mound', 'Lewisville', 'Richardson', 'Garland', 'Irving', 'Mesquite', 'The Colony'];
    const austinCities = ['Austin', 'Round Rock', 'Cedar Park', 'Pflugerville', 'Georgetown', 'Kyle'];

    const clusters = {
        'Houston Metro': locations.filter(loc => houstonCities.includes(loc.city)),
        'Dallas - Fort Worth': locations.filter(loc => dallasCities.includes(loc.city)),
        'Austin Metro': locations.filter(loc => austinCities.includes(loc.city)),
        'Additional Texas Markets': locations.filter(loc => !houstonCities.includes(loc.city) && !dallasCities.includes(loc.city) && !austinCities.includes(loc.city))
    };

    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            
            <header className="bg-slate-900 text-white py-16 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 -z-10" />
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-200 text-sm font-semibold mb-8 backdrop-blur-sm">
                        <ShieldAlert className="w-4 h-4 text-blue-400" />
                        <span>Statewide Geological Authority</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Texas Foundation Repair Coverage</h1>
                    <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        Texas contains some of the most destructive expansive clay soils in the United States. We provide forensic evaluation and permanent steel pier stabilization across the major metroplexes. Select your city below to view local soil risks.
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto py-16 px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {Object.entries(clusters).map(([region, cities]) => {
                        if (cities.length === 0) return null;
                        return (
                            <div key={region} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">
                                    {region}
                                </h2>
                                <ul className="space-y-3">
                                    {cities.map(loc => (
                                        <li key={loc.slug}>
                                            <Link
                                                href={`/services/foundation-repair/${loc.slug}`}
                                                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition group"
                                            >
                                                <MapPin className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition" />
                                                {loc.city}, TX
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    );
}

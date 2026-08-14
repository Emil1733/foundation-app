import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { MapPin, ShieldAlert, ChevronRight } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const metadata = {
    title: "National Foundation Repair Service Areas | Foundation Risk Registry",
    description: "Explore our forensic engineering service areas across the United States. We provide permanent foundation repair solutions in high-risk soil zones nationwide.",
};

export const revalidate = 0; // CRITICAL: Force dynamic rendering so new clusters appear immediately

const STATE_NAMES: Record<string, string> = {
    "TX": "Texas", "FL": "Florida", "GA": "Georgia", "CO": "Colorado", 
    "TN": "Tennessee", "NC": "North Carolina", "AZ": "Arizona", "KS": "Kansas", 
    "OK": "Oklahoma", "MS": "Mississippi", "LA": "Louisiana", "MO": "Missouri",
    "SC": "South Carolina", "VA": "Virginia", "NV": "Nevada", "UT": "Utah"
};

export default async function LocationsMap() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://foundationrisk.org" },
            { "@type": "ListItem", "position": 2, "name": "Service Areas", "item": "https://foundationrisk.org/locations" }
        ]
    };

    const { data: locations } = await supabase
        .from('target_locations')
        .select('city, state, slug')
        .order('state')
        .order('city');

    if (!locations) return <div>Loading...</div>;

    // Dynamically group locations by state
    const clusters: Record<string, typeof locations> = {};
    locations.forEach(loc => {
        if (!clusters[loc.state]) clusters[loc.state] = [];
        clusters[loc.state].push(loc);
    });
    
    const sortedStates = Object.keys(clusters).sort();

    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            
            <header className="bg-slate-900 text-white py-16 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 -z-10" />
                <div className="max-w-7xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-200 text-sm font-semibold mb-6 backdrop-blur-sm">
                        <ShieldAlert className="w-4 h-4 text-blue-400" />
                        <span>National Geological Authority</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">National Service Directory</h1>
                    <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl">
                        We provide forensic evaluation and permanent structural stabilization across the most high-risk geological zones in the United States. 
                        Select a city below to view local soil profiles and foundation risks.
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
                
                {/* STICKY SIDEBAR INDEX */}
                <aside className="w-full md:w-64 flex-shrink-0 sticky top-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                            <h3 className="font-semibold text-slate-800 tracking-wide uppercase text-sm">Jump to State</h3>
                        </div>
                        <nav className="p-3 flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {sortedStates.map(state => (
                                <a 
                                    key={`link-${state}`} 
                                    href={`#state-${state}`}
                                    className="flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <span className="font-medium">{STATE_NAMES[state] || state}</span>
                                    <span className="bg-slate-100 text-slate-500 text-xs py-0.5 px-2 rounded-full">
                                        {clusters[state].length}
                                    </span>
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 w-full space-y-16 pb-32">
                    {sortedStates.map(state => {
                        const cities = clusters[state];
                        const fullStateName = STATE_NAMES[state] || state;
                        
                        return (
                            <section key={state} id={`state-${state}`} className="scroll-mt-12">
                                <div className="mb-6 pb-4 border-b-2 border-slate-200 flex items-end justify-between">
                                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                        {fullStateName}
                                    </h2>
                                    <span className="text-slate-500 font-medium">
                                        {cities.length} Service Areas
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {cities.map(loc => (
                                        <Link
                                            key={loc.slug}
                                            href={`/services/foundation-repair/${loc.slug}`}
                                            className="group flex items-center justify-between bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 p-4 rounded-xl transition-all duration-200 hover:shadow-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                    <MapPin className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                                                </div>
                                                <span className="font-semibold text-slate-700 group-hover:text-blue-800">
                                                    {loc.city}
                                                </span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )
                    })}
                </div>
            </main>
        </div>
    );
}

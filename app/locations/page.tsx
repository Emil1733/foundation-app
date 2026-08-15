import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { MapPin, ShieldAlert, ChevronRight } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const metadata = {
    title: "National Foundation Repair Service Areas | Foundation Risk Registry",
    description: "Explore our forensic engineering service areas across the United States. We provide permanent foundation repair solutions in high-risk soil zones nationwide.",
    alternates: {
        canonical: 'https://foundationrisk.org/locations',
    },
};

export const revalidate = 604800; // ISR: Cache for 1 week to protect Vercel compute and Supabase DB

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
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-200 text-sm font-semibold mb-6 backdrop-blur-sm">
                        <ShieldAlert className="w-4 h-4 text-blue-400" />
                        <span>National Geological Authority</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">National Service Directory</h1>
                    <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                        We provide forensic evaluation and permanent structural stabilization across the most high-risk geological zones in the United States. 
                        Select your state below.
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto py-16 px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedStates.map(state => {
                        const cities = clusters[state];
                        const fullStateName = STATE_NAMES[state] || state;
                        
                        return (
                            <Link
                                key={state}
                                href={`/locations/${fullStateName.toLowerCase().replace(/\s+/g, '-')}`}
                                className="group flex flex-col items-center text-center bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 p-10 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className="bg-slate-100 p-4 rounded-full group-hover:bg-blue-100 transition-colors mb-4">
                                    <MapPin className="w-8 h-8 text-slate-500 group-hover:text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-800 mb-2">
                                    {fullStateName}
                                </h2>
                                <span className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full text-sm">
                                    {cities.length} Service Areas
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </main>
        </div>
    );
}

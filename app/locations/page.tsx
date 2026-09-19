import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { MapPin, ShieldAlert } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const metadata = {
    title: "Foundation Repair Service Areas | Foundation Risk Registry",
    description: "Find foundation repair help in your area. Review warning signs, local soil context, evaluation options, and the next steps for your property.",
    alternates: {
        canonical: 'https://foundationrisk.org/locations',
    },
    openGraph: {
        url: 'https://foundationrisk.org/locations',
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
            
            <header className="relative isolate overflow-hidden bg-slate-950 px-6 py-16 text-white md:py-20">
                <div aria-hidden="true" className="absolute inset-0 -z-30 bg-cover bg-[position:center_48%]" style={{ backgroundImage: "url('/foundation-hero-generated.webp')" }} />
                <div aria-hidden="true" className="absolute inset-0 -z-20 bg-slate-950/60" />
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.70)_50%,rgba(2,6,23,0.48)_100%)]" />
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-200 text-sm font-semibold mb-6 backdrop-blur-sm">
                        <ShieldAlert className="w-4 h-4 text-blue-400" />
                        <span>Foundation Repair Help Near You</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Foundation Repair Service Areas</h1>
                    <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                        Find foundation repair guidance and request help for cracks, uneven floors, sticking doors, and other signs of foundation movement. Select your state to get started.
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-16 px-4 sm:px-6">
                <div className="mb-10 max-w-2xl">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Choose your area</p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Find local foundation repair guidance</h2>
                    <p className="mt-3 text-slate-600">Select a state, then choose your city to review warning signs, local soil context, repair considerations, and evaluation options.</p>
                </div>
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

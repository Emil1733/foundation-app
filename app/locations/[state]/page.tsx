import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { MapPin, ShieldAlert, ChevronRight, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 604800; // ISR: Cache for 1 week to protect Vercel compute and Supabase DB

const STATE_NAMES: Record<string, string> = {
    "texas": "TX", "florida": "FL", "georgia": "GA", "colorado": "CO", 
    "tennessee": "TN", "north-carolina": "NC", "arizona": "AZ", "kansas": "KS", 
    "oklahoma": "OK", "mississippi": "MS", "louisiana": "LA", "missouri": "MO",
    "south-carolina": "SC", "virginia": "VA", "nevada": "NV", "utah": "UT"
};

const INVERSE_STATE_NAMES: Record<string, string> = {
    "TX": "Texas", "FL": "Florida", "GA": "Georgia", "CO": "Colorado", 
    "TN": "Tennessee", "NC": "North Carolina", "AZ": "Arizona", "KS": "Kansas", 
    "OK": "Oklahoma", "MS": "Mississippi", "LA": "Louisiana", "MO": "Missouri",
    "SC": "South Carolina", "VA": "Virginia", "NV": "Nevada", "UT": "Utah"
};

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
    const { state } = await params;
    const stateAbbr = STATE_NAMES[state.toLowerCase()];
    if (!stateAbbr) return { title: "Not Found" };

    const fullStateName = INVERSE_STATE_NAMES[stateAbbr];

    return {
        title: `${fullStateName} Foundation Repair Service Areas | Foundation Risk Registry`,
        description: `Explore all our forensic foundation repair service areas in ${fullStateName}. We diagnose and permanently repair settlement issues caused by active soil zones.`,
        alternates: {
            canonical: `https://foundationrisk.org/locations/${state.toLowerCase()}`,
        },
    };
}

export default async function StateHubPage({ params }: { params: Promise<{ state: string }> }) {
    const { state } = await params;
    const stateAbbr = STATE_NAMES[state.toLowerCase()];

    if (!stateAbbr) return notFound();

    const fullStateName = INVERSE_STATE_NAMES[stateAbbr];

    const { data: locations } = await supabase
        .from('target_locations')
        .select('city, slug')
        .eq('state', stateAbbr)
        .order('city');

    if (!locations || locations.length === 0) return notFound();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://foundationrisk.org" },
            { "@type": "ListItem", "position": 2, "name": "Service Areas", "item": "https://foundationrisk.org/locations" },
            { "@type": "ListItem", "position": 3, "name": fullStateName, "item": `https://foundationrisk.org/locations/${state.toLowerCase()}` }
        ]
    };

    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            
            <header className="bg-slate-900 text-white py-16 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 -z-10" />
                <div className="max-w-7xl mx-auto">
                    <Link href="/locations" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to National Directory
                    </Link>
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-200 text-sm font-semibold mb-6 backdrop-blur-sm">
                        <ShieldAlert className="w-4 h-4 text-blue-400" />
                        <span>{fullStateName} Geological Authority</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        {fullStateName} Service Areas
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl">
                        We provide forensic evaluation and permanent structural stabilization in <strong>{locations.length} high-risk geological zones</strong> across {fullStateName}. Select your city below to view local soil profiles.
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {locations.map(loc => (
                        <Link
                            key={loc.slug}
                            href={`/services/foundation-repair/${loc.slug}`}
                            className="group flex items-center justify-between bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 p-5 rounded-xl transition-all duration-200 hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-100 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <MapPin className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-800 group-hover:text-blue-800 text-lg">
                                        {loc.city}
                                    </span>
                                    <span className="block text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
                                        Foundation Repair
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}

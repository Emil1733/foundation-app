import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { BookOpen, MapPin, ArrowRight, FileText } from 'lucide-react';

export const revalidate = 3600;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const metadata = {
    title: "Foundation Repair Education Hub | Soil & Structural Analysis",
    description: "Deep dive forensic engineering articles on specific soil types, structural failure modes, and foundation repair protocols across the US.",
};

export default async function LearnPage() {
    // Fetch all cities with their soil data
    const { data: locations } = await supabase
        .from('target_locations')
        .select(`
            city, 
            state, 
            slug,
            soil_cache (
                map_unit_name,
                risk_level,
                plasticity_index
            )
        `)
        .order('city');

    if (!locations) return <div>Loading...</div>;

    // Sort by Risk Level for "Featured" section
    // Sort by Risk Level for "Featured" section
    // Check if soil_cache is an array (sometimes supabase returns arrays for joins) or object
    const getRisk = (l: any) => {
        const soil = Array.isArray(l.soil_cache) ? l.soil_cache[0] : l.soil_cache;
        return soil?.risk_level;
    };

    const criticalCities = locations.filter(l => {
        const risk = getRisk(l);
        return risk === 'Severe' || risk === 'High';
    });

    const otherCities = locations.filter(l => {
        const risk = getRisk(l);
        return risk !== 'Severe' && risk !== 'High';
    });

    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            {/* HEADER */}
            <header className="bg-white border-b border-slate-200 py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                        <BookOpen className="w-4 h-4" /> Engineering Library
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                        Forensic Soil Analysis & <br />Repair Protocols
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Don't rely on general advice. Read the specific engineering breakdown for your city's geological profile.
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-12 px-6">

                {/* FEATURED: HIGH RISK ZONES */}
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-red-500 rounded-full"></span>
                    Critical Risk Zones (Action Required)
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    {criticalCities.map((loc) => (
                        <Link
                            key={loc.slug}
                            href={`/learn/${loc.slug}-soil-analysis`}
                            className="group block bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500 group-hover:bg-red-600 transition"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">
                                        Why Foundations Fail in {loc.city}, {loc.state}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                                        <MapPin className="w-4 h-4" />
                                        <span>Primary Soil: <strong>
                                            {(() => {
                                                const soil = Array.isArray(loc.soil_cache) ? loc.soil_cache[0] : loc.soil_cache;
                                                return soil?.map_unit_name || 'Expansive Clay';
                                            })()}
                                        </strong></span>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition" />
                            </div>
                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                {(() => {
                                    const soil = Array.isArray(loc.soil_cache) ? loc.soil_cache[0] : loc.soil_cache;
                                    const pi = soil?.plasticity_index;
                                    return `In-depth analysis of the ${pi ? `PI ${Number(pi).toFixed(1)}` : 'High'} soil active zone in ${loc.city} and why standard pressed pilings often fail here.`;
                                })()}
                            </p>
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wide flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Read Engineering Report
                            </span>
                        </Link>
                    ))}
                </div>

                {/* STANDARD ZONES */}
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                    Regional Soil Profiles
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {otherCities.map((loc) => (
                        <Link
                            key={loc.slug}
                            href={`/learn/${loc.slug}-soil-analysis`}
                            className="block bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition"
                        >
                            <h3 className="font-bold text-slate-900 mb-1">{loc.city} Soil Guide</h3>
                            <p className="text-xs text-slate-500 mb-3">
                                {(() => {
                                    const soil = Array.isArray(loc.soil_cache) ? loc.soil_cache[0] : loc.soil_cache;
                                    return soil?.map_unit_name || 'Local Geological Data';
                                })()}
                            </p>
                            <span className="text-blue-600 text-sm font-medium hover:underline">Read Analysis &rarr;</span>
                        </Link>
                    ))}
                </div>

            </main>
        </div>
    );
}

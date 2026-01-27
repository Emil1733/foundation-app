import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 3600; // ISR every hour

export default async function LocationsMap() {
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
            <header className="bg-slate-900 text-white py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-4">Service Area Directory</h1>
                    <p className="text-slate-400">Complete index of all foundation repair zones monitored by our forensic analysis network.</p>
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

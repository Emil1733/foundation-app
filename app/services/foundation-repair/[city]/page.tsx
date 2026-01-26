import SoilRiskWidget from "@/components/SoilRiskWidget";
import { MoveRight, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";

type Props = {
    params: { city: string };
};

export default function CityPage({ params }: Props) {
    // Decode city from slug (e.g. "kansas-city" -> "Kansas City")
    const cityName = decodeURIComponent(params.city).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
            {/* Hero Section */}
            <header className="bg-slate-900 text-white py-20 px-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-blue-900/50 border border-blue-700 px-3 py-1 rounded-full text-blue-200 text-sm font-medium mb-6">
                            <ShieldCheck className="w-4 h-4" />
                            Verified Foundation Repair in {cityName}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Foundation Settlement in <span className="text-blue-400">{cityName}</span>?
                        </h1>
                        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                            Don't guess. Most foundation issues in {cityName} are caused by expansive clay soils.
                            Get a forensic engineering analysis before you pierce your slab.
                        </p>
                        <div className="flex gap-4">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Talk to an Engineer
                            </button>
                            <Link href="/" className="px-6 py-3 rounded-lg font-medium text-slate-300 hover:text-white transition">
                                Check Soil Risk
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <SoilRiskWidget />
                    </div>
                </div>
            </header>

            {/* Content Body */}
            <main className="max-w-4xl mx-auto py-16 px-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Why Foundations Fail in {cityName}</h2>
                <div className="prose prose-slate max-w-none text-slate-600">
                    <p className="mb-4">
                        Homeowners in <strong>{cityName}</strong> frequently experience foundation settlement due to
                        fluctuating moisture levels in the soil. When clay soil dries out (during {cityName}'s hot summers),
                        it shrinks and pulls away from the foundation. When it rains, it swells and pushes up (heave).
                    </p>
                    <p className="mb-4">
                        Signs you might have a problem in {cityName}:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-8">
                        <li>Stair-step cracks in exterior brick</li>
                        <li>Doors that stick or won't latch</li>
                        <li>Gaps above kitchen cabinets</li>
                        <li>Cracks in drywall above windows</li>
                    </ul>

                    <h3 className="text-xl font-bold text-slate-900 mb-4">The Solution: Deep Soil Stabilization</h3>
                    <p>
                        Standard "concrete pressing" often fails because it doesn't address the active zone of the soil.
                        For {cityName} homes, we recommend deep steel piers that bypass the active clay layers
                        to reach stable bedrock or load-bearing strata.
                    </p>
                </div>

                <div className="mt-12 p-8 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Need a Professional Opinion?</h4>
                        <p className="text-slate-600">Get a free preliminary soil assessment for your property.</p>
                    </div>
                    <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap">
                        Schedule Assessment <MoveRight className="w-4 h-4" />
                    </button>
                </div>
            </main>
        </div>
    );
}

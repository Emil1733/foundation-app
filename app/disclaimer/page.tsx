import { ArrowLeft, AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Data Disclaimer | Foundation Risk Registry",
    description: "Important disclaimers regarding USDA soil data, plasticity indices, and engineering oversight.",
};

export default function DisclaimerPage() {
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
                "name": "Data Disclaimer",
                "item": "https://foundationrisk.org/disclaimer"
            }
        ]
    };

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <header className="bg-slate-50 border-b border-slate-200 py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-8 transition gap-2 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Registry
                    </Link>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Legal Disclaimer</h1>
                    <p className="text-slate-600">Strict Data Usage Limitations</p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-12 px-6 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-12">
                <div className="prose prose-slate">
                    <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl not-prose mb-10 flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                        <div>
                            <h3 className="font-bold text-slate-900 mb-1">Informational Purpose Only</h3>
                            <p className="text-sm text-slate-700">Data provided by this registry is for visualization and research. It is not an engineering certification.</p>
                        </div>
                    </div>

                    <h2>Geological Data Source</h2>
                    <p>
                        All soil taxonomy and plasticity data displayed via the Foundation Risk Registry is derived from the **USDA SSURGO** (Soil Survey Geographic Database). This data is typically mapped at a scale of 1:12,000 to 1:63,360 and may not accurately reflect sub-surface conditions at a precise residential address level.
                    </p>

                    <h2>Plasticity Index interpretation</h2>
                    <p>
                        The "Liquid Limit" and "Plasticity Index" (PI) values shown are based on USDA historical records. Actual site conditions may have been altered by grading, backfilling, or local landscape changes not reflected in the national dataset.
                    </p>

                    <h2>Licensed Professional Engineers (P.E.)</h2>
                    <p>
                        Any reference to "Forensic Analysis" or "Engineering Oversight" refers to the human-led verification process available as a premium service. The automated map interface does not constitute an engagement with a Licensed Professional Engineer.
                    </p>

                    <h2>Assumption of Risk</h2>
                    <p>
                        The property owner or user assumes all risk for any diagnostic conclusions drawn from this Service. We strongly recommend a physical soil soil boring and a manual structural inspection for any property exhibiting signs of foundation distress.
                    </p>
                </div>

                <aside className="space-y-6">
                    <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
                        <div className="bg-blue-600/20 p-3 rounded-full w-fit mb-4">
                            <ShieldAlert className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Engineering Oversight</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Geotechnical data integrity is maintained by licensed Texas Professional Engineers.
                        </p>
                        <div className="border-t border-slate-800 pt-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lead Engineer</p>
                            <p className="font-bold">Elias Thorne, P.E.</p>
                            <p className="text-slate-400 text-xs">TX License: #88XXXX</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h4 className="font-bold text-slate-900 text-sm mb-2 uppercase tracking-tight">Verified Database</h4>
                        <p className="text-slate-600 text-xs leading-relaxed">
                            This registry cross-references USDA SSURGO data with municipal foundation repair permit histories to establish localized risk profiles.
                        </p>
                    </div>
                </aside>
            </main>
        </div>
    );
}

import { Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Contact the Registry | Foundation Risk Support",
    description: "Contact the Foundation Risk Registry for soil-data corrections, report questions, support, or help requesting a property-specific foundation evaluation.",
    alternates: { canonical: "https://foundationrisk.org/contact" },
    openGraph: { url: "https://foundationrisk.org/contact" },
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            <header className="bg-white border-b border-slate-200 py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Foundation Risk Support</h1>
                    <p className="text-lg text-slate-600">
                        Ask about mapped soil data, report a correction, or request help finding the right next step for a property.
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-16 px-6">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">How We Can Help</h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                Contact us for soil-record questions, data corrections, access issues, or help requesting a property-specific foundation evaluation. Service availability and the professionals involved can vary by location.
                            </p>
                            <p className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">For urgent safety concerns, visible wall bowing, sudden displacement, or rapidly changing cracks, contact an appropriately qualified local professional rather than relying on an online soil report.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Communication Channels</h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                Choose the closest subject and include the city, state, and page URL when reporting a data issue. For a property review, describe the symptoms you have observed and whether they are changing.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                    <span className="text-slate-600 text-sm">registry-ops@foundationrisk.org</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Choose the Right Contact Path</h2>
                        <p className="text-sm leading-relaxed text-slate-600 mb-6">Property symptoms and repair questions are handled through the evaluation request so the address, soil context, and preferred contact details stay together.</p>
                        <div className="space-y-4">
                            <Link href="/book-analysis" className="block w-full rounded-xl bg-blue-600 px-6 py-3 text-center font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
                                Request a Foundation Evaluation
                            </Link>
                            <a href="mailto:registry-ops@foundationrisk.org?subject=Foundation%20Risk%20Support" className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-center font-bold text-slate-800 transition hover:border-blue-300 hover:text-blue-700">
                                <Mail className="h-4 w-4" /> Email Data &amp; Support
                            </a>
                        </div>
                        <p className="mt-5 text-xs leading-relaxed text-slate-500">For a correction, include the affected page URL, city and state, and the source you believe should be reviewed.</p>
                    </div>
                </div>

                <div className="mt-20 p-8 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-6">
                    <ShieldCheck className="w-12 h-12 text-blue-600 shrink-0" />
                    <div>
                        <h3 className="font-bold text-blue-900 mb-2">What to Expect From an Evaluation Request</h3>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            The registry provides screening context and helps organize the next step. A local evaluator or repair provider should identify their own qualifications, scope, pricing, warranty terms, and responsibility for any professional opinion or construction work.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

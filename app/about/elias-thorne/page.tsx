import { ShieldCheck, Award, BookOpen, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Elias Thorne, P.E. | Senior Geotechnical Lead",
    description: "Licensed Professional Engineer specializing in expansive clay forensic analysis and foundation stabilization strategies for the North Texas region.",
};

export default function EliasThorne() {
    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">

            {/* SCHEMA: PERSON */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Person",
                    "name": "Elias Thorne, P.E.",
                    "jobTitle": "Senior Geotechnical Lead",
                    "url": "https://foundation-app-self.vercel.app/about/elias-thorne",
                    "alumniOf": "Texas A&M University",
                    "knowsAbout": ["Geotechnical Engineering", "Expansive Clay Soils", "Foundation Underpinning", "Forensic Structural Analysis"],
                    "worksFor": {
                        "@type": "Organization",
                        "name": "The Foundation Risk Registry"
                    }
                })
            }} />

            <div className="max-w-3xl mx-auto py-12 px-6">
                <Link href="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-8 transition gap-2 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Registry
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* HEADER */}
                    <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
                            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-3xl border-2 border-slate-700 shadow-xl">
                                👷‍♂️
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-bold mb-2">Elias Thorne, P.E.</h1>
                                <p className="text-blue-200 font-medium mb-4">Senior Geotechnical Lead</p>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <span className="bg-slate-800 px-3 py-1 rounded-full text-xs border border-slate-700 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-green-400" /> Licensed P.E.
                                    </span>
                                    <span className="bg-slate-800 px-3 py-1 rounded-full text-xs border border-slate-700 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-blue-400" /> Texas / Oklahoma
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-8 prose prose-slate max-w-none">
                        <section className="mb-8">
                            <h2 className="flex items-center gap-2 text-slate-900 font-bold text-xl">
                                <BookOpen className="w-5 h-5 text-blue-600" /> Forensic Philosophy
                            </h2>
                            <p>
                                In 15 years of structural analysis, I have learned one truth: <strong>You cannot fix a house if you ignore the geology beneath it.</strong>
                            </p>
                            <p>
                                My approach diverges from the "sales-first" foundation repair industry. I believe every homeowner deserves a forensic-grade understanding of their specific soil risk (Plasticity Index) before spending a dime on concrete or steel.
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 not-prose">
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-orange-500" /> Credentials
                                </h3>
                                <ul className="text-sm text-slate-600 space-y-2">
                                    <li>• B.S. Civil Engineering, Texas A&M</li>
                                    <li>• Licensed Professional Engineer (TX)</li>
                                    <li>• Specialized in Expansive Clay Stabilization</li>
                                    <li>• Member, National Society of Professional Engineers</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-blue-500" /> Core Focus
                                </h3>
                                <ul className="text-sm text-slate-600 space-y-2">
                                    <li>• Residential Slab-on-Grade Failure</li>
                                    <li>• Steel Pier Underpinning Design</li>
                                    <li>• Soil Moisture Active Zone Analysis</li>
                                    <li>• Pre-Purchase Structural Audits</li>
                                </ul>
                            </div>
                        </div>

                        <section>
                            <h2 className="text-slate-900 font-bold text-xl">Transparency Statement</h2>
                            <p>
                                While I oversee the data modeling for The Foundation Risk Registry, strict ethical guidelines prevent me from directly quoting repair work to users of this free tool to avoid conflicts of interest.
                            </p>
                            <p>
                                Our goal here is purely diagnostic: to arm you with the same geological intelligence that engineers use, so you can make informed decisions.
                            </p>
                        </section>
                    </div>

                    {/* FOOTER */}
                    <div className="bg-slate-50 p-6 border-t border-slate-200 text-center">
                        <p className="text-xs text-slate-400">
                            License Verification: Texas Board of Professional Engineers (TBPE).<br />
                            For formal inquiries: <a href="mailto:elias.thorne@example.com" className="text-blue-600 hover:underline">elias.thorne@example.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

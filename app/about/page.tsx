import { ShieldCheck, Info, Award, Landmark } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "About the Foundation Risk Registry | Better Repair Decisions",
    description: "Learn how the Foundation Risk Registry explains public soil data and helps homeowners prepare for foundation evaluations and repair decisions.",
    alternates: { canonical: "https://foundationrisk.org/about" },
    openGraph: { url: "https://foundationrisk.org/about" },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
            <header className="bg-slate-900 text-white py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Clearer Foundation Decisions</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        The Foundation Risk Registry explains mapped soil conditions, helps homeowners recognize meaningful warning signs, and provides a clearer path to property-specific evaluation and repair options.
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-20 px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission: Evidence Before a Repair Plan</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            Foundation symptoms are easy to misread. A crack may be cosmetic, historic, drainage-related, or part of a broader movement pattern. Homeowners deserve enough context to ask better questions before approving structural work.
                        </p>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            We translate USDA/NRCS soil survey records into plain-language foundation context and pair that information with practical guidance on documenting symptoms, reviewing drainage, and comparing evaluation findings.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Map data cannot diagnose an individual property. Its value is helping you understand possible moisture sensitivity and decide when measurements, an on-site evaluation, or additional professional expertise may be warranted.
                        </p>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-blue-600 p-3 rounded-lg text-white">
                                <Award className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-xl text-slate-900">How We Review Information</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">We distinguish mapped conditions from property observations. Reports identify the source, explain limitations, and avoid choosing a repair system from a soil map alone.</p>
                        <p className="text-sm text-slate-600 leading-relaxed">When a homeowner requests an evaluation, the goal is to compare symptoms and measurements with local context so repair proposals can be judged on evidence.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-20 pb-20 border-b border-slate-100">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">The Active Zone Philosophy</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            The &ldquo;active zone&rdquo; is the depth where seasonal moisture variation can affect soil volume. Its depth and behavior vary by site and cannot be established from a regional map alone. We explain the concept so homeowners can ask how a proposed repair accounts for actual subsurface conditions.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Transparency in Data</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            We organize public soil data and local foundation-risk information to support better conversations with evaluators and repair providers. The registry can also help homeowners request a property review when symptoms are changing or a repair proposal needs clarification.
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-20">
                    <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">The Standards We Follow</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <Landmark className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                            <h3 className="font-bold mb-2">Named Public Sources</h3>
                            <p className="text-sm text-slate-500">Mapped soil context identifies its USDA/NRCS survey source and limitations.</p>
                        </div>
                        <div className="text-center">
                            <ShieldCheck className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                            <h3 className="font-bold mb-2">Property Evidence</h3>
                            <p className="text-sm text-slate-500">Symptoms, drainage, history, and measurements come before a repair recommendation.</p>
                        </div>
                        <div className="text-center">
                            <Info className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                            <h3 className="font-bold mb-2">Clear Boundaries</h3>
                            <p className="text-sm text-slate-500">Screening information is clearly separated from an on-site professional opinion.</p>
                        </div>
                    </div>
                </div>
            </main>

            <section className="bg-slate-50 py-20 px-6 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready for a Property-Specific Next Step?</h2>
                <p className="text-slate-500 mb-8 max-w-xl mx-auto">
                    Start with mapped soil context, then request an evaluation if your symptoms are changing or you need to compare repair options.
                </p>
                <Link href="/book-analysis" className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition">
                    Request a Foundation Evaluation &rarr;
                </Link>
            </section>
        </div>
    );
}

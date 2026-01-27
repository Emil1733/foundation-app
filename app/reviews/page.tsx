import { Star, CheckCircle, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: "Client Case Studies & Forensic Reviews | Foundation Risk Registry",
    description: "Read engineering case studies of foundation stabilization in North Texas. Real forensic analysis of PI > 35 soil failures and steel pier corrections.",
};

export default function ReviewsPage() {
    const reviews = [
        {
            title: "Project Alpha: The 'Heaving' Living Room",
            location: "Plano, TX (75024)",
            soil: "Houston Black Clay (PI: 42)",
            problem: "Differential settlement of 2.1 inches. Sheetrock cracks reopening 3 months after cosmetic repair.",
            solution: "Installation of 14 double-walled steel piers to 18ft depth (bypassing active zone).",
            result: "Zero movement detected in 12-month follow-up audit.",
            author: "Verified Homeowner"
        },
        {
            title: "Project Bravo: Creek Bed Instability",
            location: "Lake Highlands, Dallas",
            soil: "Alluvial/Clay Mix",
            problem: "Corner subsidence of 1.5 inches. Door frames binding seasonally.",
            solution: "Hybrid approach: 8 exterior piers + root barrier installation to control moisture fluctuation.",
            result: "Stabilized within 0.1-inch tolerance.",
            author: "Local Realtor Partnership"
        },
        {
            title: "Project Charlie: Pre-Purchase Audit",
            location: "Frisco, TX",
            soil: "Moderate Clay (PI: 28)",
            problem: "Buyer concern over hairline slab cracks.",
            solution: "Forensic report proved cracks were non-structural shrinkage. Saved buyer $12,000 in unneeded repairs.",
            result: "Sale closed successfully.",
            author: "Structural Assessment Client"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            <header className="bg-slate-900 text-white py-16 px-6 text-center">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm transition">
                        <ArrowLeft className="w-4 h-4" /> Back to Registry
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">Forensic Case Studies</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        We don't collect "5-star reviews" for doing our job. We document engineering victories against expansive soil.
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-12 px-6">
                <div className="grid gap-8">
                    {reviews.map((r, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{r.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                        <span className="font-semibold text-blue-600">{r.location}</span>
                                        <span>•</span>
                                        <span>{r.soil}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100 mb-6">
                                <div>
                                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest">The Problem</span>
                                    <p className="text-slate-700 text-sm mt-2">{r.problem}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-green-600 uppercase tracking-widest">The Engineering Fix</span>
                                    <p className="text-slate-700 text-sm mt-2">{r.solution}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-500 italic">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Verified Result: {r.result}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition">
                        <FileText className="w-5 h-5" /> Get Your Forensic Report
                    </Link>
                </div>
            </main>
        </div>
    );
}

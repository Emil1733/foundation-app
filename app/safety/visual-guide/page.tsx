import VisualProofGallery from "@/components/VisualProofGallery";
import { ArrowLeft, ZoomIn } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Visual Foundation Failure Guide | Identify Your Cracks",
    description: "Forensic engineering library of foundation failure signs. Match your cracks (Diagonal, Stair-step, Horizontal) to soil plasticity risks.",
};

export default function VisualGuidePage() {
    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            {/* HEADER */}
            <header className="bg-white border-b border-slate-200 py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-8 transition gap-2 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Registry
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <ZoomIn className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Forensic Library</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Identify Your Structural Symptoms</h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        Not all cracks are equal. Use this visual guide to distinguish between harmless settling and active structural failure.
                    </p>
                </div>
            </header>

            {/* GALLERY */}
            <main className="max-w-4xl mx-auto py-12 px-6">
                <VisualProofGallery />

                <div className="mt-12 bg-blue-900 rounded-2xl p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">Still Unsure?</h3>
                    <p className="text-blue-200 mb-6">Take our 60-second diagnostic quiz to get a calculated risk score.</p>
                    <Link href="/quiz" className="inline-block bg-white text-blue-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition">
                        Start Diagnostic Quiz &rarr;
                    </Link>
                </div>
            </main>
        </div>
    );
}

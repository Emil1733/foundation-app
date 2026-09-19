import VisualProofGallery from "@/components/VisualProofGallery";
import { ArrowLeft, ZoomIn } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Foundation Warning Signs Visual Guide | Foundation Risk Registry",
    description: "Visual guide to common foundation warning signs including diagonal, stair-step, horizontal, and hairline cracks. Use examples for documentation, not diagnosis.",
};

export default function VisualGuidePage() {
    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            {/* HEADER */}
            <header className="bg-slate-950 border-b border-white/10 py-14 px-6 text-white">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-8 transition gap-2 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to FoundationRisk
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <ZoomIn className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Foundation Signs Guide</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-4">Document Foundation Warning Signs</h1>
                    <p className="text-lg text-slate-300 max-w-2xl">
                        Crack patterns and other symptoms can provide useful context, but a photo alone cannot determine whether a foundation is actively moving. Use this guide to document what you see and decide what to discuss during an evaluation.
                    </p>
                </div>
            </header>

            {/* GALLERY */}
            <main className="max-w-4xl mx-auto py-12 px-6">
                <VisualProofGallery />

                <div className="mt-12 bg-blue-900 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-2">Still Unsure?</h2>
                    <p className="text-blue-200 mb-6">Use the short warning-sign check to organize what you have observed before requesting an evaluation.</p>
                    <Link href="/quiz" className="inline-block bg-white text-blue-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition">
                        Check My Warning Signs &rarr;
                    </Link>
                </div>
            </main>
        </div>
    );
}

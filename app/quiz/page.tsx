import FoundationQuiz from "@/components/FoundationQuiz";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Foundation Risk Assessment Quiz | FRR",
    description: "Diagnose foundation cracks in 60 seconds with our forensic engineering quiz.",
    alternates: {
        canonical: '/quiz',
    },
};

export default function QuizPage() {
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
                "name": "Diagnostic Quiz",
                "item": "https://foundationrisk.org/quiz"
            }
        ]
    };

    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
                <Link href="/" className="inline-flex items-center text-slate-400 hover:text-slate-600 mb-6 transition gap-2 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Registry
                </Link>
                <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900">
                    Do I Need Piers?
                </h1>
                <p className="mt-2 text-sm text-slate-700">
                    Answer 3 forensic questions to determine your Risk Level.
                </p>
            </div>

            <FoundationQuiz />

            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                    This tool provides a preliminary assessment only.<br />It does not replace a physical inspection by a Licensed P.E.
                </p>
            </div>
        </div>
    );
}

import FoundationQuiz from "@/components/FoundationQuiz";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Foundation Warning Signs Check | Foundation Risk Registry",
    description: "A short screening tool to organize visible foundation warning signs and decide whether a property-specific evaluation may be useful.",
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
                "name": "Foundation Signs Check",
                "item": "https://foundationrisk.org/quiz"
            }
        ]
    };

    return (
        <div className="min-h-screen bg-slate-950 font-[family-name:var(--font-geist-sans)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
                <Link href="/" className="inline-flex items-center text-slate-400 hover:text-slate-600 mb-6 transition gap-2 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to FoundationRisk
                </Link>
                <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-extrabold text-white">
                    Foundation Warning Signs Check
                </h1>
                <p className="mt-2 text-sm text-slate-300">
                    Answer three quick questions to organize the signs you have noticed. The result is screening guidance, not a diagnosis.
                </p>
            </div>

            <FoundationQuiz />

            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                    This tool organizes reported warning signs only. It does not diagnose foundation movement or replace an appropriate on-site evaluation.
                </p>
            </div>
        </div>
    );
}

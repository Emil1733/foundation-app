import { ArrowLeft, Scale } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Terms of Service | Foundation Risk Registry",
    description: "Terms and conditions for using the Foundation Risk Registry and accessing geological data.",
};

export default function TermsPage() {
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
                "name": "Terms of Service",
                "item": "https://foundationrisk.org/terms"
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
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
                    <p className="text-slate-600">Effective Date: February 2026</p>
                </div>
            </header>

            <main className="max-w-3xl mx-auto py-12 px-6 prose prose-slate">
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl not-prose mb-10 flex items-start gap-4">
                    <Scale className="w-6 h-6 text-blue-600 shrink-0" />
                    <div>
                        <h3 className="font-bold text-slate-900 mb-1">Agreement to Terms</h3>
                        <p className="text-sm text-slate-700">By accessing the Foundation Risk Registry, you agree to these legal terms regarding data usage, accuracy, and engineering liability.</p>
                    </div>
                </div>

                <h2>1. Service Description</h2>
                <p>
                    The Foundation Risk Registry ("the Service") provides visualization of geological and soil data sourced from the USDA Natural Resources Conservation Service (NRCS) Web Soil Survey (SSURGO). The Service is intended for informational and preliminary assessment purposes only.
                </p>

                <h2>2. No Engineering Advice</h2>
                <p>
                    <strong>The Service is NOT a substitute for a site-specific structural engineering report or a geotechnical investigation.</strong> All soil plasticity indices and risk signals are automated interpretations of public datasets. You should consult with a Licensed Professional Engineer (P.E.) before making property-related financial or construction decisions.
                </p>

                <h2>3. Data Accuracy & Availability</h2>
                <p>
                    While we strive to provide the most current data, we do not guarantee the completeness or accuracy of the mapping. Geological conditions can vary significantly even within a single parcel of land.
                </p>

                <h2>4. Intellectual Property</h2>
                <p>
                    The visualization tools, PDF report layouts, and forensic analysis algorithms are the property of The Foundation Risk Registry. Soil data remains within the public domain as per USDA guidelines.
                </p>

                <h2>5. Limitation of Liability</h2>
                <p>
                    The Foundation Risk Registry and its operators shall not be liable for any damages resulting from property loss, structural failure, or financial decisions made based on the data visualized through this Service.
                </p>

                <h2>6. Changes to Terms</h2>
                <p>
                    We reserve the right to modify these terms at any time. Continued use of the Service constitutes acceptance of the updated Terms.
                </p>
            </main>
        </div>
    );
}

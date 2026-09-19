import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Privacy Policy & Data Usage | Foundation Risk Registry",
    description: "Learn how the Foundation Risk Registry collects, uses, protects, retains, and shares address, contact, and foundation evaluation request information.",
    alternates: { canonical: "https://foundationrisk.org/privacy" },
    openGraph: { url: "https://foundationrisk.org/privacy" },
};

export default function PrivacyPage() {
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
                "name": "Privacy Policy",
                "item": "https://foundationrisk.org/privacy"
            }
        ]
    };

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <header className="bg-slate-950 border-b border-white/10 py-12 px-6 text-white">
                <div className="max-w-3xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-8 transition gap-2 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Registry
                    </Link>
                    <h1 className="text-4xl font-bold text-white mb-4">Privacy & Data Governance</h1>
                    <p className="text-slate-600">Last Updated: September 2026</p>
                </div>
            </header>

            <main className="max-w-3xl mx-auto py-12 px-6 prose prose-slate">

                <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl not-prose mb-10 flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
                    <div>
                        <h3 className="font-bold text-slate-900 mb-1">Our Core Promise</h3>
                        <p className="text-sm text-slate-700">We do not sell your address to unrelated bulk-marketing lists. When you request an evaluation, we use your details to provide soil context and may share the request with participating local foundation evaluation or repair providers.</p>
                    </div>
                </div>

                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                    This Privacy Policy describes how The Foundation Risk Registry (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and shares your information. We are committed to transparency in our data practices, including property details and foundation evaluation requests.
                </p>

                <h2>1. Data Collection & Usage</h2>
                <p>When you use our tools or submit a foundation evaluation request, we may collect and process the following information:</p>
                <ul>
                    <li><strong>Property information:</strong> Street address, ZIP code, and location context used to organize the request and connect it with relevant mapped soil information.</li>
                    <li><strong>Contact information:</strong> Name, email address, and phone number used to respond to your evaluation request and coordinate relevant follow-up.</li>
                    <li><strong>Request information:</strong> Foundation symptoms and optional notes you submit, plus limited technical metadata such as IP address and browser information for request records, security, and abuse prevention.</li>
                </ul>

                <h2>2. USDA Data Integration</h2>
                <p>
                    The soil data displayed on this website is sourced directly from the <strong>USDA Natural Resources Conservation Service (NRCS) Web Soil Survey (SSURGO)</strong> database. This is a public federal dataset.
                </p>
                <p>
                    Mapped soil information is screening context, not a parcel-level diagnosis. Conditions can vary within a mapped area and may differ from conditions at a specific structure.
                </p>

                <h2>3. Security & Third-Party Sharing</h2>
                <p>
                    <strong>Service-request sharing:</strong> When you submit a foundation evaluation request, your contact information, property location, and reported symptoms may be shared with participating local foundation evaluation or repair providers so they can respond. A participating provider should identify its business, qualifications, scope, and terms directly. We do not represent every participating provider as a licensed engineering firm.
                </p>
                <p>
                    Evaluation requests are stored in our application database. We use access controls intended to limit request data to authorized operations and service workflows.
                </p>

                <h2>4. Data Retention & Your Rights</h2>
                <p>
                    We retain request information as reasonably necessary to process the request, maintain operational records, address disputes, and meet applicable legal obligations. You may contact us about access, correction, or deletion requests, subject to applicable law and legitimate retention requirements.
                </p>

                <h2>Privacy Contact</h2>
                <p>
                    For privacy inquiries or requests concerning your information, please contact us at <a href="mailto:privacy@foundationrisk.org">privacy@foundationrisk.org</a>.
                </p>
            </main>
        </div>
    );
}

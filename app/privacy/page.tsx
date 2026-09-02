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
            <header className="bg-slate-50 border-b border-slate-200 py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-8 transition gap-2 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Registry
                    </Link>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy & Data Governance</h1>
                    <p className="text-slate-600">Last Updated: January 2026</p>
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
                    This Privacy Policy describes how The Foundation Risk Registry (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and shares your information. We are committed to transparency in our data practices, especially concerning the sensitive geological mapping of residential properties.
                </p>

                <h2>1. Data Collection & Usage</h2>
                <p>When you enter an address into the Foundation Risk Registry, we collect and process the following data points to provide your forensic report:</p>
                <ul>
                    <li><strong>Geolocation Coordinates:</strong> Used as the primary key to query the USDA Soil Data Access (SDA) system and determine the Plasticity Index (PI) of your specific plot.</li>
                    <li><strong>Email Address:</strong> Required to deliver the generated PDF Forensic Report and providing updates on geological shifts in your monitored zone.</li>
                    <li><strong>Device Metadata:</strong> Basic information (IP address, browser type) to prevent automated scraping of our proprietary risk models.</li>
                </ul>

                <h2>2. USDA Data Integration</h2>
                <p>
                    The soil data displayed on this website is sourced directly from the <strong>USDA Natural Resources Conservation Service (NRCS) Web Soil Survey (SSURGO)</strong> database. This is a public federal dataset.
                </p>
                <p>
                    While we strive for 100% accuracy, The Foundation Risk Registry acts as a forensic visualization interface for this public data. We do not alter the underlying geological classification of your property as defined by federal surveyors. Our value lies in the interpretation of this data against residential structural tolerances.
                </p>

                <h2>3. Security & Third-Party Sharing</h2>
                <p>
                    <strong>Service-request sharing:</strong> When you submit a foundation evaluation request, your contact information, property location, and reported symptoms may be shared with participating local foundation evaluation or repair providers so they can respond. A participating provider should identify its business, qualifications, scope, and terms directly. We do not represent every participating provider as a licensed engineering firm.
                </p>
                <p>
                    Your data is stored using industry-standard AES-256 encryption via Supabase (a secure PostgreSQL infrastructure). We maintain strict access controls to ensure that only authorized forensic leads can access specific property data.
                </p>

                <h2>4. Data Retention & Your Rights</h2>
                <p>
                    Address queries are cached anonymously for 30 days to improve system performance. You have the right to request a full &ldquo;Right to Be Forgotten&rdquo; purge of your property history and email from our registry at any time.
                </p>

                <h2>Contact the Data Protection Officer</h2>
                <p>
                    For privacy inquiries or to exercise your data rights under the CCPA/GDPR (where applicable), please contact our compliance desk at <a href="mailto:privacy@foundationrisk.org">privacy@foundationrisk.org</a>.
                </p>
            </main>
        </div>
    );
}

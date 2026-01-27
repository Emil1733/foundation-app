import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Privacy Policy & Data Usage | Foundation Risk Registry",
    description: "Transparency on how we handle your address data and our integration with the USDA SSURGO database.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
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
                        <p className="text-sm text-slate-700">We do not sell your address data to generic marketing lists. Your location is used solely to query geological databases and connect you with a forensic engineer.</p>
                    </div>
                </div>

                <h2>1. Data Collection & Usage</h2>
                <p>When you enter an address into the Foundation Risk Registry, we collect:</p>
                <ul>
                    <li><strong>Geolocation Coordinates:</strong> Used to query the USDA Soil Data Access (SDA) system.</li>
                    <li><strong>Email Address:</strong> (Optional) Used to deliver the PDF Forensic Report.</li>
                </ul>

                <h2>2. USDA Data Integration</h2>
                <p>
                    The soil data displayed on this website is sourced directly from the <strong>USDA Natural Resources Conservation Service (NRCS) Web Soil Survey (SSURGO)</strong> database.
                </p>
                <p>
                    While we strive for accuracy, The Foundation Risk Registry acts as a visualization interface for this public data. We do not alter the underlying geological classification of your property.
                </p>

                <h2>3. Third-Party Sharing</h2>
                <p>
                    If you request a "P.E. Consultation," your contact information is shared exclusively with our vetted network of Licensed Professional Engineers in your state (e.g., Texas Board of Professional Engineers). We do not share data with unlicensed contractors.
                </p>

                <h2>4. Data Retention</h2>
                <p>
                    Address queries are cached anonymously to improve system performance. Email addresses are stored securely via Supabase Authentication and can be deleted upon request.
                </p>

                <h2>Contact Us</h2>
                <p>
                    For privacy inquiries, please contact our Data Compliance Officer at <a href="mailto:privacy@foundationregistry.com">privacy@foundationregistry.com</a>.
                </p>
            </main>
        </div>
    );
}

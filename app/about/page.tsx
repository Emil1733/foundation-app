import { ShieldCheck, Info, MapPin, Mail, Award, Landmark } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "About the Foundation Risk Registry | Geological Oversight",
    description: "Learn about the mission of the Foundation Risk Registry, our forensic engineering oversight, and how we use USGS/SSURGO data to protect homeowners.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
            <header className="bg-slate-900 text-white py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Objectivity in Civil Engineering</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        The Foundation Risk Registry (FRR) was established in 2024 to provide homeowners with direct access to forensic soil data, bypassing the marketing noise of the repair industry.
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-20 px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission: Accuracy Over Sales</h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            Most foundation repair estimates are provided by commission-based salespeople, not engineers. This creates a fundamental conflict of interest where every crack is interpreted as a "major failure" requiring thousands of dollars in structural piers.
                        </p>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            The Foundation Risk Registry was born from a need for objective, forensic-level data. We believe that homeowners deserve to know the geological reality of their property before they sign a contract. Our system cross-references USDA SSURGO soil datasets with USGS geological surveys to provide a risk profile that is independent of any repair company's agenda.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            We use these scientific surveys to give you the raw facts: Your Plasticity Index, your Soil Series, and the actual risk level of your specific zip code. If the data shows your soil is low-plasticity loam, we'll tell you—even if a salesman told you that you need 20 piers.
                        </p>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-blue-600 p-3 rounded-lg text-white">
                                <Award className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-xl text-slate-900">Engineering Oversight</h3>
                        </div>
                        <p className="text-sm text-slate-600 italic mb-6 leading-relaxed">
                            "Data without interpretation is just noise. In expansive clay regions like the Blackland Prairie, foundation movement is a geological certainty. We provide the forensic context necessary to determine if a house requires structural intervention or simply improved drainage maintenance."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">ET</div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Elias Thorne, P.E.</p>
                                <p className="text-xs text-slate-500 uppercase tracking-tighter">Senior Geotechnical Advisor</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-20 pb-20 border-b border-slate-100">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">The Active Zone Philosophy</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Our analysis focuses on the "Active Zone"—the depth at which seasonal moisture changes cause the soil to expand and contract. By identifying the specific clay minerals in your local soil series, we can predict the maximum potential vertical rise (PVR) of your foundation. This is the same methodology used by civil engineers to design commercial skyscrapers and bridges, now applied to residential protection.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Transparency in Data</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            We curate data from the National Cooperative Soil Survey (NCSS) and maintain an internal database of local failure modes. Our goal is not to fix your foundation, but to give you the leverage of information. When you know your soil's Plasticity Index, you can hold contractors accountable to the ASCE 7-22 deflection limits.
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-20">
                    <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">The Standards We Follow</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <Landmark className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                            <h3 className="font-bold mb-2">USGS Standards</h3>
                            <p className="text-sm text-slate-500">Geological mapping based on official federal soil survey data.</p>
                        </div>
                        <div className="text-center">
                            <ShieldCheck className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                            <h3 className="font-bold mb-2">ASCE/TX Guidelines</h3>
                            <p className="text-sm text-slate-500">Adhering to the Texas Section of the American Society of Civil Engineers.</p>
                        </div>
                        <div className="text-center">
                            <Info className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                            <h3 className="font-bold mb-2">Forensic Methodology</h3>
                            <p className="text-sm text-slate-500">Focusing on root-cause analysis rather than symptom-based repair.</p>
                        </div>
                    </div>
                </div>
            </main>

            <section className="bg-slate-50 py-20 px-6 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready for a Real Analysis?</h2>
                <p className="text-slate-500 mb-8 max-w-xl mx-auto">
                    Stop guessing and start analyzing. Check your property against the latest forensic soil data.
                </p>
                <Link href="/" className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition">
                    Back to Registry &rarr;
                </Link>
            </section>
        </div>
    );
}

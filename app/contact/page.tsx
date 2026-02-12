import { Mail, Phone, MapPin, ShieldCheck, Globe } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Contact the Registry | Foundation Risk Support",
    description: "Contact the Foundation Risk Registry for technical support, data corrections, or forensic engineering inquiries.",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            <header className="bg-white border-b border-slate-200 py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Technical Registry Support</h1>
                    <p className="text-lg text-slate-600">
                        For forensic inquiries, data disputes, or to request documentation from our geotechnical database.
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-16 px-6">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Registry Headquarters</h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                Our central database operations are managed from Austin, Texas, allowing us to maintain close coordination with state geological bureaus and university research departments. We specialize in the high-shrink/swell clay zones of the Blackland Prairie and the Gulf Coast.
                            </p>
                            <div className="flex items-start gap-4">
                                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                                <div className="text-slate-600 text-sm leading-relaxed">
                                    <p className="font-bold">Foundation Risk Registry</p>
                                    <p>823 Congress Ave, Suite 1500</p>
                                    <p>Austin, TX 78701</p>
                                    <p className="text-xs mt-2 text-slate-400">Serving TX, OK, and MO geotechnical zones.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Communication Channels</h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                For faster processing of data requests, please specify your query type using the form provided. Our forensic lead, Elias Thorne, P.E., oversees all technical data integrity and geological mapping updates.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                    <span className="text-slate-600 text-sm">registry-ops@foundationrisk.org</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Phone className="w-5 h-5 text-blue-600" />
                                    <span className="text-slate-600 text-sm">Technical Support: +1 (800) 555-0199</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Send Forensic Data Request</h2>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="inquiry-type" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                                <select id="inquiry-type" name="inquiry-type" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>Soil Data Correction Request</option>
                                    <option>Engineering Credential Verification</option>
                                    <option>New Zip Code Analysis Request</option>
                                    <option>General Support</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                <input id="email" type="email" name="email" placeholder="your@email.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                                <textarea id="message" name="message" rows={4} placeholder="Please provide specific location/geodata references..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                                Send Request
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-20 p-8 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-6">
                    <ShieldCheck className="w-12 h-12 text-blue-600 shrink-0" />
                    <div>
                        <h3 className="font-bold text-blue-900 mb-2">Verified Professional Data Gatekeeping</h3>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            The Foundation Risk Registry is maintained by a network of civil and geotechnical engineers. We do not accept data from repair contractors unless accompanied by a stamped engineering report. If you are a licensed P.E. and would like to submit local soil plasticity data, borehole logs, or foundation failure case studies for peer review, please reach out via our operations email.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

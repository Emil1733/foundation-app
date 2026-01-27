import Link from 'next/link';
import { MapPin, ArrowRight, AlertTriangle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Location Not Monitored
                    </h1>
                    <p className="text-slate-500 mb-8">
                        The coordinates you requested are outside our current forensic jurisdiction. However, we likely have soil data for a nearby neighbor.
                    </p>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-8 text-left">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                            Active Service Zones
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/services/foundation-repair/dallas-tx-75201" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-medium">
                                    <MapPin className="w-4 h-4 text-blue-500" /> Dallas, TX (Metro)
                                </Link>
                            </li>
                            <li>
                                <Link href="/services/foundation-repair/plano-tx-75024" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-medium">
                                    <MapPin className="w-4 h-4 text-blue-500" /> Plano, TX (North)
                                </Link>
                            </li>
                            <li>
                                <Link href="/services/foundation-repair/kansas-city-mo-64130" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-medium">
                                    <MapPin className="w-4 h-4 text-blue-500" /> Kansas City, MO
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <Link
                        href="/locations"
                        className="block w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2"
                    >
                        View Full Service Map <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

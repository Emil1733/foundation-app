'use client';

import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import clsx from 'clsx';

type RiskData = {
    map_unit_name: string;
    shrink_swell: number;
    plasticity_index: number;
    drainage_class?: string;
};

export default function SoilRiskWidget() {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<RiskData | null>(null);

    const checkRisk = async () => {
        if (!address) return;
        setLoading(true);
        setError(null);
        setData(null);

        try {
            // 1. Geocode
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
            const geoData = await geoRes.json();

            if (!geoData || geoData.length === 0) {
                throw new Error('Address not found');
            }

            const { lat, lon } = geoData[0];

            // 2. Fetch Soil Data
            const soilRes = await fetch('/api/soil', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lon })
            });

            if (!soilRes.ok) {
                const errJson = await soilRes.json();
                throw new Error(errJson.error || 'Failed to fetch soil data');
            }

            const soilData = await soilRes.json();
            setData(soilData);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getRiskLevel = (pi: number) => {
        if (pi > 35) return { label: 'SEVERE', color: 'bg-red-600', text: 'text-red-700' };
        if (pi > 25) return { label: 'HIGH', color: 'bg-orange-500', text: 'text-orange-600' };
        if (pi > 15) return { label: 'MODERATE', color: 'bg-yellow-500', text: 'text-yellow-600' };
        return { label: 'LOW', color: 'bg-green-500', text: 'text-green-600' };
    };

    return (
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-6 text-white pb-8">
                <h2 className="text-xl font-bold mb-2">Check Your Foundation Risk</h2>
                <p className="text-slate-400 text-sm">
                    70% of foundation failures are caused by soil. See what's under your home.
                </p>
            </div>

            <div className="p-6 -mt-6 bg-white rounded-t-xl">
                <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Enter your address..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && checkRisk()}
                        />
                    </div>
                    <button
                        onClick={checkRisk}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Scanning...' : <Search className="w-5 h-5" />}
                    </button>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {error}
                    </div>
                )}

                {data && (
                    <div className="animate-in fade-in slide-in-from-bottom duration-500">
                        {(() => {
                            const risk = getRiskLevel(Number(data.plasticity_index));
                            return (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-slate-500 font-medium text-sm">Soil Classification</span>
                                        <span className={clsx("px-3 py-1 rounded-full text-xs font-bold text-white", risk.color)}>
                                            {risk.label} RISK
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{data.map_unit_name}</h3>
                                        <p className="text-sm text-slate-600">
                                            Drainage: {data.drainage_class || 'Unknown'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Plasticity Index</span>
                                            <span className={clsx("text-xl font-mono font-bold", risk.text)}>
                                                {Number(data.plasticity_index).toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Shrink-Swell</span>
                                            <span className="text-xl font-mono font-bold text-slate-800">
                                                {Number(data.shrink_swell).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-xs text-slate-400 border-t pt-3 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        Data sourced from USDA Soil Survey (SSURGO)
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}

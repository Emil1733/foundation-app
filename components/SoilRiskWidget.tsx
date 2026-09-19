'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Download, LoaderCircle, MapPin, Search } from 'lucide-react';
import { classifySoilPlasticityIndex } from '@/lib/soilRisk';

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
  const [generating, setGenerating] = useState(false);

  const checkRisk = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const geoRes = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const geoData = await geoRes.json();
      if (!geoRes.ok) throw new Error(geoData.error || 'Unable to look up that address.');

      const { lat, lon } = geoData;
      const soilRes = await fetch('/api/soil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon }),
      });
      if (!soilRes.ok) {
        const errJson = await soilRes.json();
        throw new Error(errJson.error || 'Unable to retrieve mapped soil data.');
      }
      setData(await soilRes.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to retrieve mapped soil data.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSummary = async () => {
    if (!data) return;
    setGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const risk = classifySoilPlasticityIndex(data.plasticity_index);

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('Foundation Risk Registry', 105, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text('Mapped Soil Context Summary', 105, 25, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text(`Property: ${address}`, 20, 60);
      doc.setFillColor(245, 247, 250);
      doc.rect(20, 70, 170, 62, 'F');
      doc.setFontSize(11);
      doc.text('MAPPED SOIL SCREENING CLASS', 30, 88);
      doc.setFontSize(25);
      doc.text(risk.toUpperCase(), 30, 103);
      doc.setFontSize(11);
      doc.text(`Soil unit: ${data.map_unit_name}`, 30, 116);
      doc.text(`Plasticity Index: ${Number(data.plasticity_index).toFixed(1)}`, 30, 125);
      doc.text(`Shrink-Swell: ${Number(data.shrink_swell).toFixed(1)}%`, 105, 125);

      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text('Mapped soil values are screening context, not a property diagnosis.', 20, 148);
      doc.text('Use property measurements and an on-site evaluation before selecting repairs.', 20, 154);
      doc.setFontSize(8);
      doc.text('Generated from mapped public soil data.', 105, 280, { align: 'center' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 285, { align: 'center' });
      doc.save('FoundationRisk_Mapped_Soil_Summary.pdf');
    } finally {
      setGenerating(false);
    }
  };

  const evaluationHref = `/book-analysis?address=${encodeURIComponent(address)}&source=soil_risk_widget`;

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 text-white shadow-2xl">
      <div className="p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300">Property Soil Check</p>
        <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">Check Your Foundation Risk</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">Enter the property address to see mapped soil context, then use it to ask better questions about foundation movement and repair options.</p>

        <div className="mt-5">
          <label htmlFor="property-address" className="mb-2 block text-xs font-bold text-slate-300">Property address</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="property-address"
                type="text"
                autoComplete="street-address"
                placeholder="123 Main St, Cedar Park, TX"
                className="min-h-12 w-full rounded-xl border border-white/15 bg-white/[0.07] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkRisk()}
              />
            </div>
            <button onClick={checkRisk} disabled={loading || !address.trim()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking</> : <><Search className="h-4 w-4" aria-hidden="true" /> Check soil</>}
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">Mapped soil screening only. This does not diagnose the foundation.</p>
        </div>

        {error && <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100" role="alert">{error}</div>}

        {data && (() => {
          const risk = classifySoilPlasticityIndex(data.plasticity_index);
          return (
            <div className="mt-5 border-t border-white/10 pt-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Mapped screening class</p>
                  <p className="mt-1 text-2xl font-bold">{risk}</p>
                </div>
                <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-200">USDA / NRCS context</span>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-bold text-white">{data.map_unit_name}</p>
                <p className="mt-1 text-xs text-slate-400">Drainage: {data.drainage_class || 'Not reported'}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Plasticity Index</p><p className="mt-1 font-mono text-xl font-bold">{Number(data.plasticity_index).toFixed(1)}</p></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Shrink-Swell</p><p className="mt-1 font-mono text-xl font-bold">{Number(data.shrink_swell).toFixed(1)}%</p></div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-blue-400/20 bg-blue-400/[0.08] p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold">Make this useful for your property</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">Mapped soil tells you about the area beneath the address. A property evaluation can compare that context with cracks, drainage, floor changes, and other signs at the home.</p>
                  </div>
                </div>
                <a href={evaluationHref} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold transition hover:bg-blue-500">
                  Request a Foundation Evaluation <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>

              <button onClick={downloadSummary} disabled={generating} className="mt-3 inline-flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-400 transition hover:text-white disabled:opacity-50">
                <Download className="h-4 w-4" aria-hidden="true" /> {generating ? 'Preparing summary...' : 'Download mapped soil summary'}
              </button>
            </div>
          );
        })()}
      </div>
    </section>
  );
}

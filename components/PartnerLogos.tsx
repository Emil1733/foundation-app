"use client";

export default function PartnerLogos() {
  const partners = [
    { name: "USDA", desc: "Public Agency" },
    { name: "NRCS", desc: "Soil Survey Program" },
    { name: "SSURGO", desc: "Mapped Soil Data" },
    { name: "USGS", desc: "Public Geology Data" }
  ];

  return (
    <div className="w-full bg-white border-y border-slate-100 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-8">
          Public Data Sources Referenced
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          {partners.map((p) => (
            <div key={p.name} className="flex flex-col items-center group cursor-default">
              <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors">
                {p.name}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {p.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

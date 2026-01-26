import SoilRiskWidget from "@/components/SoilRiskWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center text-center max-w-2xl w-full">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900">
            Fix the <span className="text-blue-600">Soil</span>, <br />
            Not Just The Crack.
          </h1>
          <p className="text-lg text-slate-600 max-w-lg mx-auto">
            Most foundation repairs fail because they ignore the geological root cause.
            Check your soil's shrink-swell potential instantly.
          </p>
        </div>

        <div className="w-full flex justify-center">
          <SoilRiskWidget />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mt-12 w-full">
          {[
            { title: "USDA Data", desc: "Sourced directly from federal soil surveys." },
            { title: "Geological Risk", desc: "Understand PI and Linear Extensibility." },
            { title: "Engineered Solutions", desc: "Get matched with geology-aware experts." }
          ].map((item, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

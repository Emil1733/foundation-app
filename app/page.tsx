import { createClient } from '@supabase/supabase-js';
import SoilRiskWidget from "@/components/SoilRiskWidget";
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 3600; // ISR: Rebuild homepage every hour

export default async function Home() {
  // 1. Fetch Popular Service Areas for Internal Linking
  const { data: cities } = await supabase
    .from('target_locations')
    .select('city, state, slug')
    .limit(24) // Show top 24
    .order('created_at', { ascending: false });

  // 2. Organization Schema (Pillar 3)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Foundation Risk Registry",
    "url": "https://foundation-app-self.vercel.app",
    "logo": "https://foundation-app-self.vercel.app/logo.png",
    "sameAs": [
      "https://twitter.com/foundationrisk",
      "https://facebook.com/foundationrisk"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-555-0199",
      "contactType": "customer service"
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center pt-20 pb-12 px-6 bg-white border-b border-slate-100">
        <div className="max-w-4xl w-full text-center space-y-6 mb-12">
          <div className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            🇺🇸 Serving Texas, Oklahoma & Missouri
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Fix the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Soil</span>, <br />
            Not Just The Crack.
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Most foundation repairs fail because they ignore the geological root cause.
            Check your soil's <strong>Plasticity Index</strong> instantly.
          </p>
        </div>

        <div className="w-full flex justify-center relative z-10">
          <SoilRiskWidget />
        </div>
      </main>

      {/* Trust Signals */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { title: "USDA Data", desc: "Sourced directly from federal soil surveys (SSURGO)." },
            { title: "Geological Risk", desc: "Understand PI and Linear Extensibility before you dig." },
            { title: "Engineered Solutions", desc: "Get matched with geology-aware forensic engineers." }
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AEO: EDUCATIONAL CONTENT BLOCK */}
      <section className="py-16 px-6 bg-white max-w-4xl mx-auto prose prose-slate prose-lg">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Why Traditional Foundation Repair Fails</h2>
        <p>
          Homeowners often ask: <em>"Why are foundation repair estimates so different?"</em> The answer lies in the <strong>Geological Profile</strong>.
          Contractors using "cookie-cutter" methods (like pressed piling) often fail to account for the <strong>Active Zone</strong> depth of your specific soil unit.
        </p>

        <div className="grid md:grid-cols-2 gap-8 not-prose mt-12">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">What IS an "Active Zone"?</h3>
            <p className="text-slate-600 mb-4 text-sm">
              The <strong>Active Zone</strong> is the depth at which soil moisture fluctuates seasonally.
              In expansive clay, this zone can extend 15+ feet deep.
            </p>
            <p className="text-slate-600 text-sm">
              <strong>The Risk:</strong> If a pier is installed to 10 feet (Standard), but the Active Zone is 15 feet,
              the pier will move <em>with</em> the heaving soil, rendering the "repair" useless.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">How We Audit Your Risk</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-xs">1</span>
                Identify your USDA Soil Map Unit.
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-xs">2</span>
                Calculate Linear Extensibility (Shrink/Swell).
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-xs">3</span>
                Match with Forensic Engineering protocols.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Service Area Grid (Pillar 4: Link Graph) */}
      {cities && cities.length > 0 && (
        <section className="py-20 px-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-slate-900">Active Service Areas</h2>
              <Link href="/locations" className="text-blue-600 font-semibold flex items-center gap-2 hover:underline">
                View All Cities <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/services/foundation-repair/${city.slug}`}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="bg-slate-100 group-hover:bg-blue-100 p-2 rounded-lg text-slate-400 group-hover:text-blue-600 transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm group-hover:text-blue-700">{city.city}</div>
                    <div className="text-xs text-slate-500">{city.state}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

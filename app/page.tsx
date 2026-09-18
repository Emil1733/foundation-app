import SoilRiskWidget from "@/components/SoilRiskWidget";
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import PartnerLogos from "@/components/PartnerLogos";
import { supabase } from '@/lib/supabase';

export const metadata = {
  title: "Foundation Repair Help & Evaluation | Foundation Risk Registry",
  description: "Concerned about cracks, uneven floors, or foundation movement? Review local soil context, understand repair options, and request a property-specific foundation evaluation.",
  alternates: {
    canonical: 'https://foundationrisk.org',
  },
  openGraph: {
    url: 'https://foundationrisk.org',
  },
};

export const revalidate = 86400; // ISR: Rebuild homepage every 24 hours

export default async function Home() {
  // 1. Fetch Popular Service Areas for Internal Linking
  const { data: cities } = await supabase
    .from('target_locations')
    .select('city, state, slug')
    .limit(24) // Show top 24
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
        <section className="w-full flex flex-col items-center justify-center pb-8 px-6 bg-white border-b border-slate-100">
          <div className="max-w-4xl w-full text-center space-y-6 mb-12">
            <div className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              🇺🇸 Serving Texas, Oklahoma & Missouri
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Foundation <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Problems?</span> <br />
              Start With the Evidence.
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Cracks, uneven floors, sticking doors, or signs of movement? Understand what may be happening, review foundation repair options, and
              <strong> Request a property-specific evaluation</strong> before choosing a repair plan.
            </p>
          </div>

          <div className="w-full flex justify-center relative z-10">
            <SoilRiskWidget />
          </div>
        </section>

        <PartnerLogos />

        {/* Trust Signals */}
        <section className="w-full py-16 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { title: "Foundation Warning Signs", desc: "Understand cracks, uneven floors, sticking doors, and other movement symptoms." },
              { title: "Local Soil Context", desc: "Use mapped USDA soil data to add context to what you are seeing at the property." },
              { title: "Foundation Evaluation", desc: "Request a property review and compare repair options before choosing a scope." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AEO: EDUCATIONAL CONTENT BLOCK */}
        <section className="w-full py-16 px-6 bg-white max-w-4xl mx-auto prose prose-slate prose-lg">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Why Foundation Repair Estimates Differ</h2>
          <p>
            Foundation repair estimates can differ because providers measure different areas, identify different causes, or propose different systems. The <strong>geological profile</strong> adds useful context, but the scope should ultimately be supported by property-specific observations and measurements.
          </p>

          <div className="grid md:grid-cols-2 gap-8 not-prose mt-12">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">What IS an &ldquo;Active Zone&rdquo;?</h3>
              <p>
                The <strong>Active Zone</strong> is the depth at which soil moisture fluctuates seasonally.
                Its depth varies by site and requires property-specific investigation to establish.
              </p>
              <p>
                <strong>The practical question:</strong> Ask how the proposed system accounts for actual subsurface conditions, loads, access, and the evidence that movement is active.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">How We Review Soil Context</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-xs">1</span>
                  Identify your USDA Soil Map Unit.
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-xs">2</span>
                  Explain mapped plasticity and shrink-swell indicators.
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-xs">3</span>
                  Organize the questions to ask during a property evaluation.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Soil context deep dive */}
        <section className="w-full py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Why Soil Data Matters</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                A crack does not automatically mean a home needs piers. The Foundation Risk Registry explains <strong>Plasticity Index (PI)</strong> and related USDA/NRCS soil-survey values so homeowners can place visible symptoms in context before requesting an evaluation or comparing repair proposals.
              </p>
              
              <div className="grid md:grid-cols-2 gap-12 my-12">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">The Active Zone Phenomenon</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Some fine-grained soils change volume as moisture conditions change. The depth affected by seasonal variation is often called the <em>active zone</em>, but its depth cannot be selected from a city map. Repair design should reflect site conditions, loads, and measured movement.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Engineering vs. Sales</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Transparent soil context helps homeowners ask why a repair is recommended, how the affected area was measured, and whether drainage or plumbing is contributing. Those questions make competing proposals easier to compare without assuming that map data supplies the diagnosis.
                  </p>
                </div>
              </div>

              <blockquote className="border-l-4 border-blue-600 pl-6 py-2 bg-slate-50 rounded-r-xl">
                <p className="text-slate-900 font-bold">
                  Higher-plasticity soil can be more sensitive to moisture change, but map data does not establish whether a particular foundation is moving. Repair decisions should be tied to property measurements, observed progression, and the likely cause.
                </p>
                <cite className="text-xs text-slate-500 block mt-2">Foundation Risk Registry research guidance</cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Soil report library grid */}
        {cities && cities.length > 0 && (
          <section className="w-full py-20 px-6 bg-white border-t border-slate-200">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Foundation Repair Resources & Local Soil Reports</h2>
                  <p className="text-slate-500 text-sm mt-1">Use local soil reports to understand foundation conditions, then review repair guidance for your area.</p>
                </div>
                <Link href="/learn" className="text-blue-600 font-semibold flex items-center gap-2 hover:underline">
                  View Foundation Resources <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.slice(0, 6).map((city) => (
                  <Link
                    key={`${city.slug}-soil`}
                    href={`/learn/${city.slug}-soil-analysis`}
                    prefetch={false}
                    className="group bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="bg-blue-50 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Soil Report
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition-colors">
                        Soil and Foundation Risk in {city.city}, {city.state}
                      </h3>
                      <p className="text-slate-500 text-xs mt-2 line-clamp-2">
                        Review mapped soil conditions, plasticity context, drainage considerations, and foundation warning signs in the {city.city} area.
                      </p>
                    </div>
                    <div className="text-blue-600 text-sm font-semibold mt-4 flex items-center gap-1">
                      Read Soil Report &rarr;
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Service Area Grid (Pillar 4: Link Graph) */}
        {cities && cities.length > 0 && (
          <section className="w-full py-20 px-6 bg-slate-50 border-t border-slate-200">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold text-slate-900">Active Service Areas</h2>
                <Link href="/locations" className="text-blue-600 font-semibold flex items-center gap-2 hover:underline">
                  View All Cities <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Featured Cities Spotlight */}
              <div className="mb-10">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Featured Foundation Repair Guides</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { city: 'Cedar Park', state: 'TX', slug: 'cedar-park-tx', label: 'Foundation Repair Guide' },
                    { city: 'Allen', state: 'TX', slug: 'allen-tx', label: 'Foundation Repair Guide' },
                    { city: 'Schertz', state: 'TX', slug: 'schertz-tx', label: 'Foundation Repair Guide' },
                    { city: 'Boerne', state: 'TX', slug: 'boerne-tx', label: 'Foundation Repair Guide' },
                    { city: 'Lewisville', state: 'TX', slug: 'lewisville-tx', label: 'Foundation Repair Guide' },
                  ].map((city) => (
                    <Link
                      key={city.slug}
                      href={`/services/foundation-repair/${city.slug}`}
                      className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-all group"
                    >
                      <div className="bg-blue-600 text-white p-2 rounded-lg group-hover:bg-blue-700 transition">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-blue-900 text-sm">{city.city}, {city.state}</div>
                        <div className="text-xs text-blue-600">{city.label} &rarr;</div>
                      </div>
                    </Link>
                  ))}
                </div>
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
    </main>
  );
}

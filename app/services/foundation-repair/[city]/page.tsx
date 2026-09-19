import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Info, MapPin, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import SoilRiskWidget from "@/components/SoilRiskWidget";
import TrustBadges from "@/components/TrustBadges";
import FoundationDiagram from "@/components/FoundationDiagram";
import SoilActionPlan from "@/components/SoilActionPlan";
import CrackAnalyzer from "@/components/CrackAnalyzer";
import CostEstimator from "@/components/CostEstimator";
import { getNearbyLocations } from "@/lib/nearbyLocations";
import { STATE_FOUNDATION_GUIDES } from "@/lib/stateFoundationGuides";
import { hasUsableSoilRecord, shouldIndexServicePage } from "@/lib/serviceIndexability";
import { getTexasFoundationGuide } from "@/lib/texasFoundationGuides";
import { getStateRoute } from "@/lib/stateRoutes";
import { classifySoilPlasticityIndex, hasDisplayableZip } from "@/lib/soilRisk";
import { getCommercialSeoTreatment } from "@/lib/commercialSeoTreatments";

export const revalidate = 604800;
export async function generateStaticParams() { return []; }

const getDynamicIntro = (city: string, soilName: string, risk: string) => {
  const hooks = [
    `${city} homes can respond differently to drought, heavy rain, drainage, vegetation, plumbing leaks, and previous site work. The mapped ${soilName} record helps frame the right questions before a repair is chosen.`,
    `The ${soilName} mapped around ${city} provides useful soil context for homeowners comparing foundation repair options. It does not replace measurements or an inspection at the property.`,
    `${risk === "unclassified" ? "The mapped soil record does not have a PI-based screening classification" : `A ${risk} map classification is a screening signal`}, not a repair prescription. In ${city}, compare the soil record with crack history, drainage, and floor-elevation evidence.`,
    `Protecting a ${city} home starts with understanding whether movement is active and what is contributing to it. That evidence helps avoid both unnecessary work and undersized repairs.`,
    `Foundation symptoms in ${city} should be evaluated as a pattern. Soil context, water control, measured movement, and construction details all help define an appropriate repair scope.`,
  ];
  return hooks[city.length % hooks.length];
};

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params;
  const { data: location } = await supabase.from("target_locations").select(`city, state, soil_cache (risk_level, map_unit_name)`).eq("slug", slug).single();
  if (!location) return { title: "Foundation Distress Identification Services" };
  const indexable = shouldIndexServicePage(slug, location.soil_cache);
  const treatment = getCommercialSeoTreatment(slug);
  const title = treatment ? treatment.title(location.city, location.state) : `${location.city} Foundation Repair | Soil Risk & Evaluation`;
  const description = treatment ? `Foundation repair in ${location.city}, ${location.state}. Review warning signs, mapped soil context, evaluation steps, costs, and repair options before choosing a scope.` : `Foundation repair in ${location.city}, ${location.state}: review mapped soil context, warning signs, and evaluation options before choosing a repair plan.`;
  return {
    title, description,
    alternates: { canonical: `https://foundationrisk.org/services/foundation-repair/${slug}` },
    ...(!indexable && { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } }),
    openGraph: { title, description, url: `https://foundationrisk.org/services/foundation-repair/${slug}`, images: ["/logo.png"] },
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const { data: location, error } = await supabase.from("target_locations").select(`id, city, state, zip_code, latitude, longitude, soil_cache (*)`).eq("slug", slug).single();
  if (error || !location) return notFound();

  const { city, state, soil_cache: rawSoil } = location;
  const soil = Array.isArray(rawSoil) ? rawSoil[0] : rawSoil;
  const riskClass = classifySoilPlasticityIndex(soil?.plasticity_index);
  const treatment = getCommercialSeoTreatment(slug);
  const stateGuide = state === "TX" ? getTexasFoundationGuide(Number(location.latitude), Number(location.longitude)) : STATE_FOUNDATION_GUIDES[state];
  const stateRoute = getStateRoute(state);
  const neighbors = await getNearbyLocations(location.id, state);
  const soilReportAvailable = hasUsableSoilRecord(soil);
  const piNumber = soil?.plasticity_index === null || soil?.plasticity_index === undefined || soil?.plasticity_index === "" ? null : Number(soil.plasticity_index);
  const hasPi = piNumber !== null && Number.isFinite(piNumber) && piNumber >= 0;
  const piDisplay = hasPi ? piNumber.toFixed(1) : "Not reported";

  const faqs = [
    { q: `How much does foundation repair cost in ${city}?`, a: `Foundation repair cost in ${city} depends on the cause, affected area, access, repair design, and number and type of supports. Compare written scopes based on property measurements rather than choosing a system from mapped soil data alone.` },
    { q: `Does active clay soil affect foundations in ${city}?`, a: soilReportAvailable && hasPi ? `The mapped ${soil.map_unit_name} record has a Plasticity Index of ${piDisplay} and a registry screening classification of ${riskClass}. That provides soil context, but it does not prove that a particular home is moving.` : soilReportAvailable ? `The mapped ${soil.map_unit_name} record does not have a reportable Plasticity Index, so no PI-based screening classification should be inferred. Soil conditions can still matter, but property measurements, drainage, construction, and changes over time are needed to evaluate a home.` : `Soil conditions can influence foundation performance, but mapped data alone cannot determine whether a particular home is moving. Property measurements, drainage, construction, and changes over time matter.` },
    { q: `What does a foundation evaluation in ${city} involve?`, a: `A useful foundation evaluation in ${city} documents visible symptoms, drainage, door and window alignment, and floor elevations where appropriate. The reviewer should explain how the evidence supports any proposed repair.` },
    { q: `How do I identify foundation distress in my ${city} home?`, a: `Track diagonal cracks, changing wall or trim gaps, multiple sticking openings, and measurable floor-level differences. None proves foundation failure by itself, so dates, measurements, drainage observations, and changes over time are important.` },
    { q: `What causes foundation settling in ${city}, ${state}?`, a: `Possible contributors include moisture-sensitive soil, erosion, poorly compacted fill, drainage concentration, plumbing leaks, vegetation, and construction details. A property evaluation is needed to identify the likely cause and whether repair is warranted.` },
  ];

  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": "https://foundationrisk.org/#organization", name: "The Foundation Risk Registry", url: "https://foundationrisk.org", logo: "https://foundationrisk.org/logo.png", knowsAbout: ["Foundation soil risk", "Foundation settlement warning signs", "Foundation evaluation questions"] },
    { "@type": "WebPage", "@id": `https://foundationrisk.org/services/foundation-repair/${slug}#webpage`, url: `https://foundationrisk.org/services/foundation-repair/${slug}`, name: `Foundation Repair in ${city}, ${state}`, description: `Foundation repair information, warning signs, mapped soil context, and evaluation options for homeowners in ${city}, ${state}.`, about: { "@type": "Thing", name: `Foundation repair in ${city}, ${state}` }, publisher: { "@id": "https://foundationrisk.org/#organization" } },
    { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Service Areas", item: "https://foundationrisk.org/locations" }, { "@type": "ListItem", position: 2, name: `${city} Foundation Repair`, item: `https://foundationrisk.org/services/foundation-repair/${slug}` }] }
  ] };

  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="relative isolate overflow-hidden bg-slate-950 text-white px-6 py-10 md:py-16 lg:py-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-30 bg-cover bg-[position:62%_center] sm:bg-[position:68%_center] lg:bg-[position:center_48%]"
          style={{ backgroundImage: "url('/foundation-hero-generated.webp')" }}
        />
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-slate-950/28 sm:bg-slate-950/24 lg:bg-slate-950/20" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,6,23,0.78)_0%,rgba(2,6,23,0.58)_46%,rgba(2,6,23,0.20)_76%,rgba(2,6,23,0.30)_100%)] lg:bg-[linear-gradient(90deg,rgba(2,6,23,0.82)_0%,rgba(2,6,23,0.62)_34%,rgba(2,6,23,0.14)_66%,rgba(2,6,23,0.24)_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-slate-950/32 to-transparent" />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-10 lg:gap-12 items-center">
          <div>
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-400"><ol className="flex flex-wrap items-center gap-2"><li><Link href="/" className="hover:text-white">Home</Link></li><li><ChevronRight className="h-3.5 w-3.5" /></li><li><Link href="/locations" className="hover:text-white">Service Areas</Link></li><li><ChevronRight className="h-3.5 w-3.5" /></li><li><Link href={stateRoute.href} className="hover:text-white">{stateRoute.name}</Link></li><li><ChevronRight className="h-3.5 w-3.5" /></li><li aria-current="page" className="text-slate-200">{city}</li></ol></nav>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-200 text-sm font-semibold mb-8"><ShieldCheck className="w-4 h-4 text-blue-400" /><span>{treatment ? treatment.eyebrow(city, state) : `Local Soil Context for ${city}, ${state}`}</span></div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">{treatment ? treatment.h1Lead : "Foundation Repair Evaluation & Options"}{" "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">in {city}, {state}</span></h1>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-xl">{treatment ? treatment.hero(city, state) : <>Seeing cracks, uneven floors, sticking doors, or other signs of foundation movement? Request an evaluation to understand the problem and what repair options may make sense for your home.</>}</p>
            <Link href="/book-analysis" className="inline-flex bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold items-center justify-center gap-2 transition hover:shadow-lg"><ShieldCheck className="w-5 h-5" /> {treatment?.cta || "Request a Foundation Evaluation"}</Link>
            <p className="mt-3 text-sm text-slate-400">Get help understanding the next step before committing to a repair.</p>
            <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-wrap gap-6 text-[11px] font-bold uppercase tracking-widest text-slate-400"><span>USDA Soil Context</span><span>Property-Specific Review</span><span>Compare Repair Options</span></div>
          </div>
          <div className="relative rounded-3xl border border-white/15 bg-slate-950/55 p-2 shadow-[0_28px_80px_rgba(2,6,23,0.45)] backdrop-blur-md"><SoilRiskWidget /></div>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto py-16 px-6">
        <TrustBadges />
        {treatment && <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-12"><h2 className="text-2xl font-bold text-slate-900 mb-3">Choosing Foundation Repair in {city}</h2><p className="text-slate-600 leading-relaxed">{treatment.localFocus(city)}</p><div className="mt-5 flex flex-wrap gap-3 text-sm"><a href="#repair-options" className="font-semibold text-blue-700 hover:underline">Compare repair options</a><span className="text-slate-300">•</span><a href="#foundation-cost" className="font-semibold text-blue-700 hover:underline">Understand cost factors</a><span className="text-slate-300">•</span><Link href="/book-analysis" className="font-semibold text-blue-700 hover:underline">Request an evaluation</Link></div></section>}
        <CrackAnalyzer city={city} pi={soil?.plasticity_index} />
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-12">
          <div className="flex items-start gap-4 mb-6"><div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Info className="w-6 h-6" /></div><div><h2 className="text-2xl font-bold text-slate-900">Mapped Soil and Foundation Context for {city}</h2><p className="text-slate-500 text-sm">{hasDisplayableZip(location.zip_code) ? `USDA/NRCS soil screening record for ZIP ${location.zip_code}` : "USDA/NRCS mapped soil screening context for this location"}</p></div></div>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p>{getDynamicIntro(city, soilReportAvailable ? soil.map_unit_name : "local soil", hasPi ? riskClass : "unclassified")}</p>
            {soil && <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose"><div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plasticity Index (PI)</span><div className="flex items-end gap-2 mt-1"><span className="text-3xl font-mono font-bold text-slate-900">{piDisplay}</span>{hasPi && <span className="rounded bg-blue-100 px-2 py-0.5 text-sm font-bold text-blue-800">{riskClass}</span>}</div><p className="text-xs text-slate-500 mt-2">{hasPi ? "Mapped screening value, not a measurement from the property." : "No reportable mapped PI is available for this record."}</p></div><div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shrink-Swell</span><div className="mt-1 text-3xl font-mono font-bold text-slate-900">{soil.shrink_swell_potential === null || soil.shrink_swell_potential === undefined ? "Not reported" : `${Number(soil.shrink_swell_potential).toFixed(1)}%`}</div><p className="text-xs text-slate-500 mt-2">Mapped linear-extensibility context, site conditions can vary.</p></div></div>}
            {soilReportAvailable && <Link href={`/learn/${slug}-soil-analysis`} className="not-prose mt-8 flex items-center justify-between p-4 bg-slate-50 border border-blue-100 rounded-xl hover:bg-blue-50 transition"><span><strong className="block text-slate-900">View {city} Soil Risk Report</strong><span className="text-sm text-slate-500">Review the mapped soil record and interpretation.</span></span><ChevronRight className="w-5 h-5 text-blue-600" /></Link>}
          </div>
        </section>

        <FoundationDiagram />
        <SoilActionPlan city={city} soil={soil || null} riskLevel={riskClass} />
        {stateGuide && <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-12"><h2 className="text-2xl font-bold text-slate-900 mb-4">Regional Foundation Guidance for {city}</h2><div className="space-y-4 text-slate-600 leading-relaxed">{stateGuide.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><h3 className="text-lg font-bold text-slate-900 mt-6 mb-3">What to watch for</h3><ul className="list-disc pl-5 space-y-2 text-slate-600">{stateGuide.watchFor.map((item) => <li key={item}>{item}</li>)}</ul><h3 className="text-lg font-bold text-slate-900 mt-6 mb-3">Evaluation approach</h3><p className="text-slate-600 leading-relaxed">{stateGuide.evaluation}</p><p className="text-sm text-slate-500 mt-4">Regional guidance is context only. Repair decisions should be tied to evidence from the property.</p></section>}
        {treatment && <section id="repair-options" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-12 scroll-mt-24"><h2 className="text-2xl font-bold text-slate-900 mb-4">Foundation Repair Options in {city}</h2><p className="text-slate-600 leading-relaxed mb-5">Common proposals may involve localized supports or piers, slab or footing stabilization, drainage corrections, plumbing repairs, or monitoring when structural work is not yet supported by the evidence. The appropriate option depends on the movement mechanism, affected area, access, foundation type, and measurements at the property.</p><p className="text-slate-600 leading-relaxed">When comparing contractors, ask for the measured elevations or other evidence behind the scope, which areas are included, what is excluded, how drainage or plumbing concerns are handled, and what the warranty actually covers.</p></section>}
        <div id="foundation-cost" className="scroll-mt-24"><CostEstimator city={city} pi={soil?.plasticity_index} /></div>

        <section className="bg-slate-900 text-white rounded-2xl p-8 md:p-10 mb-12"><h2 className="text-3xl font-bold mb-4">Does your {city} home need foundation repair?</h2><p className="text-slate-300 mb-6 max-w-2xl">Cracks, uneven floors, sticking doors, and other changes can have several causes. Request a foundation evaluation to understand what may be happening and what your next step should be.</p><Link href="/book-analysis" className="inline-flex bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold items-center gap-2"><ShieldCheck className="w-5 h-5" /> Request a Foundation Evaluation</Link></section>

        <section className="mb-12"><h2 className="text-3xl font-bold text-slate-900 mb-6">Foundation Repair Questions in {city}</h2><div className="space-y-4">{faqs.map((faq) => <details key={faq.q} className="bg-white border border-slate-200 rounded-xl p-5 group"><summary className="font-bold text-slate-900 cursor-pointer">{faq.q}</summary><p className="mt-3 text-slate-600 leading-relaxed">{faq.a}</p></details>)}</div></section>

        {neighbors.length > 0 && <section className="border-t border-slate-200 pt-10"><h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Foundation Repair Near {city}</h2><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">{neighbors.map((n) => <Link key={n.id} href={`/services/foundation-repair/${n.slug}`} className="bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-blue-300 hover:text-blue-700 transition"><span className="font-semibold">{n.city}, {n.state}</span><span className="block text-xs text-slate-400 mt-1">{n.distanceMiles.toFixed(0)} miles away</span></Link>)}</div></section>}
      </main>
    </div>
  );
}

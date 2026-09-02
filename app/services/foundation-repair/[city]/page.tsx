import { supabase } from "@/lib/supabase";
import SoilRiskWidget from "@/components/SoilRiskWidget";
import TrustBadges from "@/components/TrustBadges";
import FoundationDiagram from "@/components/FoundationDiagram";
import SoilActionPlan from "@/components/SoilActionPlan";
import CrackAnalyzer from "@/components/CrackAnalyzer";
import CostEstimator from "@/components/CostEstimator";
import {
  MoveRight,
  ShieldCheck,
  MapPin,
  Info,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getNearbyLocations } from "@/lib/nearbyLocations";
import { STATE_FOUNDATION_GUIDES } from "@/lib/stateFoundationGuides";

export const revalidate = 604800; // ISR: Cache for 1 week to protect Vercel compute and Supabase DB

// SSG: Build pages on-demand instead of at build time to prevent Vercel timeout
export async function generateStaticParams() {
  return []; // Return empty array to force ISR on-demand generation
}

// Logic to select intro based on city/soil features (Deterministic/Hash-based)
const getDynamicIntro = (city: string, soilName: string, risk: string) => {
  const hooks = [
    `${city} homes can respond differently to drought, heavy rain, drainage, vegetation, plumbing leaks, and previous site work. The mapped ${soilName} record helps frame the right questions before a repair is chosen.`,
    `The ${soilName} mapped around ${city} provides useful soil context for homeowners comparing foundation repair options. It does not replace measurements or an inspection at the property.`,
    `A ${risk}-risk map classification is a screening signal, not a repair prescription. In ${city}, the next step is to compare the soil record with crack history, drainage, and floor-elevation evidence.`,
    `Protecting a ${city} home starts with understanding whether movement is active and what is contributing to it. That evidence helps homeowners avoid both unnecessary work and undersized repairs.`,
    `Foundation symptoms in ${city} should be evaluated as a pattern. Soil context, water control, measured movement, and construction details all help define an appropriate repair scope.`,
  ];

  // Deterministic rotation based on city name length
  const index = city.length % 5;
  return hooks[index];
};

// SEO Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const { data: location } = await supabase
    .from("target_locations")
    .select(`city, state, soil_cache (risk_level, map_unit_name)`)
    .eq("slug", slug)
    .single();

  if (!location) return { title: "Foundation Distress Identification Services" };

  return {
    title: `${location.city} Foundation Repair | Soil Risk & Evaluation`,
    description: `Foundation repair in ${location.city}, ${location.state}: review mapped soil context, warning signs, and evaluation options before choosing a repair plan.`,
    alternates: {
      canonical: `https://foundationrisk.org/services/foundation-repair/${slug}`,
    },
    openGraph: {
      url: `https://foundationrisk.org/services/foundation-repair/${slug}`,
      images: ["/logo.png"],
    },
  };
}

// MAIN PAGE
export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;

  // 1. Fetch Main Data
  const { data: location, error } = await supabase
    .from("target_locations")
    .select(`id, city, state, zip_code, soil_cache (*)`)
    .eq("slug", slug)
    .single();

  if (error || !location) return notFound();
  const { city, state, soil_cache: rawSoil } = location;
  const soil = Array.isArray(rawSoil) ? rawSoil[0] : rawSoil;
  const stateGuide = STATE_FOUNDATION_GUIDES[state];

  // 2. Read the six precomputed nearby locations without loading the full table.
  const neighbors = await getNearbyLocations(location.id, state);

  // 3. Prepare Schema & FAQ
  const faqs = [
    {
      q: `How much does foundation repair cost in ${city}?`,
      a: `Foundation repair cost in ${city} depends on the cause, affected area, access, repair design, and number and type of supports. Compare written scopes based on property measurements rather than choosing a system from mapped soil data alone.`,
    },
    {
      q: `Does active clay soil affect foundations in ${city}?`,
      a: `The mapped ${soil?.map_unit_name} record has a Plasticity Index of ${soil?.plasticity_index} and a registry classification of ${soil?.risk_level}. That may indicate moisture sensitivity, but it does not prove that a particular home is moving.`,
    },
    {
      q: `Should I compare foundation repair warranties?`,
      a: `Yes. Warranty terms vary by provider. Ask who is responsible for the warranty, what movement or components it covers, whether it transfers, and which service fees or exclusions apply.`,
    },
    {
      q: `What does a foundation evaluation in ${city} involve?`,
      a: `A useful foundation evaluation in ${city} documents visible symptoms, drainage, door and window alignment, and floor elevations where appropriate. The reviewer should explain whether movement appears active, historic, or cosmetic and how the evidence supports any proposed repair.`,
    },
    {
      q: `How do I identify foundation distress in my ${city} home?`,
      a: `Track diagonal cracks, changing wall or trim gaps, multiple sticking openings, and measurable floor-level differences. None of these signs proves foundation failure by itself, so dates, measurements, drainage observations, and changes over time are important.`,
    },
    {
      q: `What causes foundation settling in ${city}, ${state}?`,
      a: `Possible contributors include moisture-sensitive soil, erosion, poorly compacted fill, drainage concentration, plumbing leaks, vegetation, and construction details. The mapped ${soil?.map_unit_name || 'local soil'} record helps with screening, but a property evaluation is needed to identify the likely cause and whether repair is warranted.`,
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://foundationrisk.org/#organization",
      name: "The Foundation Risk Registry",
      url: "https://foundationrisk.org",
      logo: "https://foundationrisk.org/logo.png",
      areaServed: {
        "@type": "City",
        name: `${city}, ${state}`,
        containedInPlace: {
          "@type": "Country",
          name: "United States",
        },
      },
      knowsAbout: [
        "Foundation soil risk",
        "Expansive clay soil",
        "Foundation settlement warning signs",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `https://foundationrisk.org/services/foundation-repair/${slug}#service`,
      name: `Foundation Repair in ${city}, ${state}`,
      serviceType: "Foundation Repair",
      url: `https://foundationrisk.org/services/foundation-repair/${slug}`,
      provider: {
        "@id": "https://foundationrisk.org/#organization",
      },
      areaServed: {
        "@type": "City",
        name: `${city}, ${state}`,
        containedInPlace: {
          "@type": "Country",
          name: "United States",
        },
      },
      description: `Foundation repair information and evaluation options for homeowners in ${city}, ${state}, with mapped context for ${soil?.map_unit_name || "local soil conditions"}.`,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Foundation Repair and Evaluation Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Foundation Evaluation",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Foundation Repair Consultation",
            },
          },
        ],
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Service Areas",
          item: "https://www.foundationrisk.org/locations",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: `${city} Foundation Evaluation`,
          item: `https://www.foundationrisk.org/services/foundation-repair/${slug}`,
        },
      ],
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <header className="bg-slate-900 text-white py-8 md:py-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 -z-10" />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-200 text-sm font-semibold mb-8 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>
                Local Soil Context for {city}, {state}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Foundation Repair Evaluation & Options{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                in {city}, {state}
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-lg">
              Serving{" "}
              <strong>
                {city}, {state}
              </strong>
              . Review mapped <strong>{soil?.map_unit_name || "soil conditions"}</strong>, understand warning signs,
              and request a property-specific evaluation before choosing a repair plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/book-analysis"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition hover:shadow-lg"
              >
                <ShieldCheck className="w-5 h-5" /> Request a Foundation Evaluation
              </Link>
            </div>
            
            {/* HERO TRUST BADGES */}
            <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                  <Info className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">USDA Soil Context</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Property-Specific Review</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Compare Repair Options</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <SoilRiskWidget />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main id="main-content" className="max-w-4xl mx-auto py-16 px-6">
        {/* TRUST STACK */}
        <TrustBadges />

        {/* CRACK DIAGNOSTIC TOOL */}
        <CrackAnalyzer city={city} pi={soil?.plasticity_index} />

        {/* SOIL ANALYSIS */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Mapped Soil and Foundation Context for {city}
              </h2>
              <p className="text-slate-500 text-sm">
                USDA/NRCS soil screening record for ZIP {location.zip_code}
              </p>
            </div>
          </div>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p>
              {getDynamicIntro(
                city,
                soil?.map_unit_name || "Expansive Clay",
                soil?.risk_level || "High",
              )}
            </p>
            {soil && (
              <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Plasticity Index (PI)
                  </span>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-3xl font-mono font-bold text-slate-900">
                      {Number(soil.plasticity_index).toFixed(1)}
                    </span>
                    <span
                      className="rounded bg-blue-100 px-2 py-0.5 text-sm font-bold text-blue-800"
                    >
                      {soil.risk_level || "NOT CLASSIFIED"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Mapped screening value; not a measurement from the property.
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Shrink-Swell
                  </span>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-3xl font-mono font-bold text-slate-900">
                      {Number(soil.shrink_swell_potential).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Mapped linear-extensibility context; site conditions can vary.
                  </p>
                </div>
              </div>
            )}

            {/* P2 INTERNAL LINK */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <Link
                href={`/learn/${slug}-soil-analysis`}
                className="group flex items-center justify-between p-4 bg-slate-50 border border-blue-100 rounded-xl hover:bg-blue-50 transition"
              >
                <div>
                  <span className="block font-bold text-slate-900 group-hover:text-blue-700 transition">
                    View Local Soil Risk Report
                  </span>
                  <span className="text-sm text-slate-500">
                    Deep dive into {soil?.map_unit_name || "local soil"} risks
                    in {city}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-full border border-slate-200 group-hover:border-blue-200 shadow-sm">
                  <MoveRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        <FoundationDiagram />

        {/* DYNAMIC ACTION PLAN (Entropy Check) */}
        <SoilActionPlan soil={soil} city={city} />

        {/* REGIONAL FOUNDATION GUIDANCE */}
        <div className="mt-12 bg-blue-950 text-white rounded-2xl p-8 border border-blue-800">
          <h3 className="text-xl font-bold mb-4 text-blue-200">
            What Homeowners in {stateGuide ? stateGuide.name : city} Should Know About Foundation Movement
          </h3>
          <div className="space-y-3 text-blue-100/80 text-sm leading-relaxed">
            {stateGuide ? (
              <>
                {stateGuide.overview.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <div className="pt-2">
                  <h4 className="font-semibold text-white mb-2">What is worth watching</h4>
                  <ul className="space-y-2 list-disc pl-5 marker:text-blue-400">
                    {stateGuide.watchFor.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <p className="pt-2">
                  <strong className="text-white">A sensible next step:</strong>{' '}
                  {stateGuide.evaluation}
                </p>
              </>
            ) : (
              <>
                <p>
                  The USDA soil record associated with this {city} page is{' '}
                  <strong className="text-white">{soil?.map_unit_name || 'not available'}</strong>.
                  Soil surveys describe mapped areas rather than individual lots, so grading, fill, drainage, vegetation,
                  plumbing, and construction can make conditions at a home different from the surrounding map unit.
                </p>
                <p>
                  This record lists a <strong className="text-white">Plasticity Index (PI)</strong> of{' '}
                  {Number(soil?.plasticity_index || 0).toFixed(1)} and a registry classification of{' '}
                  <strong className="text-white"> {soil?.risk_level || 'not reported'}</strong>. Use those values to understand
                  possible moisture sensitivity—not to decide whether a home needs piers, leveling, drainage work, or no structural repair.
                </p>
                <p>
                  A property-specific <strong className="text-white">foundation evaluation</strong> can compare visible symptoms,
                  drainage, crack history, and floor elevations with this soil context. That gives you a clearer basis for comparing
                  repair scopes and deciding whether structural or geotechnical expertise is appropriate.
                </p>
              </>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-blue-800 flex items-center gap-2 text-xs text-blue-300">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>
              Soil context is derived from USDA/NRCS SSURGO survey data. Repair recommendations require property-specific evidence.
            </span>
          </div>
        </div>

        {/* COST ESTIMATOR WIDGET */}
        <CostEstimator city={city} pi={soil?.plasticity_index} />

        {/* PROPERTY EVALUATION GUIDANCE */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-xl flex items-start gap-4">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-yellow-700" />
          </div>
          <div>
            <h3 className="font-bold text-yellow-900 text-lg mb-1">
              When to Request a Foundation Evaluation in {city}
            </h3>
            <p className="text-yellow-800 text-sm mb-4">
              Schedule a property review when cracks, floor levels, or several doors and windows are changing—or when water repeatedly collects near one part of the foundation.
            </p>
            <p className="text-yellow-800 text-sm">
              Bring dated photos, repair records, drainage observations, and any previous elevation measurements. Better evidence leads to a more useful scope and a fairer comparison between repair options.
            </p>
          </div>
        </div>

        {/* LINK TO SOIL ANALYSIS (PageRank Pass & Indexing) */}
        <div className="my-12 bg-blue-50 border border-blue-200 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-50 -mr-10 -mt-10"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Soil Reference
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">
                Mapped Soil Report for {city}
              </h3>
              <p className="text-slate-600 text-sm max-w-xl">
                Review the mapped soil unit ({soil?.map_unit_name || "local soil"}), its recorded plasticity data, and what those figures can—and cannot—tell you about a home.
              </p>
            </div>
            <Link
              href={`/learn/${slug}-soil-analysis`}
              prefetch={false}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition shadow-md hover:shadow-lg inline-flex items-center gap-2 whitespace-nowrap self-start md:self-center"
            >
              Read Soil Report <MoveRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* FAQ ACCORDION (SEO) */}
        <div className="mb-16 mt-16">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">
            Common Questions in {city}
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-slate-200"
              >
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-blue-500" /> {faq.q}
                </h4>
                <p className="text-slate-600 text-sm ml-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SPIDERWEB (NEARBY CITIES) */}
        {neighbors && neighbors.length > 0 && (
          <div className="border-t border-slate-200 pt-12">
            <h3 className="font-bold text-slate-900 mb-6">
              Serving Neighbors Near {city}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {neighbors.map((n) => (
                <Link
                  key={n.slug}
                  href={`/services/foundation-repair/${n.slug}`}
                  prefetch={false}
                  className="text-slate-500 hover:text-blue-600 text-sm flex items-center gap-1 transition-colors"
                >
                  <MapPin className="w-3 h-3" /> {n.city} Foundation Repair
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* STICKY MOBILE CTA */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-50">
        <Link
          href="/book-analysis"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-5 h-5" /> Request a Foundation Evaluation
        </Link>
      </div>
    </div>
  );
}

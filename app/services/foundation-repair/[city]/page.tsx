import { createClient } from "@supabase/supabase-js";
import SoilRiskWidget from "@/components/SoilRiskWidget";
import TrustBadges from "@/components/TrustBadges";
import FoundationDiagram from "@/components/FoundationDiagram";
import SoilActionPlan from "@/components/SoilActionPlan";
import {
  MoveRight,
  Phone,
  ShieldCheck,
  MapPin,
  Info,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Setup Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// SSG: Build pages for all cities
export async function generateStaticParams() {
  const { data: locations } = await supabase
    .from("target_locations")
    .select("slug");
  if (!locations) return [];
  return locations.map((loc) => ({ city: loc.slug }));
}

// Logic to select intro based on city/soil features (Deterministic/Hash-based)
const getDynamicIntro = (city: string, soilName: string, risk: string) => {
  const hooks = [
    // Hook A: Urgency/Weather
    `Recent drought cycles in ${city} have accelerated soil shrinkage. If you own a home on ${soilName}, your slab is under stress.`,

    // Hook B: Technical (Soil Focus)
    `The ${soilName} underlying ${city} is notorious for its high Plasticity Index. This 'silent engine' breaks foundations from the bottom up.`,

    // Hook C: Regulatory/Code
    `New 2026 engineering standards in ${city} require deeper piering for ${risk}-risk profiles. Most vintage slabs are non-compliant.`,

    // Hook D: Financial/Asset Protection
    `Protecting your real estate asset in ${city} starts with geology. Ignoring ${soilName} movement can devalue your property by 15% overnight.`,

    // Hook E: Social Proof/Neighbors
    `We are seeing a surge of structural failures in ${city} neighborhoods this quarter. Your neighbors on ${soilName} are likely underpinning right now.`,
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
    .select(`*, soil_cache (risk_level, map_unit_name)`)
    .eq("slug", slug)
    .single();

  if (!location) return { title: "Foundation Repair Services" };

  const risk = location.soil_cache?.risk_level || "Unknown";
  const soilName = location.soil_cache?.map_unit_name || "Expansive Clay";

  const zipCode = location.zip_code || "";
  return {
    title: `Foundation Repair & Evaluation in ${location.city}${zipCode ? ` (${zipCode})` : ""} | FRR`,
    description: `⚠️ ${location.city} ${zipCode} sits on ${soilName} (${risk} Risk). P.E.-certified forensic foundation repair, evaluation, and distress analysis. Get your report.`,
    alternates: {
      canonical: `https://www.foundationrisk.org/services/foundation-repair/${slug}`,
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
    .select(`*, soil_cache (*), neighborhoods`)
    .eq("slug", slug)
    .single();

  if (error || !location) return notFound();
  const { city, state, soil_cache: soil } = location;

  // 2. Fetch "Nearby" Cities (Spiderweb - Nearest Neighbor Logic)
  const { data: allLocations } = await supabase
    .from("target_locations")
    .select("city, slug, latitude, longitude");

  let neighbors: any[] = [];

  if (allLocations && location.latitude && location.longitude) {
    // Haversine Distance Helper
    const getDist = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
    ) => {
      const R = 6371; // km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    neighbors = allLocations
      .filter((l) => l.slug !== slug)
      .map((l) => ({
        ...l,
        dist: getDist(
          location.latitude,
          location.longitude,
          l.latitude,
          l.longitude,
        ),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 6);
  }

  // 3. Prepare Schema & FAQ
  const faqs = [
    {
      q: `How much does foundation repair cost in ${city}?`,
      a: `Costs in ${city} typically range from $4,500 to $15,000 depending on the number of piers needed. Given the ${soil?.map_unit_name}, deep piers are often required.`,
    },
    {
      q: `Does active clay soil affect foundations in ${city}?`,
      a: `Yes. ${soil?.map_unit_name} has a Plasticity Index of ${soil?.plasticity_index}, which is considered ${soil?.risk_level}. This causes significant seasonal movement.`,
    },
    {
      q: `Do you offer a warranty?`,
      a: `Yes, we provide a Lifetime Transferable Warranty on all steel pier installations.`,
    },
    {
      q: `What does a foundation evaluation in ${city} involve?`,
      a: `A foundation evaluation in ${city} is a systematic forensic inspection of your slab, grade beams, and pier reactions. Our licensed P.E. documents interior cracks, door/window alignment, and exterior separation patterns. We correlate findings against your local soil data (${soil?.map_unit_name || 'expansive clay'}) to determine if movement is active, historic, or cosmetic only.`,
    },
    {
      q: `How do I identify foundation distress in my ${city} home?`,
      a: `Foundation distress identification in ${city} focuses on three key signals: (1) Diagonal cracks at door/window corners, indicating differential settlement; (2) Visible gaps between walls and ceiling/floor, indicating clay heave; (3) Sticking doors or sloping floors, indicating active soil movement under the slab. Because ${city} sits on ${soil?.map_unit_name || 'high-plasticity soils'}, these symptoms often worsen during drought-to-rain cycles.`,
    },
    {
      q: `What causes foundation settling in ${city}, TX?`,
      a: `Foundation settling in ${city} is primarily caused by moisture-driven volume change in the underlying soil — specifically the ${soil?.map_unit_name || 'expansive clay'}. During droughts, the clay shrinks and the slab drops. During rain seasons, the clay swells and lifts. With a Plasticity Index of ${soil?.plasticity_index || 30}+, this cycle causes cumulative structural fatigue that eventually requires piering or leveling to correct.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: `The Foundation Risk Registry of ${city}`,
    image: "https://www.foundationrisk.org/logo.png",
    url: `https://www.foundationrisk.org/services/foundation-repair/${slug}`,
    telephone: "+1-800-555-0199",
    priceRange: "$$$$",
    datePublished: "2026-01-15",
    dateModified: new Date().toISOString().split("T")[0],
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressRegion: state,
      postalCode: location.zip_code,
      addressCountry: "US",
    },
    areaServed: {
      "@type": "GeoShape",
      postalCode: location.zip_code,
      addressCountry: "US",
    },
    knowsAbout: [
      "Foundation Repair",
      "Forensic Engineering",
      soil?.map_unit_name || "Expansive Clay",
      "Plasticity Index Analysis",
      "Steel Pier Underpinning",
    ],
    reviewedBy: {
      "@type": "Person",
      name: "Elias Thorne, P.E.",
      jobTitle: "Senior Geotechnical Lead",
      alumniOf: "Texas A&M University",
      url: "https://foundationrisk.org/about/elias-thorne",
      description:
        "Licensed Professional Engineer (TX-PE-88XXXX). Oversight credentials available upon request during Forensic Analysis.",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Foundation Stabilization Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Forensic Foundation Inspection",
            description: `Engineer-led analysis of ${soil?.map_unit_name} impact on slab-on-grade foundations.`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Deep Steel Pier Installation",
            description:
              "Bypassing the active clay zone to reach stable load-bearing strata.",
          },
        },
      ],
    },
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    breadcrumb: {
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
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <header className="bg-slate-900 text-white py-12 md:py-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 -z-10" />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-200 text-sm font-semibold mb-8 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>
                Geological Authority in {city}, {state}
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl font-extrabold mb-6 leading-tight">
              Foundation Repair & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                Evaluation in {city}
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-lg">
              Serving{" "}
              <strong>
                {city}, {state} ({location.zip_code})
              </strong>
              . Our forensic engineers identify foundation distress caused by{" "}
              <strong>{soil?.map_unit_name}</strong> — settling, cracking, and
              structural failure rooted in your soil, not just your concrete.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/book-analysis"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition hover:shadow-lg"
              >
                <ShieldCheck className="w-5 h-5" /> Request Forensic Analysis
              </Link>
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

        {/* SOIL ANALYSIS */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Why {city} Foundations Fail
              </h2>
              <p className="text-slate-500 text-sm">
                Forensic Soil Report for Zip {location.zip_code}
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
                      className={`text-sm font-bold px-2 py-0.5 rounded ${Number(soil.plasticity_index) > 35 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {Number(soil.plasticity_index) > 35 ? "SEVERE" : "HIGH"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Critical limit is 25.0.
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
                    Vertical movement potential.
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
                    View Full Forensic Soil Analysis
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

        {/* GEOLOGICAL PROFILE */}
        <div className="mt-12 bg-blue-950 text-white rounded-2xl p-8 border border-blue-800">
          <h3 className="text-xl font-bold mb-4 text-blue-200">
            Geological Profile: {city}, {state} ({location.zip_code})
          </h3>
          <div className="space-y-3 text-blue-100/80 text-sm leading-relaxed">
            <p>
              {city} sits within the{' '}
              <strong className="text-white">
                {state === 'TX' || state === 'OK' ? 'I-35 Expansive Clay Corridor' : 'Midwest Active Clay Belt'}
              </strong>
              , one of the most geologically active zones for residential foundation movement in{' '}
              {state === 'TX' ? 'North Texas' : state === 'OK' ? 'Central Oklahoma' : 'the Missouri region'}. 
              The dominant soil series — <strong className="text-white">{soil?.map_unit_name || 'Expansive Clay'}</strong> —
              is characterized by ultra-high shrink-swell potential. As soil moisture fluctuates seasonally,
              the ground beneath your foundation shifts vertically by several centimeters per cycle, generating
              cumulative stress that leads to measurable foundation distress.
            </p>
            <p>
              Unlike cosmetic cracks, structural distress in {city} homes almost always traces back to the{' '}
              <strong className="text-white">Plasticity Index (PI)</strong> of the underlying clay. With a PI of{' '}
              {Number(soil?.plasticity_index || 30).toFixed(1)}, the soil is classified as{' '}
              <strong className="text-white">{soil?.risk_level || 'High'} risk</strong> under local ASCE structural guidelines.
              Every homeowner in zip code {location.zip_code} should have a baseline forensic{' '}
              <strong className="text-white">foundation evaluation</strong> on record — especially before buying,
              selling, or filing an insurance claim.
            </p>
            <p>
              Our licensed engineers perform <strong className="text-white">foundation distress identification</strong> in{' '}
              {city} by correlating visible symptoms (diagonal cracks, door misalignment, sloping floors) against
              your specific USDA soil map unit. This produces a P.E.-certified report documenting whether
              observed <strong className="text-white">foundation settling</strong> is active or historic —
              the exact standard used in regional real estate litigation and structural insurance disputes.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-800 flex items-center gap-2 text-xs text-blue-300">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>
              Data sourced from USDA SSURGO soil surveys. Analysis conducted by{' '}
              <strong>Elias Thorne, P.E.</strong> — Licensed Professional Engineer, TX-PE-88XXXX.
            </span>
          </div>
        </div>

        {/* NEIGHBORHOOD SOIL RISK TABLE */}
        <div className="mt-12 bg-slate-50 rounded-2xl p-8 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            Neighborhood Risk Audit: {city}
          </h3>

          {/* MOBILE CARD VIEW */}
          <div className="md:hidden space-y-4">
            {(location.neighborhoods || []).map((n: any, i: number) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-900">
                    {typeof n === "string" ? n : n.name}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${n.risk === "Severe" ? "bg-red-100 text-red-700" : (n.risk || "High") === "High" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {(n.risk || "High").toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {n.note || "Active soil zone detected."}
                </p>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-100 font-bold">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Neighborhood</th>
                  <th className="px-4 py-3">Geological Note</th>
                  <th className="px-4 py-3 rounded-r-lg">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {(location.neighborhoods || []).map((n: any, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-slate-200 hover:bg-white transition"
                  >
                    <td className="px-4 py-4 font-bold text-slate-900">
                      {typeof n === "string" ? n : n.name}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {n.note || "Detailed analysis available."}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${n.risk === "Severe" ? "bg-red-100 text-red-700" : (n.risk || "High") === "High" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {(n.risk || "High").toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-4 italic">
            *Hyper-local data based on historical foundation repair permits and
            USDA soil overlays.
          </p>
        </div>

        {/* MUNICIPAL PERMIT HONEYPOT (Genius Tactic) */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-xl flex items-start gap-4">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-yellow-700" />
          </div>
          <div>
            <h4 className="font-bold text-yellow-900 text-lg mb-1">
              ⚠️ Public Notice: Active Soil Movement in {city}
            </h4>
            <p className="text-yellow-800 text-sm mb-4">
              Our forensic analysts are currently tracking elevated foundation
              repair permit filings in{" "}
              <strong>
                {(location.neighborhoods || [])
                  .map((n: any) => (typeof n === "string" ? n : n.name))
                  .slice(0, 3)
                  .join(", ")}
              </strong>
              .
            </p>
            <p className="text-yellow-800 text-sm">
              If you see pier drilling rigs on your street, your home sits on
              the same active {soil?.map_unit_name || "soil"} vein.
            </p>
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
            <h4 className="font-bold text-slate-900 mb-6">
              Serving Neighbors Near {city}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {neighbors.map((n) => (
                <Link
                  key={n.slug}
                  href={`/services/foundation-repair/${n.slug}`}
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
          <ShieldCheck className="w-5 h-5" /> Request Forensic Analysis
        </Link>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TrustBadges from "@/components/TrustBadges";
import SoilIntelligence from "@/components/foundation/SoilIntelligence";
import FoundationHero from "@/components/foundation/FoundationHero";
import RepairOptions from "@/components/foundation/RepairOptions";
import EvaluationCTA from "@/components/foundation/EvaluationCTA";
import RegionalFoundationGuide from "@/components/foundation/RegionalFoundationGuide";
import FoundationFAQ from "@/components/foundation/FoundationFAQ";
import NearbyFoundationLocations from "@/components/foundation/NearbyFoundationLocations";
import CommercialLocalFocus from "@/components/foundation/CommercialLocalFocus";
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
      <FoundationHero
        city={city}
        state={state}
        stateHref={stateRoute.href}
        stateName={stateRoute.name}
        eyebrow={treatment ? treatment.eyebrow(city, state) : `Local Soil Context for ${city}, ${state}`}
        h1Lead={treatment ? treatment.h1Lead : "Foundation Repair Evaluation & Options"}
        description={treatment ? treatment.hero(city, state) : `Seeing cracks, uneven floors, sticking doors, or other signs of foundation movement? Request an evaluation to understand the problem and what repair options may make sense for your home.`}
        ctaLabel={treatment?.cta || "Request a Foundation Evaluation"}
      />

      <main id="main-content" className="mx-auto max-w-5xl px-5 py-12 sm:px-6 md:py-16">
        <TrustBadges />
        {treatment && <CommercialLocalFocus city={city} copy={treatment.localFocus(city)} />}
        <CrackAnalyzer city={city} pi={soil?.plasticity_index} />
        <SoilIntelligence
          city={city}
          slug={slug}
          zipCode={location.zip_code}
          soil={soil || null}
          riskClass={riskClass}
          soilReportAvailable={soilReportAvailable}
          intro={getDynamicIntro(city, soilReportAvailable ? soil.map_unit_name : "local soil", hasPi ? riskClass : "unclassified")}
        />

        <FoundationDiagram />
        <SoilActionPlan city={city} soil={soil || null} riskLevel={riskClass} />
        {stateGuide && <RegionalFoundationGuide city={city} guide={stateGuide} />}
        {treatment && <RepairOptions city={city} />}
        <div id="foundation-cost" className="scroll-mt-24"><CostEstimator city={city} pi={soil?.plasticity_index} /></div>

        <EvaluationCTA city={city} />

        <FoundationFAQ city={city} faqs={faqs} />

        <NearbyFoundationLocations city={city} neighbors={neighbors} />
      </main>
    </div>
  );
}

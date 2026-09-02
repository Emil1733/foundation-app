type SoilRelation =
  | { map_unit_name?: string | null }
  | Array<{ map_unit_name?: string | null }>
  | null
  | undefined;

/**
 * Service pages with GSC impressions or clicks in the finalized data available
 * through 2026-08-30. These remain indexable while their missing soil records
 * are repaired. Keeping the exception list here makes the SEO rule deterministic
 * at request time and prevents a live dependency on the Google Search Console API.
 */
const GSC_PROTECTED_MISSING_SOIL_SLUGS = new Set([
  "apex-nc",
  "atlanta-ga",
  "augusta-ga",
  "badin-nc",
  "belton-tx",
  "bushnell-fl",
  "callahan-fl",
  "carthage-nc",
  "crestview-fl",
  "delta-co",
  "dobson-nc",
  "drexel-nc",
  "fernandina-beach-fl",
  "forest-city-nc",
  "forsyth-ga",
  "fort-pierce-fl",
  "fort-worth-tx",
  "gainesville-fl",
  "graham-nc",
  "hialeah-fl",
  "hilliard-fl",
  "hurst-tx",
  "jackson-ms",
  "jacksonville-beach-fl",
  "key-west-fl",
  "landis-nc",
  "lincolnton-nc",
  "live-oak-fl",
  "macon-ga",
  "maitland-fl",
  "mayodan-nc",
  "mcdonough-ga",
  "mebane-nc",
  "melbourne-fl",
  "montgomery-tx",
  "mooresville-nc",
  "morganton-nc",
  "morrow-ga",
  "nashville-tn",
  "new-smyrna-beach-fl",
  "north-miami-beach-fl",
  "oakboro-nc",
  "ocala-fl",
  "oviedo-fl",
  "palm-beach-fl",
  "panama-city-fl",
  "pinellas-park-fl",
  "reidsville-nc",
  "roxboro-nc",
  "sanford-fl",
  "savannah-ga",
  "smyrna-ga",
  "spindale-nc",
  "st.-petersburg-fl",
  "starke-fl",
  "statesville-nc",
  "stone-mountain-ga",
  "tallahassee-fl",
  "titusville-fl",
  "vero-beach-fl",
  "wake-forest-nc",
  "washington-nc",
  "west-palm-beach-fl",
  "williamston-nc",
  "winter-haven-fl",
  "winter-springs-fl",
]);

export function hasUsableSoilRecord(relation: SoilRelation): boolean {
  const soil = Array.isArray(relation) ? relation[0] : relation;
  const soilName = soil?.map_unit_name?.trim();
  return Boolean(soilName && soilName.toLowerCase() !== "unknown");
}

export function shouldIndexServicePage(slug: string, soil: SoilRelation): boolean {
  return hasUsableSoilRecord(soil) || GSC_PROTECTED_MISSING_SOIL_SLUGS.has(slug);
}


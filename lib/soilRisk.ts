export type SoilScreeningClass = "Lower" | "Moderate" | "High" | "Severe" | "Not classified";

/**
 * Registry screening classification based on the mapped USDA/NRCS plasticity
 * index value stored for a location. This is not a property diagnosis.
 *
 * Keep all ingestion and rendering code on this shared function so the same
 * mapped PI value cannot receive different labels in different parts of the app.
 */
export function classifySoilPlasticityIndex(value: unknown): SoilScreeningClass {
  if (value === null || value === undefined || value === "") return "Not classified";

  const pi = Number(value);
  if (!Number.isFinite(pi) || pi < 0) return "Not classified";
  if (pi > 35) return "Severe";
  if (pi > 25) return "High";
  if (pi > 15) return "Moderate";
  return "Lower";
}

export function hasDisplayableZip(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const zip = value.trim();
  return /^\d{5}(?:-\d{4})?$/.test(zip) && !/^0{5}(?:-0{4})?$/.test(zip);
}

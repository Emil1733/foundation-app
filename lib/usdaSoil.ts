export type UsdaSoilRecord = {
  map_unit_symbol: string | null;
  map_unit_name: string | null;
  component_name: string | null;
  component_percent: number | null;
  shrink_swell: number | null;
  plasticity_index: number | null;
  drainage_class: string | null;
};

type SoilRow = Record<string, unknown>;

const SCREENING_DEPTH_CM = 50;

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function rowsFromTable(table?: unknown[][]): SoilRow[] {
  if (!table || table.length <= 1) return [];
  const headers = table[0].map(String);
  return table.slice(1).map((values) => {
    const row: SoilRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    return row;
  });
}

function weightedHorizonValue(rows: SoilRow[], field: 'plasticity_index' | 'shrink_swell'): number | null {
  let weightedTotal = 0;
  let representedDepth = 0;

  for (const row of rows) {
    const top = toFiniteNumber(row.horizon_top_cm);
    const bottom = toFiniteNumber(row.horizon_bottom_cm);
    const value = toFiniteNumber(row[field]);
    if (top === null || bottom === null || value === null) continue;

    const clippedTop = Math.max(0, top);
    const clippedBottom = Math.min(SCREENING_DEPTH_CM, bottom);
    const thickness = clippedBottom - clippedTop;
    if (thickness <= 0) continue;

    weightedTotal += value * thickness;
    representedDepth += thickness;
  }

  return representedDepth > 0 ? weightedTotal / representedDepth : null;
}

/**
 * Converts raw Soil Data Access rows into the registry's screening record.
 *
 * Method:
 * 1. The SDA query is already ordered by component percentage DESC and horizon
 *    top depth ASC.
 * 2. Use the first row's component key as the dominant major component.
 * 3. For PI and LEP, combine that component's horizons intersecting 0-50 cm
 *    using horizon-thickness weighting.
 * 4. Missing horizon values are excluded from that attribute's denominator.
 *
 * This follows NRCS Soil Data Access guidance that numeric horizon attributes
 * spanning multiple layers should be thickness-weighted. It is still mapped
 * screening context, not a property-specific soil test.
 */
export function aggregateUsdaSoilTable(table?: unknown[][]): UsdaSoilRecord | null {
  const rows = rowsFromTable(table);
  if (rows.length === 0) return null;

  const first = rows[0];
  const componentKey = first.component_key;
  const componentRows = rows.filter((row) => row.component_key === componentKey);
  if (componentRows.length === 0) return null;

  return {
    map_unit_symbol: first.map_unit_symbol ? String(first.map_unit_symbol) : null,
    map_unit_name: first.map_unit_name ? String(first.map_unit_name) : null,
    component_name: first.component_name ? String(first.component_name) : null,
    component_percent: toFiniteNumber(first.component_percent),
    shrink_swell: weightedHorizonValue(componentRows, 'shrink_swell'),
    plasticity_index: weightedHorizonValue(componentRows, 'plasticity_index'),
    drainage_class: first.drainage_class ? String(first.drainage_class) : null,
  };
}

export function buildUsdaSoilQuery(lat: number, lon: number): string {
  return `
    SELECT
      mu.musym AS map_unit_symbol,
      mu.muname AS map_unit_name,
      c.cokey AS component_key,
      c.compname AS component_name,
      c.comppct_r AS component_percent,
      ch.hzdept_r AS horizon_top_cm,
      ch.hzdepb_r AS horizon_bottom_cm,
      ch.lep_r AS shrink_swell,
      ch.pi_r AS plasticity_index,
      c.drainagecl AS drainage_class
    FROM mapunit mu
    INNER JOIN component c ON c.mukey = mu.mukey
    INNER JOIN chorizon ch ON ch.cokey = c.cokey
    WHERE mu.mukey IN (
      SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('POINT(${lon} ${lat})')
    )
    AND c.majcompflag = 'Yes'
    AND ch.hzdept_r < ${SCREENING_DEPTH_CM}
    ORDER BY c.comppct_r DESC, ch.hzdept_r ASC
  `;
}

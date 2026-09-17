#!/usr/bin/env node

/**
 * Compare cached soil values with the current USDA 0-50 cm methodology.
 *
 * READ-ONLY by design. This script never writes to Supabase.
 * It is intended to quantify the impact of the corrected USDA methodology
 * before any historical/indexed soil_cache rows are migrated.
 *
 * Usage:
 *   node scripts/compare-soil-methodology.mjs
 *   node scripts/compare-soil-methodology.mjs --limit=50
 *   node scripts/compare-soil-methodology.mjs --slugs=cedar-park-tx,allen-tx-75002
 *   node scripts/compare-soil-methodology.mjs --threshold=2
 *
 * Required env (.env.local is loaded when present):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const USDA_URL = 'https://sdmdataaccess.nrcs.usda.gov/Tabular/post.rest';
const DEPTH_CM = 50;

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.startsWith('http')) supabaseUrl = `https://${supabaseUrl}`;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const arg = (name) => process.argv.find((item) => item.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const limit = Math.max(1, Number(arg('limit')) || 100);
const threshold = Math.max(0, Number(arg('threshold')) || 1);
const requestedSlugs = (arg('slugs') || '').split(',').map((v) => v.trim()).filter(Boolean);

const supabase = createClient(supabaseUrl.trim(), serviceKey.trim(), {
  auth: { persistSession: false, autoRefreshToken: false },
});

const asNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

function classifyPi(value) {
  const pi = asNumber(value);
  if (pi === null || pi < 0) return 'Not classified';
  if (pi > 35) return 'Severe';
  if (pi > 25) return 'High';
  if (pi > 15) return 'Moderate';
  return 'Lower';
}

function parseRows(table) {
  if (!Array.isArray(table) || table.length <= 1) return [];
  const headers = table[0];
  return table.slice(1).map((values) => Object.fromEntries(headers.map((key, i) => [key, values[i]])));
}

function weighted(rows, field) {
  let numerator = 0;
  let denominator = 0;
  for (const row of rows) {
    const value = asNumber(row[field]);
    const top = asNumber(row.horizon_top_cm);
    const bottom = asNumber(row.horizon_bottom_cm);
    if (value === null || top === null || bottom === null) continue;
    const thickness = Math.max(0, Math.min(bottom, DEPTH_CM) - Math.max(top, 0));
    if (thickness <= 0) continue;
    numerator += value * thickness;
    denominator += thickness;
  }
  return denominator > 0 ? numerator / denominator : null;
}

function selectDominant(rows) {
  const candidates = rows.filter((row) => asNumber(row.component_percent) !== null);
  if (!candidates.length) return null;
  const maxPct = Math.max(...candidates.map((row) => asNumber(row.component_percent)));
  const dominant = candidates.filter((row) => asNumber(row.component_percent) === maxPct);
  if (!dominant.length) return null;
  const componentName = dominant[0].component_name;
  const componentRows = dominant.filter((row) => row.component_name === componentName);
  return {
    map_unit_symbol: componentRows[0].map_unit_symbol ?? null,
    map_unit_name: componentRows[0].map_unit_name ?? null,
    component_name: componentName ?? null,
    component_percent: maxPct,
    drainage_class: componentRows[0].drainage_class ?? null,
    plasticity_index: weighted(componentRows, 'plasticity_index'),
    shrink_swell: weighted(componentRows, 'shrink_swell'),
    horizon_count: componentRows.length,
  };
}

async function fetchCurrentSoil(lat, lon) {
  const query = `
    SELECT mu.musym AS map_unit_symbol, mu.muname AS map_unit_name,
      c.compname AS component_name, c.comppct_r AS component_percent,
      ch.hzdept_r AS horizon_top_cm, ch.hzdepb_r AS horizon_bottom_cm,
      ch.lep_r AS shrink_swell, ch.pi_r AS plasticity_index,
      c.drainagecl AS drainage_class
    FROM mapunit mu
    INNER JOIN component c ON c.mukey = mu.mukey
    INNER JOIN chorizon ch ON ch.cokey = c.cokey
    WHERE mu.mukey IN (
      SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('POINT(${lon} ${lat})')
    )
    AND c.majcompflag = 'Yes'
    AND ch.hzdept_r < ${DEPTH_CM}
    AND ch.hzdepb_r > 0
    ORDER BY c.comppct_r DESC, c.compname, ch.hzdept_r ASC
  `;
  const response = await fetch(USDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, format: 'JSON+COLUMNNAME' }),
  });
  if (!response.ok) throw new Error(`USDA HTTP ${response.status}`);
  const data = await response.json();
  return selectDominant(parseRows(data.Table));
}

const delta = (oldValue, newValue) => {
  const oldN = asNumber(oldValue);
  const newN = asNumber(newValue);
  return oldN === null || newN === null ? null : newN - oldN;
};
const fmt = (value) => value === null || value === undefined ? 'null' : Number(value).toFixed(2);

async function loadLocations() {
  let query = supabase
    .from('target_locations')
    .select('id, slug, city, state, latitude, longitude, soil_cache(plasticity_index, shrink_swell_potential, risk_level, map_unit_name, component_name)')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .limit(limit);
  if (requestedSlugs.length) query = query.in('slug', requestedSlugs);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function main() {
  console.log('READ-ONLY USDA METHODOLOGY COMPARISON');
  console.log(`Limit: ${limit}; material PI delta threshold: ${threshold}`);
  if (requestedSlugs.length) console.log(`Slugs: ${requestedSlugs.join(', ')}`);

  const locations = await loadLocations();
  const results = [];

  for (const location of locations) {
    const cachedRaw = location.soil_cache;
    const cached = Array.isArray(cachedRaw) ? cachedRaw[0] : cachedRaw;
    if (!cached) {
      results.push({ slug: location.slug, status: 'NO_CACHE' });
      continue;
    }

    try {
      const current = await fetchCurrentSoil(Number(location.latitude), Number(location.longitude));
      if (!current) {
        results.push({ slug: location.slug, status: 'NO_USDA_RESULT' });
        continue;
      }
      const piDelta = delta(cached.plasticity_index, current.plasticity_index);
      const lepDelta = delta(cached.shrink_swell_potential, current.shrink_swell);
      const oldRisk = cached.risk_level || classifyPi(cached.plasticity_index);
      const newRisk = classifyPi(current.plasticity_index);
      const material = piDelta !== null && Math.abs(piDelta) >= threshold;
      const riskChanged = oldRisk !== newRisk;
      const componentChanged = (cached.component_name || null) !== (current.component_name || null);

      results.push({
        slug: location.slug,
        status: 'OK',
        oldPi: asNumber(cached.plasticity_index),
        newPi: current.plasticity_index,
        piDelta,
        oldLep: asNumber(cached.shrink_swell_potential),
        newLep: current.shrink_swell,
        lepDelta,
        oldRisk,
        newRisk,
        riskChanged,
        componentChanged,
        material,
        horizonCount: current.horizon_count,
      });
      console.log(`${location.slug}: PI ${fmt(cached.plasticity_index)} -> ${fmt(current.plasticity_index)} (${piDelta === null ? 'n/a' : `${piDelta >= 0 ? '+' : ''}${fmt(piDelta)}`}), risk ${oldRisk} -> ${newRisk}${riskChanged ? ' [RISK CHANGE]' : ''}${material ? ' [MATERIAL]' : ''}`);
    } catch (error) {
      console.warn(`${location.slug}: USDA comparison failed: ${error instanceof Error ? error.message : String(error)}`);
      results.push({ slug: location.slug, status: 'ERROR' });
    }
  }

  const comparable = results.filter((r) => r.status === 'OK');
  const material = comparable.filter((r) => r.material);
  const riskChanges = comparable.filter((r) => r.riskChanged);
  const componentChanges = comparable.filter((r) => r.componentChanged);
  const absPi = comparable.map((r) => r.piDelta).filter((v) => v !== null).map(Math.abs);

  console.log('\nSUMMARY');
  console.log(`Locations loaded: ${locations.length}`);
  console.log(`Comparable: ${comparable.length}`);
  console.log(`Material PI changes (>= ${threshold}): ${material.length}`);
  console.log(`Risk-class changes: ${riskChanges.length}`);
  console.log(`Dominant-component changes: ${componentChanges.length}`);
  console.log(`Mean absolute PI change: ${absPi.length ? (absPi.reduce((a, b) => a + b, 0) / absPi.length).toFixed(2) : 'n/a'}`);
  console.log(`Max absolute PI change: ${absPi.length ? Math.max(...absPi).toFixed(2) : 'n/a'}`);
  console.log('\nNo database writes were performed.');

  if (riskChanges.length) {
    console.log('\nRISK-CLASS CHANGES');
    for (const row of riskChanges) console.log(`${row.slug}: ${row.oldRisk} -> ${row.newRisk} (PI ${fmt(row.oldPi)} -> ${fmt(row.newPi)})`);
  }
}

main().catch((error) => {
  console.error('Comparison failed:', error);
  process.exit(1);
});

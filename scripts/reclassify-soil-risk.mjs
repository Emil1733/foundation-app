#!/usr/bin/env node

/**
 * Reclassify historical soil_cache.risk_level values from the PI already stored
 * in each row. This script DOES NOT fetch USDA data and DOES NOT change PI, LEP,
 * map units, components, or any other soil value.
 *
 * SAFE DEFAULT: dry-run. Nothing is written unless --apply is supplied.
 *
 * Classification must stay identical to lib/soilRisk.ts:
 *   PI > 35  -> Severe
 *   PI > 25  -> High
 *   PI > 15  -> Moderate
 *   PI >= 0  -> Lower
 *   missing/invalid/negative -> Not classified
 *
 * Usage:
 *   node scripts/reclassify-soil-risk.mjs
 *   node scripts/reclassify-soil-risk.mjs --slugs=cedar-park-tx,lewisville-tx
 *   node scripts/reclassify-soil-risk.mjs --apply
 *
 * Required env (.env.local is loaded when present):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const APPLY = process.argv.includes('--apply');
const arg = (name) => process.argv.find((item) => item.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const requestedSlugs = (arg('slugs') || '').split(',').map((value) => value.trim()).filter(Boolean);

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.startsWith('http')) supabaseUrl = `https://${supabaseUrl}`;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl.trim(), serviceKey.trim(), {
  auth: { persistSession: false, autoRefreshToken: false },
});

function classify(value) {
  if (value === null || value === undefined || value === '') return 'Not classified';
  const pi = Number(value);
  if (!Number.isFinite(pi) || pi < 0) return 'Not classified';
  if (pi > 35) return 'Severe';
  if (pi > 25) return 'High';
  if (pi > 15) return 'Moderate';
  return 'Lower';
}

async function loadRows() {
  const pageSize = 500;
  let offset = 0;
  const rows = [];

  while (true) {
    let query = supabase
      .from('soil_cache')
      .select('id, location_id, plasticity_index, risk_level, target_locations!inner(slug, city, state)')
      .order('id')
      .range(offset, offset + pageSize - 1);

    if (requestedSlugs.length) query = query.in('target_locations.slug', requestedSlugs);

    const { data, error } = await query;
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return rows;
}

async function main() {
  console.log(APPLY ? 'MODE: APPLY' : 'MODE: DRY RUN');
  console.log('Scope: risk_level only, derived from the existing stored plasticity_index.');
  if (requestedSlugs.length) console.log(`Slugs: ${requestedSlugs.join(', ')}`);

  const rows = await loadRows();
  const changes = [];
  const transitionCounts = new Map();

  for (const row of rows) {
    const expected = classify(row.plasticity_index);
    if (row.risk_level === expected) continue;
    const location = Array.isArray(row.target_locations) ? row.target_locations[0] : row.target_locations;
    const slug = location?.slug || row.location_id || row.id;
    const transition = `${row.risk_level ?? 'null'} -> ${expected}`;
    transitionCounts.set(transition, (transitionCounts.get(transition) || 0) + 1);
    changes.push({ id: row.id, slug, pi: row.plasticity_index, oldRisk: row.risk_level, newRisk: expected });
  }

  console.log(`Scanned: ${rows.length}`);
  console.log(`Would change: ${changes.length}`);
  console.log('\nTRANSITIONS');
  for (const [transition, count] of [...transitionCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`${transition}: ${count}`);
  }

  console.log('\nPROPOSED CHANGES');
  for (const row of changes) {
    console.log(`${row.slug}: PI ${row.pi ?? 'null'}, ${row.oldRisk ?? 'null'} -> ${row.newRisk}`);
  }

  if (!APPLY) {
    console.log('\nDry run complete. No database writes were performed.');
    console.log('Use --apply only after the dry-run totals and transitions are reviewed.');
    return;
  }

  let updated = 0;
  for (const row of changes) {
    const { data, error } = await supabase
      .from('soil_cache')
      .update({ risk_level: row.newRisk })
      .eq('id', row.id)
      .eq('risk_level', row.oldRisk)
      .select('id');

    if (error) throw error;
    if (!data?.length && row.oldRisk === null) {
      const { data: nullData, error: nullError } = await supabase
        .from('soil_cache')
        .update({ risk_level: row.newRisk })
        .eq('id', row.id)
        .is('risk_level', null)
        .select('id');
      if (nullError) throw nullError;
      if (!nullData?.length) throw new Error(`Concurrent change detected for ${row.slug}; aborting.`);
    } else if (!data?.length) {
      throw new Error(`Concurrent change detected for ${row.slug}; aborting.`);
    }
    updated += 1;
  }

  console.log(`\nUpdated: ${updated}`);
  console.log('Only soil_cache.risk_level was changed.');
}

main().catch((error) => {
  console.error('Soil risk reclassification failed:', error);
  process.exit(1);
});

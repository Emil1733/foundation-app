#!/usr/bin/env node

/**
 * Sanitize legacy target_locations.neighborhoods data.
 *
 * Historical versions of scripts/add-city.mjs attached randomized `risk` and
 * unsupported `note` claims to neighborhood names. Current ingestion no longer
 * does that. This script removes those legacy fields from existing rows and
 * preserves only sourced neighborhood names.
 *
 * SAFE DEFAULT: dry-run. Nothing is written unless --apply is supplied.
 *
 * Usage:
 *   node scripts/sanitize-neighborhoods.mjs
 *   node scripts/sanitize-neighborhoods.mjs --apply
 *
 * Required env (.env.local is loaded when present):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const APPLY = process.argv.includes('--apply');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function sanitizeNeighborhoods(value) {
  if (!Array.isArray(value)) return [];

  const names = value
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (entry && typeof entry === 'object' && typeof entry.name === 'string') return entry.name.trim();
      return '';
    })
    .filter(Boolean);

  return [...new Set(names)].map((name) => ({ name }));
}

function needsSanitization(original, sanitized) {
  if (!Array.isArray(original)) return false;
  return JSON.stringify(original) !== JSON.stringify(sanitized);
}

async function main() {
  const pageSize = 500;
  let offset = 0;
  let scanned = 0;
  let affected = 0;
  let updated = 0;

  console.log(APPLY ? 'MODE: APPLY' : 'MODE: DRY RUN');

  while (true) {
    const { data, error } = await supabase
      .from('target_locations')
      .select('id, slug, city, state, neighborhoods')
      .range(offset, offset + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;

    for (const row of data) {
      scanned += 1;
      const sanitized = sanitizeNeighborhoods(row.neighborhoods);
      if (!needsSanitization(row.neighborhoods, sanitized)) continue;

      affected += 1;
      console.log(`[${APPLY ? 'UPDATE' : 'WOULD UPDATE'}] ${row.slug || row.id}: ${JSON.stringify(row.neighborhoods)} -> ${JSON.stringify(sanitized)}`);

      if (APPLY) {
        const { error: updateError } = await supabase
          .from('target_locations')
          .update({ neighborhoods: sanitized })
          .eq('id', row.id);
        if (updateError) throw updateError;
        updated += 1;
      }
    }

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  console.log(`Scanned: ${scanned}`);
  console.log(`Affected: ${affected}`);
  console.log(`Updated: ${updated}`);
  if (!APPLY) console.log('Dry run complete. Re-run with --apply only after reviewing the proposed changes.');
}

main().catch((error) => {
  console.error('Neighborhood sanitization failed:', error);
  process.exit(1);
});

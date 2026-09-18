#!/usr/bin/env node

/**
 * Generate the one-shot admin SQL used for the frozen soil migration.
 * READ-ONLY: this script only writes a local .sql file.
 *
 * The generated SQL:
 * - embeds the exact 3,121-row frozen plan
 * - locks all target rows
 * - checks location_id and expected PI/LEP/risk before UPDATE
 * - aborts the statement on any mismatch
 * - updates only PI, LEP and risk
 * - asserts exactly 3,121 updated rows
 *
 * The SQL file is generated under the gitignored remediation directory and
 * must not be committed because it contains the full production change set.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const PLAN_SHA='d42075cc4be961cba849112dfb0e8081e7cbf64a9527ab6dec69d5bd406fa996';
const CHANGESET_SHA='bb592abac611c1a1cecde949b68cf99938a4328a95d809471d7cd22546e816d1';
const ROLLBACK_SHA='c634def54fd4dbdf9786f892d8a87472215606f8f725e0138aeee70d9660ab7e';
const EXPECTED_ROWS=3121;
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.split('=').slice(1).join('=');
const planPath=path.resolve(process.cwd(),arg('plan')||'soil-remediation-manifests/verified/migration-plan.json');
const outPath=path.resolve(process.cwd(),arg('out')||'soil-remediation-manifests/verified/apply-soil-remediation.sql');
const sha=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const lit=v=>v===null||v===undefined?'NULL':`'${String(v).replaceAll("'","''")}'`;
const nlit=v=>v===null||v===undefined?'NULL':String(Number(v));

function main(){
 if(!fs.existsSync(planPath))throw new Error(`Migration plan not found: ${planPath}`);
 const plan=JSON.parse(fs.readFileSync(planPath,'utf8'));
 const rows=[...plan.rows].sort((a,b)=>String(a.soil_cache_id).localeCompare(String(b.soil_cache_id)));
 if(plan.plan_sha256!==PLAN_SHA||sha(rows)!==PLAN_SHA)throw new Error('Migration-plan fingerprint mismatch.');
 if(plan.source_change_set_sha256!==CHANGESET_SHA||plan.source_rollback_sha256!==ROLLBACK_SHA)throw new Error('Migration-plan provenance mismatch.');
 if(rows.length!==EXPECTED_ROWS||plan.planned_rows!==EXPECTED_ROWS||plan.drift_rows!==0)throw new Error('Migration-plan count/drift guard failed.');

 const values=rows.map(r=>`(${lit(r.soil_cache_id)}::uuid,${lit(r.location_id)}::uuid,${nlit(r.expected.plasticity_index)}::numeric,${nlit(r.expected.shrink_swell_potential)}::numeric,${lit(r.expected.risk_level)}::text,${nlit(r.proposed.plasticity_index)}::numeric,${nlit(r.proposed.shrink_swell_potential)}::numeric,${lit(r.proposed.risk_level)}::text)`).join(',\n');

 const sql=`-- GENERATED FILE. DO NOT EDIT OR COMMIT.
-- Frozen plan: ${PLAN_SHA}
-- Source change set: ${CHANGESET_SHA}
-- Rollback: ${ROLLBACK_SHA}
-- Expected updates: ${EXPECTED_ROWS}

DO $migration$
DECLARE
  v_plan_count integer;
  v_match_count integer;
  v_updated integer;
BEGIN
  CREATE TEMP TABLE soil_migration_plan (
    soil_cache_id uuid PRIMARY KEY,
    location_id uuid NOT NULL,
    old_pi numeric,
    old_lep numeric,
    old_risk text,
    new_pi numeric,
    new_lep numeric,
    new_risk text
  ) ON COMMIT DROP;

  INSERT INTO soil_migration_plan VALUES
${values};

  SELECT count(*) INTO v_plan_count FROM soil_migration_plan;
  IF v_plan_count <> ${EXPECTED_ROWS} THEN
    RAISE EXCEPTION 'Plan row-count guard failed: expected ${EXPECTED_ROWS}, got %', v_plan_count;
  END IF;

  -- Lock every target row before validating. The statement cannot continue
  -- with a partial or concurrently changing target set.
  PERFORM s.id
  FROM public.soil_cache s
  JOIN soil_migration_plan p ON p.soil_cache_id=s.id
  ORDER BY s.id
  FOR UPDATE OF s;

  SELECT count(*) INTO v_match_count
  FROM public.soil_cache s
  JOIN soil_migration_plan p ON p.soil_cache_id=s.id
  WHERE s.location_id=p.location_id
    AND s.plasticity_index IS NOT DISTINCT FROM p.old_pi
    AND s.shrink_swell_potential IS NOT DISTINCT FROM p.old_lep
    AND s.risk_level IS NOT DISTINCT FROM p.old_risk;

  IF v_match_count <> ${EXPECTED_ROWS} THEN
    RAISE EXCEPTION 'Optimistic-concurrency guard failed: expected ${EXPECTED_ROWS} exact rows, got %', v_match_count;
  END IF;

  UPDATE public.soil_cache s
  SET plasticity_index=p.new_pi,
      shrink_swell_potential=p.new_lep,
      risk_level=p.new_risk
  FROM soil_migration_plan p
  WHERE s.id=p.soil_cache_id
    AND s.location_id=p.location_id
    AND s.plasticity_index IS NOT DISTINCT FROM p.old_pi
    AND s.shrink_swell_potential IS NOT DISTINCT FROM p.old_lep
    AND s.risk_level IS NOT DISTINCT FROM p.old_risk;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> ${EXPECTED_ROWS} THEN
    RAISE EXCEPTION 'Update-count guard failed: expected ${EXPECTED_ROWS}, got %', v_updated;
  END IF;
END
$migration$;
`;
 fs.mkdirSync(path.dirname(outPath),{recursive:true});
 fs.writeFileSync(outPath,sql,'utf8');
 console.log('ATOMIC ADMIN SQL PACKAGE GENERATED');
 console.log(`Rows: ${EXPECTED_ROWS}`);
 console.log(`Plan SHA-256: ${PLAN_SHA}`);
 console.log(`SQL: ${path.relative(process.cwd(),outPath)}`);
 console.log('No database writes were performed.');
}
try{main();}catch(e){console.error('SQL generation failed:',e.message||e);process.exit(1);}

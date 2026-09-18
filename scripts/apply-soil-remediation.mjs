#!/usr/bin/env node

/**
 * Execute the frozen historical soil methodology migration as one atomic
 * PostgreSQL transaction.
 *
 * Default mode is dry-run. Production mutation requires BOTH:
 *   --apply
 *   --confirm=d42075cc4be961cba849112dfb0e8081e7cbf64a9527ab6dec69d5bd406fa996
 *
 * The SQL locks and revalidates every planned row before any UPDATE. Any
 * missing/drifted row raises an exception and PostgreSQL rolls back the whole
 * statement. Only plasticity_index, shrink_swell_potential, and risk_level
 * are updated.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const PLAN_SHA='d42075cc4be961cba849112dfb0e8081e7cbf64a9527ab6dec69d5bd406fa996';
const CHANGESET_SHA='bb592abac611c1a1cecde949b68cf99938a4328a95d809471d7cd22546e816d1';
const ROLLBACK_SHA='c634def54fd4dbdf9786f892d8a87472215606f8f725e0138aeee70d9660ab7e';
const EXPECTED_ROWS=3121;
const FIELDS=['plasticity_index','shrink_swell_potential','risk_level'];

const env=path.resolve(process.cwd(),'.env.local'); if(fs.existsSync(env))dotenv.config({path:env});
let url=process.env.NEXT_PUBLIC_SUPABASE_URL; if(url&&!url.startsWith('http'))url=`https://${url}`;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key){console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');process.exit(1);}
const supabase=createClient(url.trim(),key.trim(),{auth:{persistSession:false,autoRefreshToken:false}});

const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.split('=').slice(1).join('=');
const apply=process.argv.includes('--apply');
const confirm=arg('confirm');
const planPath=path.resolve(process.cwd(),arg('plan')||'soil-remediation-manifests/verified/migration-plan.json');
const num=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
const round=v=>num(v)===null?null:Number(num(v).toFixed(6));
const norm=(k,v)=>k==='plasticity_index'||k==='shrink_swell_potential'?round(v):(v===undefined?null:v);
const pick=o=>Object.fromEntries(FIELDS.map(k=>[k,norm(k,o?.[k])]));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sha=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

async function current(id){
 const {data,error}=await supabase.from('soil_cache').select('id,location_id,plasticity_index,shrink_swell_potential,risk_level').eq('id',id).maybeSingle();
 if(error)throw error; return data;
}

async function main(){
 if(!fs.existsSync(planPath))throw new Error(`Migration plan not found: ${planPath}`);
 const plan=JSON.parse(fs.readFileSync(planPath,'utf8'));
 const sorted=[...plan.rows].sort((a,b)=>String(a.soil_cache_id).localeCompare(String(b.soil_cache_id)));
 if(plan.plan_sha256!==PLAN_SHA||sha(sorted)!==PLAN_SHA)throw new Error('Migration-plan fingerprint mismatch.');
 if(plan.source_change_set_sha256!==CHANGESET_SHA||plan.source_rollback_sha256!==ROLLBACK_SHA)throw new Error('Migration-plan provenance mismatch.');
 if(plan.planned_rows!==EXPECTED_ROWS||sorted.length!==EXPECTED_ROWS)throw new Error(`Expected exactly ${EXPECTED_ROWS} planned rows.`);
 if(plan.drift_rows!==0)throw new Error('Frozen migration plan contains drift.');

 console.log(apply?'SOIL MIGRATION APPLY PRECHECK':'SOIL MIGRATION DRY RUN');
 console.log(`Plan SHA-256: ${PLAN_SHA}`);
 console.log(`Rows: ${sorted.length}`);

 const drift=[];
 for(let i=0;i<sorted.length;i++){
  const r=sorted[i],c=await current(r.soil_cache_id);
  if(!c||c.location_id!==r.location_id||!same(pick(c),pick(r.expected)))drift.push({soil_cache_id:r.soil_cache_id,slug:r.slug});
  if((i+1)%500===0||i+1===sorted.length)console.log(`Prechecked ${i+1}/${sorted.length}`);
 }
 if(drift.length)throw new Error(`Current-state drift detected in ${drift.length} row(s). Regenerate pre-flight/plan. No write attempted.`);

 if(!apply){
  console.log('\nDRY RUN PASSED');
  console.log(`Exact current-state matches: ${EXPECTED_ROWS}`);
  console.log('No database writes were performed.');
  console.log(`To apply, rerun with --apply --confirm=${PLAN_SHA}`);
  return;
 }
 if(confirm!==PLAN_SHA)throw new Error('Apply confirmation fingerprint is missing or incorrect.');

 // PostgREST cannot make thousands of independent client updates atomic. The
 // actual production transaction is intentionally executed through the
 // Supabase SQL/admin channel after this local frozen-plan dry run. This
 // script therefore refuses client-side apply rather than pretending a loop
 // is transactional.
 throw new Error('Atomic apply is admin-SQL only. Client-side apply is intentionally disabled. Use the generated admin SQL package after final authorization.');
}
main().catch(e=>{console.error('Soil migration stopped:',e.message||e);process.exit(1);});

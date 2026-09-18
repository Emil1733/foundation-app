#!/usr/bin/env node

/**
 * Verify production after the frozen soil migration.
 * READ-ONLY. Checks every planned row and safely verifies excluded populations.
 *
 * NO_USDA_RESULT rows do not carry an expected-value snapshot in the reconciled
 * manifest. For those rows, post-write safety is verified structurally: their
 * soil_cache IDs must be disjoint from the frozen mutation plan. Rows that do
 * carry expected snapshots are also value-checked against production.
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const PLAN_SHA='d42075cc4be961cba849112dfb0e8081e7cbf64a9527ab6dec69d5bd406fa996';
const EXPECTED_ROWS=3121;
const env=path.resolve(process.cwd(),'.env.local');if(fs.existsSync(env))dotenv.config({path:env});
let url=process.env.NEXT_PUBLIC_SUPABASE_URL;if(url&&!url.startsWith('http'))url=`https://${url}`;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key){console.error('Missing Supabase environment variables.');process.exit(1);}
const supabase=createClient(url.trim(),key.trim(),{auth:{persistSession:false,autoRefreshToken:false}});
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.split('=').slice(1).join('=');
const planPath=path.resolve(process.cwd(),arg('plan')||'soil-remediation-manifests/verified/migration-plan.json');
const manifestPath=path.resolve(process.cwd(),arg('manifest')||'soil-remediation-manifests/reconciled.json');
const num=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
const round=v=>num(v)===null?null:Number(num(v).toFixed(6));
const pick=o=>({plasticity_index:round(o?.plasticity_index),shrink_swell_potential:round(o?.shrink_swell_potential),risk_level:o?.risk_level??null});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
async function row(id){const {data,error}=await supabase.from('soil_cache').select('id,location_id,plasticity_index,shrink_swell_potential,risk_level').eq('id',id).maybeSingle();if(error)throw error;return data;}

async function main(){
 const plan=JSON.parse(fs.readFileSync(planPath,'utf8')),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 if(plan.plan_sha256!==PLAN_SHA||plan.rows.length!==EXPECTED_ROWS)throw new Error('Frozen migration plan guard failed.');
 const planIds=new Set(plan.rows.map(r=>r.soil_cache_id));
 let proposedMatches=0,oldMatches=0,other=0;
 for(let i=0;i<plan.rows.length;i++){
  const p=plan.rows[i],c=await row(p.soil_cache_id);
  if(c&&c.location_id===p.location_id&&same(pick(c),pick(p.proposed)))proposedMatches++;
  else if(c&&c.location_id===p.location_id&&same(pick(c),pick(p.expected)))oldMatches++;
  else other++;
  if((i+1)%500===0||i+1===plan.rows.length)console.log(`Verified planned ${i+1}/${plan.rows.length}`);
 }
 const excluded=manifest.rows.filter(r=>['NO_USDA_RESULT','REVIEW_NULL_ATTRIBUTE'].includes(r.status)&&r.soil_cache_id);
 let excludedPlanOverlap=0,excludedWithSnapshot=0,excludedSnapshotChanged=0,excludedWithoutSnapshot=0;
 for(const r of excluded){
  if(planIds.has(r.soil_cache_id))excludedPlanOverlap++;
  if(r.expected&&typeof r.expected==='object'){
   excludedWithSnapshot++;
   const c=await row(r.soil_cache_id);
   if(!c||c.location_id!==r.location_id||!same(pick(c),pick(r.expected)))excludedSnapshotChanged++;
  }else excludedWithoutSnapshot++;
 }

 console.log('\nPOST-MIGRATION VERIFICATION');
 console.log(`Planned rows at proposed values: ${proposedMatches}`);
 console.log(`Planned rows still at old values: ${oldMatches}`);
 console.log(`Planned rows in unexpected state: ${other}`);
 console.log(`Excluded cached rows: ${excluded.length}`);
 console.log(`Excluded rows overlapping mutation plan: ${excludedPlanOverlap}`);
 console.log(`Excluded rows with expected-value snapshot: ${excludedWithSnapshot}`);
 console.log(`Snapshot-backed excluded rows changed: ${excludedSnapshotChanged}`);
 console.log(`Excluded rows without pre-write snapshot: ${excludedWithoutSnapshot}`);
 console.log(`Plan SHA-256: ${PLAN_SHA}`);
 if(proposedMatches===EXPECTED_ROWS&&oldMatches===0&&other===0&&excludedPlanOverlap===0&&excludedSnapshotChanged===0)console.log('VERIFICATION PASSED.');
 else{console.log('VERIFICATION FAILED. Review before any further action.');process.exitCode=2;}
}
main().catch(e=>{console.error('Verification failed:',e.message||e);process.exit(1);});

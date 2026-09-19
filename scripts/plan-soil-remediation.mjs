#!/usr/bin/env node

/**
 * Build the exact historical soil migration plan from the reconciled manifest.
 * READ-ONLY. No database writes and intentionally no --apply mode.
 *
 * Only methodology-derived numeric/classification fields are mutation candidates:
 * plasticity_index, shrink_swell_potential, risk_level.
 * Descriptive USDA fields remain audit evidence and are not rewritten by this migration.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const CHANGESET='bb592abac611c1a1cecde949b68cf99938a4328a95d809471d7cd22546e816d1';
const ROLLBACK='c634def54fd4dbdf9786f892d8a87472215606f8f725e0138aeee70d9660ab7e';
const MUTATION_FIELDS=['plasticity_index','shrink_swell_potential','risk_level'];
const TRACKED_FIELDS=['plasticity_index','shrink_swell_potential','risk_level','map_unit_symbol','map_unit_name','component_name','drainage_class'];

const env=path.resolve(process.cwd(),'.env.local'); if(fs.existsSync(env))dotenv.config({path:env});
let url=process.env.NEXT_PUBLIC_SUPABASE_URL; if(url&&!url.startsWith('http'))url=`https://${url}`;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key){console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');process.exit(1);}
const supabase=createClient(url.trim(),key.trim(),{auth:{persistSession:false,autoRefreshToken:false}});

const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.split('=').slice(1).join('=');
const manifestPath=path.resolve(process.cwd(),arg('manifest')||'soil-remediation-manifests/reconciled.json');
const rollbackPath=path.resolve(process.cwd(),arg('rollback')||'soil-remediation-manifests/verified/rollback.json');
const reportPath=path.resolve(process.cwd(),arg('report')||'soil-remediation-manifests/verified/preflight-report.json');
const outPath=path.resolve(process.cwd(),arg('out')||'soil-remediation-manifests/verified/migration-plan.json');

const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const num=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
const round=v=>num(v)===null?null:Number(num(v).toFixed(6));
const norm=(field,v)=>field==='plasticity_index'||field==='shrink_swell_potential'?round(v):(v===undefined?null:v);
const pick=(obj,fields)=>Object.fromEntries(fields.map(k=>[k,norm(k,obj?.[k])]));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const canonical=r=>({soil_cache_id:r.soil_cache_id,location_id:r.location_id,slug:r.slug,expected:r.expected,proposed:r.proposed});
const changeHash=rs=>sha(rs.map(canonical).sort((a,b)=>String(a.soil_cache_id).localeCompare(String(b.soil_cache_id))));

async function fetchCurrent(id){
 const {data,error}=await supabase.from('soil_cache').select('id,location_id,plasticity_index,shrink_swell_potential,risk_level,map_unit_symbol,map_unit_name,component_name,drainage_class').eq('id',id).maybeSingle();
 if(error)throw error; return data;
}

async function main(){
 for(const p of [manifestPath,rollbackPath,reportPath])if(!fs.existsSync(p))throw new Error(`Required file missing: ${p}`);
 const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 const rollback=JSON.parse(fs.readFileSync(rollbackPath,'utf8'));
 const report=JSON.parse(fs.readFileSync(reportPath,'utf8'));

 const eligible=manifest.rows.filter(r=>r.status==='ELIGIBLE');
 const changed=eligible.filter(r=>!same(r.expected,r.proposed));
 const computed=changeHash(changed);
 if(computed!==CHANGESET||manifest.summary?.fingerprint_sha256!==CHANGESET)throw new Error('Reconciled change-set fingerprint mismatch.');
 if(report.change_set_fingerprint_sha256!==CHANGESET||report.blocker_count!==0||report.verified_rows!==3121)throw new Error('Pre-flight report is not the approved zero-blocker 3,121-row report.');
 if(rollback.change_set_fingerprint_sha256!==CHANGESET||rollback.rollback_fingerprint_sha256!==ROLLBACK||report.rollback_fingerprint_sha256!==ROLLBACK)throw new Error('Rollback package fingerprint mismatch.');
 if(sha([...rollback.rows].sort((a,b)=>String(a.soil_cache_id).localeCompare(String(b.soil_cache_id))))!==ROLLBACK)throw new Error('Rollback file contents do not match approved rollback fingerprint.');

 const plan=[],descriptiveOnly=[],drift=[];
 for(let i=0;i<changed.length;i++){
  const r=changed[i];
  const current=await fetchCurrent(r.soil_cache_id);
  const currentTracked=current?pick(current,TRACKED_FIELDS):null;
  const expectedTracked=pick(r.expected,TRACKED_FIELDS);
  if(!current||current.location_id!==r.location_id||!same(currentTracked,expectedTracked)){
   drift.push({soil_cache_id:r.soil_cache_id,slug:r.slug,expected:expectedTracked,current:currentTracked,current_location_id:current?.location_id??null});
   continue;
  }
  const expected=pick(r.expected,MUTATION_FIELDS),proposed=pick(r.proposed,MUTATION_FIELDS);
  if(same(expected,proposed))descriptiveOnly.push({soil_cache_id:r.soil_cache_id,location_id:r.location_id,slug:r.slug});
  else plan.push({soil_cache_id:r.soil_cache_id,location_id:r.location_id,slug:r.slug,expected,proposed});
  if((i+1)%250===0||i+1===changed.length)console.log(`Planned ${i+1}/${changed.length}`);
 }
 const sorted=[...plan].sort((a,b)=>String(a.soil_cache_id).localeCompare(String(b.soil_cache_id)));
 const planFingerprint=sha(sorted);
 const output={schema_version:1,generated_at:new Date().toISOString(),source_change_set_sha256:CHANGESET,source_rollback_sha256:ROLLBACK,mutation_fields:MUTATION_FIELDS,planned_rows:sorted.length,descriptive_only_changed_rows:descriptiveOnly.length,drift_rows:drift.length,plan_sha256:planFingerprint,rows:sorted,descriptive_only:descriptiveOnly,drift};
 fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,JSON.stringify(output,null,2)+'\n','utf8');

 console.log('\nMIGRATION PLAN SUMMARY');
 console.log(`Manifest changed rows: ${changed.length}`);
 console.log(`Rows requiring PI/LEP/risk mutation: ${sorted.length}`);
 console.log(`Rows changed only in descriptive USDA fields: ${descriptiveOnly.length}`);
 console.log(`Current-state drift rows: ${drift.length}`);
 console.log(`Source change-set SHA-256: ${CHANGESET}`);
 console.log(`Source rollback SHA-256: ${ROLLBACK}`);
 console.log(`Migration-plan SHA-256: ${planFingerprint}`);
 console.log(`Plan: ${path.relative(process.cwd(),outPath)}`);
 console.log('\nNo database writes were performed.');
 console.log('There is intentionally no --apply mode in this script.');
 if(drift.length){console.log('PLAN BLOCKED: production state drifted after pre-flight.');process.exitCode=2;}
}
main().catch(e=>{console.error('Migration planning failed:',e);process.exit(1);});

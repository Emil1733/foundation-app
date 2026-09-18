#!/usr/bin/env node

/**
 * Verify a reconciled soil-remediation manifest against current production
 * state and export an immutable rollback package. READ-ONLY.
 *
 * This script intentionally has no --apply mode.
 *
 * Usage:
 *   node scripts/verify-soil-remediation.mjs
 *   node scripts/verify-soil-remediation.mjs --manifest=soil-remediation-manifests/reconciled.json
 *   node scripts/verify-soil-remediation.mjs --fingerprint=bb592ab...
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const EXPECTED_RECONCILED_FINGERPRINT='bb592abac611c1a1cecde949b68cf99938a4328a95d809471d7cd22546e816d1';
const envPath=path.resolve(process.cwd(),'.env.local');
if(fs.existsSync(envPath))dotenv.config({path:envPath});

let url=process.env.NEXT_PUBLIC_SUPABASE_URL;
if(url&&!url.startsWith('http'))url=`https://${url}`;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key){console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');process.exit(1);}
const supabase=createClient(url.trim(),key.trim(),{auth:{persistSession:false,autoRefreshToken:false}});

const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.split('=').slice(1).join('=');
const manifestPath=path.resolve(process.cwd(),arg('manifest')||'soil-remediation-manifests/reconciled.json');
const requiredFingerprint=arg('fingerprint')||EXPECTED_RECONCILED_FINGERPRINT;
const outDir=path.resolve(process.cwd(),arg('out-dir')||'soil-remediation-manifests/verified');

const num=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
const round=v=>num(v)===null?null:Number(num(v).toFixed(6));
const normalize=v=>v===undefined?null:v;
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const canonical=r=>({soil_cache_id:r.soil_cache_id,location_id:r.location_id,slug:r.slug,expected:r.expected,proposed:r.proposed});
const changeHash=rs=>sha(rs.map(canonical).sort((a,b)=>String(a.soil_cache_id).localeCompare(String(b.soil_cache_id))));

function comparableCurrent(row){
 return{
  plasticity_index:round(row.plasticity_index),
  shrink_swell_potential:round(row.shrink_swell_potential),
  risk_level:normalize(row.risk_level),
  map_unit_symbol:normalize(row.map_unit_symbol),
  map_unit_name:normalize(row.map_unit_name),
  component_name:normalize(row.component_name),
  drainage_class:normalize(row.drainage_class)
 };
}
function equal(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function csvCell(v){const s=v===null||v===undefined?'':String(v);return /[",\n\r]/.test(s)?`"${s.replaceAll('"','""')}"`:s;}
function toCsv(rows){
 const h=['soil_cache_id','location_id','slug','plasticity_index','shrink_swell_potential','risk_level','map_unit_symbol','map_unit_name','component_name','drainage_class'];
 return [h.join(','),...rows.map(r=>h.map(k=>csvCell(r[k])).join(','))].join('\n')+'\n';
}
async function fetchSoil(id){
 const {data,error}=await supabase.from('soil_cache')
  .select('id,location_id,plasticity_index,shrink_swell_potential,risk_level,map_unit_symbol,map_unit_name,component_name,drainage_class')
  .eq('id',id).maybeSingle();
 if(error)throw error;
 return data;
}

async function main(){
 if(!fs.existsSync(manifestPath))throw new Error(`Manifest not found: ${manifestPath}`);
 const raw=fs.readFileSync(manifestPath,'utf8');
 const manifest=JSON.parse(raw);
 if(manifest.schema_version!==1||!Array.isArray(manifest.rows))throw new Error('Unsupported or invalid manifest.');

 const eligible=manifest.rows.filter(r=>r.status==='ELIGIBLE');
 const changed=eligible.filter(r=>!equal(r.expected,r.proposed));
 const computed=changeHash(changed);
 const declared=manifest.summary?.fingerprint_sha256;

 console.log('READ-ONLY SOIL MIGRATION PRE-FLIGHT');
 console.log(`Manifest: ${path.relative(process.cwd(),manifestPath)}`);
 console.log(`Changed rows in manifest: ${changed.length}`);
 console.log(`Declared fingerprint: ${declared}`);
 console.log(`Computed fingerprint: ${computed}`);
 console.log(`Required fingerprint: ${requiredFingerprint}`);

 if(declared!==computed)throw new Error('Manifest fingerprint does not match its own contents.');
 if(computed!==requiredFingerprint)throw new Error('Manifest fingerprint does not match the required approved reconciliation fingerprint.');
 if(manifest.rows.some(r=>r.status==='ERROR'))throw new Error('Manifest still contains ERROR rows.');
 if(changed.length!==3121)throw new Error(`Expected 3121 changed rows, found ${changed.length}.`);

 const rollback=[],drift=[],missing=[],duplicates=new Set(),seen=new Set();
 for(let i=0;i<changed.length;i++){
  const r=changed[i];
  if(seen.has(r.soil_cache_id)){duplicates.add(r.soil_cache_id);continue;}
  seen.add(r.soil_cache_id);
  const current=await fetchSoil(r.soil_cache_id);
  if(!current){missing.push({soil_cache_id:r.soil_cache_id,slug:r.slug});continue;}
  const currentComparable=comparableCurrent(current);
  if(current.location_id!==r.location_id||!equal(currentComparable,r.expected)){
   drift.push({soil_cache_id:r.soil_cache_id,slug:r.slug,manifest_location_id:r.location_id,current_location_id:current.location_id,expected:r.expected,current:currentComparable});
   continue;
  }
  rollback.push({soil_cache_id:current.id,location_id:current.location_id,slug:r.slug,...currentComparable});
  if((i+1)%250===0||i+1===changed.length)console.log(`Verified ${i+1}/${changed.length}`);
 }

 const blockers={duplicate_soil_cache_ids:[...duplicates].sort(),missing_rows:missing,current_state_drift:drift};
 const blockerCount=duplicates.size+missing.length+drift.length;
 const rollbackCanonical=[...rollback].sort((a,b)=>String(a.soil_cache_id).localeCompare(String(b.soil_cache_id)));
 const rollbackFingerprint=sha(rollbackCanonical);
 const report={
  schema_version:1,
  generated_at:new Date().toISOString(),
  source_manifest:path.relative(process.cwd(),manifestPath),
  source_manifest_file_sha256:sha(raw),
  change_set_fingerprint_sha256:computed,
  changed_rows:changed.length,
  verified_rows:rollback.length,
  blocker_count:blockerCount,
  rollback_fingerprint_sha256:rollbackFingerprint,
  blockers
 };

 fs.mkdirSync(outDir,{recursive:true});
 fs.writeFileSync(path.join(outDir,'preflight-report.json'),JSON.stringify(report,null,2)+'\n','utf8');
 fs.writeFileSync(path.join(outDir,'rollback.json'),JSON.stringify({schema_version:1,change_set_fingerprint_sha256:computed,rollback_fingerprint_sha256:rollbackFingerprint,rows:rollbackCanonical},null,2)+'\n','utf8');
 fs.writeFileSync(path.join(outDir,'rollback.csv'),toCsv(rollbackCanonical),'utf8');

 console.log('\nPRE-FLIGHT SUMMARY');
 console.log(`Changed rows: ${changed.length}`);
 console.log(`Verified exact current-state matches: ${rollback.length}`);
 console.log(`Duplicate soil-cache IDs: ${duplicates.size}`);
 console.log(`Missing soil-cache rows: ${missing.length}`);
 console.log(`Current-state drift rows: ${drift.length}`);
 console.log(`Blockers: ${blockerCount}`);
 console.log(`Change-set SHA-256: ${computed}`);
 console.log(`Rollback SHA-256: ${rollbackFingerprint}`);
 console.log(`Report directory: ${path.relative(process.cwd(),outDir)}`);
 console.log('\nNo database writes were performed.');
 if(blockerCount) {
  console.log('PRE-FLIGHT FAILED. Resolve blockers and regenerate/reconcile before any migration.');
  process.exitCode=2;
 } else {
  console.log('PRE-FLIGHT PASSED. This verifies current state only and does not authorize a production write.');
 }
}
main().catch(e=>{console.error('Pre-flight verification failed:',e);process.exit(1);});

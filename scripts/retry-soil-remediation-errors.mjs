#!/usr/bin/env node

/**
 * Retry only ERROR rows from a read-only soil remediation manifest.
 *
 * SAFETY:
 * - Reads the prior local manifest, Supabase, and USDA.
 * - Never writes to Supabase.
 * - Preserves every non-ERROR row from the prior manifest.
 * - Re-fetches current DB values for failed rows before retrying USDA.
 * - Writes a new reconciled manifest and recalculates the change-set fingerprint.
 *
 * Usage:
 *   node scripts/retry-soil-remediation-errors.mjs
 *   node scripts/retry-soil-remediation-errors.mjs --in=soil-remediation-manifests/latest.json
 *   node scripts/retry-soil-remediation-errors.mjs --out=soil-remediation-manifests/reconciled.json
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const USDA_URL='https://sdmdataaccess.nrcs.usda.gov/Tabular/post.rest';
const DEPTH_CM=50, TIMEOUT_MS=45000, MAX_ATTEMPTS=5;
const envPath=path.resolve(process.cwd(),'.env.local');
if(fs.existsSync(envPath))dotenv.config({path:envPath});
let url=process.env.NEXT_PUBLIC_SUPABASE_URL;
if(url&&!url.startsWith('http'))url=`https://${url}`;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key){console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');process.exit(1);}
const supabase=createClient(url.trim(),key.trim(),{auth:{persistSession:false,autoRefreshToken:false}});

const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.split('=').slice(1).join('=');
const inPath=path.resolve(process.cwd(),arg('in')||'soil-remediation-manifests/latest.json');
const outPath=path.resolve(process.cwd(),arg('out')||'soil-remediation-manifests/reconciled.json');
const num=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
const txt=v=>v===null||v===undefined||v===''?null:String(v);
const round=v=>num(v)===null?null:Number(num(v).toFixed(6));
const risk=v=>{const n=num(v);if(n===null||n<0)return'Not classified';if(n>35)return'Severe';if(n>25)return'High';if(n>15)return'Moderate';return'Lower';};

function rows(table){if(!Array.isArray(table)||table.length<=1)return[];const h=table[0].map(String);return table.slice(1).map(v=>Object.fromEntries(h.map((k,i)=>[k,v[i]])));}
function weighted(rs,field){let total=0,depth=0;for(const r of rs){const v=num(r[field]),top=num(r.horizon_top_cm),bottom=num(r.horizon_bottom_cm);if(v===null||top===null||bottom===null)continue;const d=Math.max(0,Math.min(bottom,DEPTH_CM)-Math.max(top,0));if(!d)continue;total+=v*d;depth+=d;}return depth?total/depth:null;}
function aggregate(rs){const candidates=rs.filter(r=>num(r.component_percent)!==null&&r.component_key);if(!candidates.length)return null;const max=Math.max(...candidates.map(r=>num(r.component_percent)));const dominant=candidates.find(r=>num(r.component_percent)===max);const cr=rs.filter(r=>r.component_key===dominant?.component_key);if(!dominant||!cr.length)return null;return{map_unit_symbol:txt(cr[0].map_unit_symbol),map_unit_name:txt(cr[0].map_unit_name),component_key:String(dominant.component_key),component_name:txt(dominant.component_name),component_percent:max,drainage_class:txt(cr[0].drainage_class),plasticity_index:weighted(cr,'plasticity_index'),shrink_swell_potential:weighted(cr,'shrink_swell'),horizon_count:cr.length};}
function query(lat,lon){return `
 SELECT mu.musym AS map_unit_symbol,mu.muname AS map_unit_name,c.cokey AS component_key,
 c.compname AS component_name,c.comppct_r AS component_percent,ch.hzdept_r AS horizon_top_cm,
 ch.hzdepb_r AS horizon_bottom_cm,ch.lep_r AS shrink_swell,ch.pi_r AS plasticity_index,c.drainagecl AS drainage_class
 FROM mapunit mu INNER JOIN component c ON c.mukey=mu.mukey INNER JOIN chorizon ch ON ch.cokey=c.cokey
 WHERE mu.mukey IN (SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('POINT(${lon} ${lat})'))
 AND c.majcompflag='Yes' AND ch.hzdept_r<${DEPTH_CM} AND ch.hzdepb_r>0
 ORDER BY c.comppct_r DESC,c.cokey,ch.hzdept_r ASC`;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function fresh(lat,lon){let last;for(let a=1;a<=MAX_ATTEMPTS;a++){try{const res=await fetch(USDA_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:query(lat,lon),format:'JSON+COLUMNNAME'}),signal:AbortSignal.timeout(TIMEOUT_MS)});if(!res.ok)throw new Error(`USDA HTTP ${res.status}`);return aggregate(rows((await res.json()).Table));}catch(e){last=e;if(a<MAX_ATTEMPTS)await sleep(1500*(2**(a-1)));}}throw last;}
const cache=l=>Array.isArray(l.soil_cache)?l.soil_cache[0]:l.soil_cache;
const canon=r=>({soil_cache_id:r.soil_cache_id,location_id:r.location_id,slug:r.slug,expected:r.expected,proposed:r.proposed});
const hash=rs=>crypto.createHash('sha256').update(JSON.stringify(rs.map(canon).sort((a,b)=>String(a.soil_cache_id).localeCompare(String(b.soil_cache_id))))).digest('hex');
const errorType=e=>{const s=String(e||'Unknown error');if(/timeout|aborted/i.test(s))return'TIMEOUT';if(/USDA HTTP \d+/i.test(s))return s.match(/USDA HTTP \d+/i)[0].replace(' ','_').toUpperCase();if(/json/i.test(s))return'JSON_PARSE';return'OTHER';};

async function location(id){
 const {data,error}=await supabase.from('target_locations').select('id,slug,latitude,longitude,soil_cache(id,plasticity_index,shrink_swell_potential,risk_level,map_unit_symbol,map_unit_name,component_name,drainage_class)').eq('id',id).maybeSingle();
 if(error)throw error;return data;
}
function makeRow(l,c,n){
 const oldPi=num(c.plasticity_index),newPi=num(n.plasticity_index),oldLep=num(c.shrink_swell_potential),newLep=num(n.shrink_swell_potential);
 const base={slug:l.slug,location_id:l.id,soil_cache_id:c.id,
 expected:{plasticity_index:round(oldPi),shrink_swell_potential:round(oldLep),risk_level:c.risk_level??null,map_unit_symbol:c.map_unit_symbol??null,map_unit_name:c.map_unit_name??null,component_name:c.component_name??null,drainage_class:c.drainage_class??null},
 proposed:{plasticity_index:round(newPi),shrink_swell_potential:round(newLep),risk_level:risk(newPi),map_unit_symbol:n.map_unit_symbol,map_unit_name:n.map_unit_name,component_name:n.component_name,drainage_class:n.drainage_class},
 audit:{old_derived_risk:risk(oldPi),risk_changed:risk(oldPi)!==risk(newPi),pi_delta:oldPi===null||newPi===null?null:round(newPi-oldPi),lep_delta:oldLep===null||newLep===null?null:round(newLep-oldLep),component_name_changed:(c.component_name??null)!==n.component_name,component_key:n.component_key,component_percent:n.component_percent,horizon_count:n.horizon_count}};
 return{...base,status:newPi===null||newLep===null?'REVIEW_NULL_ATTRIBUTE':'ELIGIBLE'};
}

async function main(){
 if(!fs.existsSync(inPath))throw new Error(`Input manifest not found: ${inPath}`);
 const prior=JSON.parse(fs.readFileSync(inPath,'utf8'));
 if(prior.schema_version!==1||!Array.isArray(prior.rows))throw new Error('Unsupported or invalid input manifest.');
 const failures=prior.rows.filter(r=>r.status==='ERROR');
 console.log('READ-ONLY ERROR RETRY AND RECONCILIATION');
 console.log(`Input rows: ${prior.rows.length}; ERROR rows to retry: ${failures.length}`);
 const replacements=new Map(), beforeTypes={};
 for(const r of failures){const t=errorType(r.error);beforeTypes[t]=(beforeTypes[t]||0)+1;}
 for(let i=0;i<failures.length;i++){
  const old=failures[i];
  try{
   const l=await location(old.location_id);
   if(!l){replacements.set(old.location_id,{...old,status:'ERROR',error:'Target location no longer exists',retry_error_type:'MISSING_LOCATION'});continue;}
   const c=cache(l);
   if(!c){replacements.set(old.location_id,{slug:l.slug,location_id:l.id,status:'NO_CACHE'});continue;}
   const n=await fresh(Number(l.latitude),Number(l.longitude));
   replacements.set(old.location_id,n?makeRow(l,c,n):{slug:l.slug,location_id:l.id,soil_cache_id:c.id,status:'NO_USDA_RESULT'});
  }catch(e){const msg=e instanceof Error?e.message:String(e);replacements.set(old.location_id,{...old,error:msg,retry_error_type:errorType(msg)});}
  if((i+1)%25===0||i+1===failures.length)console.log(`Retried ${i+1}/${failures.length}`);
 }
 const merged=prior.rows.map(r=>r.status==='ERROR'?(replacements.get(r.location_id)||r):r).sort((a,b)=>String(a.slug).localeCompare(String(b.slug)));
 const eligible=merged.filter(r=>r.status==='ELIGIBLE');
 const changed=eligible.filter(r=>JSON.stringify(r.expected)!==JSON.stringify(r.proposed));
 const statuses=merged.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{});
 const remaining=merged.filter(r=>r.status==='ERROR');
 const afterTypes=remaining.reduce((a,r)=>{const t=errorType(r.error);a[t]=(a[t]||0)+1;return a;},{});
 const manifest={...prior,generated_at:new Date().toISOString(),reconciliation:{source_manifest:path.relative(process.cwd(),inPath),prior_fingerprint_sha256:prior.summary?.fingerprint_sha256??null,error_rows_retried:failures.length,error_types_before:beforeTypes,error_types_remaining:afterTypes},summary:{statuses,eligible:eligible.length,eligible_changed:changed.length,eligible_risk_changes:eligible.filter(r=>r.audit?.risk_changed).length,fingerprint_sha256:hash(changed)},rows:merged};
 fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,JSON.stringify(manifest,null,2)+'\n','utf8');
 console.log('\nRECONCILED SUMMARY');for(const k of Object.keys(statuses).sort())console.log(`${k}: ${statuses[k]}`);
 console.log(`Errors retried: ${failures.length}`);console.log(`Errors remaining: ${remaining.length}`);
 console.log(`Eligible changed rows: ${changed.length}`);console.log(`Eligible risk-class changes: ${manifest.summary.eligible_risk_changes}`);
 console.log(`Change-set SHA-256: ${manifest.summary.fingerprint_sha256}`);
 console.log(`Output manifest: ${path.relative(process.cwd(),outPath)}`);
 if(Object.keys(afterTypes).length){console.log('\nREMAINING ERROR TYPES');for(const [k,v] of Object.entries(afterTypes).sort())console.log(`${k}: ${v}`);}
 console.log('\nNo database writes were performed.');console.log('There is intentionally no --apply mode in this script.');
}
main().catch(e=>{console.error('Retry/reconciliation failed:',e);process.exit(1);});

/* eslint-disable @typescript-eslint/no-require-imports -- Disposable Postgres integration test. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { Pool } = require('pg');
const connectionString = process.env.LEAD_TEST_DATABASE_URL;
if (!connectionString) { console.log('Disposable Postgres test runs in CI; no test database configured locally.'); process.exit(0); }
const target = new URL(connectionString);
assert.ok(['127.0.0.1','localhost'].includes(target.hostname) && target.pathname === '/lead_integrity_test', 'Refusing to initialize a non-disposable database');
const pool = new Pool({ connectionString, max: 40 });
const hash = value => createHash('sha256').update(value).digest('hex');
const payload = { name: 'Synthetic QA', email: 'qa@example.invalid', phone: '+15125550100', address: '123 Synthetic Street', zip: '78613', symptoms: ['doors'], notes: '', source: 'hero_form', contact_consent: true, contact_consent_version: 'qa', contact_consent_text: 'Synthetic QA only' };
async function call(key, contact, ip, lead = payload) {
  const client = await pool.connect();
  try {
    await client.query('set role service_role');
    const { rows } = await client.query('select public.record_human_lead($1,$2,$3,$4::jsonb) as result', [hash(key),hash(contact),ip === null ? null : hash(ip),JSON.stringify(lead)]);
    return rows[0].result;
  } finally { await client.query('reset role'); client.release(); }
}
const count = async table => Number((await pool.query(`select count(*) as n from public.${table}`)).rows[0].n);
async function run() {
  await pool.query(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create table public.leads(id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
      name text,email text,phone text,address text,zip text,symptoms jsonb,notes text,status text,source text,attribution jsonb,
      contact_consent boolean,contact_consent_at timestamptz,contact_consent_version text,contact_consent_text text,
      consent_source_path text,submission_user_agent text,submission_ip inet,
      check(contact_consent is distinct from true or (contact_consent_at is not null and nullif(btrim(contact_consent_version),'') is not null and nullif(btrim(contact_consent_text),'') is not null)));
    alter table public.leads enable row level security;
    grant select,insert,delete on public.leads to service_role;
    grant insert on public.leads to anon,authenticated;
    create policy "Allow public inserts" on public.leads for insert to public with check(true);
  `);
  await pool.query(fs.readFileSync(path.join(__dirname,'../supabase/migrations/20261021035032_add_human_lead_integrity.sql'),'utf8'));
  const duplicates = await Promise.all(Array.from({length:12}, () => call('same','same-contact','same-ip')));
  assert.equal(duplicates.filter(r => r === 'created').length, 1);
  assert.equal(duplicates.filter(r => r === 'duplicate').length, 11);
  assert.equal(await count('leads'), 1);
  const quota = await Promise.all(Array.from({length:8}, (_,i) => call(`contact-${i}`,'quota-contact','quota-ip')));
  assert.equal(quota.filter(r => r === 'created').length, 5);
  assert.equal(quota.filter(r => r === 'rate_limited').length, 3);
  const acceptedIndex = quota.findIndex(r => r === 'created');
  assert.equal(await call(`contact-${acceptedIndex}`,'quota-contact','quota-ip'), 'duplicate', 'Retry succeeds even when quota is full');
  const ipQuota = await Promise.all(Array.from({length:35}, (_,i) => call(`ip-${i}`,`ip-contact-${i}`,'shared-ip')));
  assert.equal(ipQuota.filter(r => r === 'created').length, 30);
  assert.equal(ipQuota.filter(r => r === 'rate_limited').length, 5);
  assert.equal(await call('no-ip','no-ip-contact',null), 'created');
  const before = await count('leads');
  await assert.rejects(call('invalid-envelope','invalid-contact',null,{...payload,contact_consent:false}));
  await assert.rejects(call('constraint-failure','invalid-contact',null,{...payload,contact_consent_version:''}));
  assert.equal(await count('leads'),before);
  // Force failure after inserting the lead, before recording its receipt.
  await pool.query(`create function public.qa_receipt_failure() returns trigger language plpgsql as $$ begin raise exception 'synthetic receipt failure'; end; $$;
    create trigger qa_receipt_failure before insert on public.human_lead_receipts for each row execute function public.qa_receipt_failure();`);
  await assert.rejects(call('atomic-failure','atomic-contact',null));
  assert.equal(await count('leads'),before,'Receipt failure must roll back the lead');
  await pool.query('drop trigger qa_receipt_failure on public.human_lead_receipts; drop function public.qa_receipt_failure();');
  assert.equal(await call('atomic-failure','atomic-contact',null),'created','Failed transaction leaves no false-success receipt');
  await pool.query(`update public.human_lead_receipts set created_at=now()-interval '2 hours' where contact_hash=$1`,[hash('quota-contact')]);
  assert.equal(await call('new-after-window','quota-contact','quota-ip'),'created');
  const roles = await pool.query(`select has_function_privilege('anon','public.record_human_lead(text,text,text,jsonb)','execute') as anon, has_function_privilege('authenticated','public.record_human_lead(text,text,text,jsonb)','execute') as authenticated`);
  assert.equal(roles.rows[0].anon,false); assert.equal(roles.rows[0].authenticated,false);
  await pool.query(fs.readFileSync(path.join(__dirname,'../supabase/migrations/20261021035542_restrict_public_human_lead_writes.sql'),'utf8'));
  const writer = await pool.connect();
  try {
    await writer.query('set role anon');
    await assert.rejects(writer.query("insert into public.leads(name) values('Synthetic forbidden writer')"), error => error.code === '42501');
  } finally { await writer.query('reset role'); writer.release(); }
  assert.equal(await call('after-restriction','after-restriction-contact',null),'created','Service RPC survives public-write removal');
  const receiptCount = await count('human_lead_receipts');
  await pool.query('delete from public.leads where id=(select lead_id from public.human_lead_receipts limit 1)');
  assert.equal(await count('human_lead_receipts'),receiptCount-1,'Deleting a lead also deletes its receipt');
  console.log('Disposable Postgres integration passed: 12 racing duplicates, contact/IP quota races, retry-at-quota, missing IP, validation/storage rollback and permissions.');
}
run().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>pool.end());

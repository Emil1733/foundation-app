/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, requireMock = require, env = {}) {
  const loaded = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { module: loaded, exports: loaded.exports, require: requireMock, process: { env }, console: { error() {} }, Date, URL, AbortSignal }, { filename: file });
  return loaded.exports;
}
const hashes = load('lib/leadIntegrity.ts').leadIntegrityHashes;
const attribution = load('lib/leadAttribution.ts');
const validation = load('lib/leadValidation.ts', id => id === './leadAttribution' ? attribution : require(id));
const input = { name: 'Test Homeowner', email: 'test@example.invalid', phone: '5125550100', address: '123 Synthetic Street', zip: '78613', symptoms: ['doors','cracks_wall'], notes: '', tcpaConsent: true, source: 'hero_form' };
const normalized = validation.validateLeadSubmission(input).data;
const first = hashes(normalized, '192.0.2.1', 'synthetic-test-secret');
assert.match(first.payload, /^[a-f0-9]{64}$/);
assert.notEqual(first.payload, first.contact);
assert.equal(hashes({ ...normalized, source: 'web_intake', symptoms: ['cracks_wall','doors'] }, '192.0.2.2', 'synthetic-test-secret').payload, first.payload);
assert.notEqual(hashes({ ...normalized, notes: 'New concern' }, null, 'synthetic-test-secret').payload, first.payload);
assert.notEqual(hashes(normalized, null, 'rotated-secret').contact, first.contact);
assert.equal(hashes(normalized, null, 'synthetic-test-secret').ip, null);
let mode = 'created', calls = 0, captured;
const action = (hasSecret = true) => load('app/book-analysis/actions.ts', id => {
  if (id === '@supabase/supabase-js') return { createClient: (_url, key, options) => {
    assert.equal(key, 'synthetic-server-secret');
    assert.equal(options.auth.persistSession, false);
    return { rpc: (name, args) => ({ abortSignal: async signal => {
      assert.ok(signal, 'Storage request has a deadline');
      calls++; assert.equal(name, 'record_human_lead'); captured = args;
      if (mode === 'throw') throw Error('network');
      if (mode === 'error') return { error: { code: 'XX000', details: 'must not reach client' } };
      return { data: mode, error: null };
    } }) };
  } };
  if (id === 'next/headers') return { headers: async () => ({ get: name => ({ 'x-forwarded-for': '192.0.2.1', referer: 'https://foundationrisk.org/services/foundation-repair/cedar-park-tx?private=ignored' })[name] || null }) };
  if (id === 'node:net') return require(id);
  if (id === '@/lib/leadIntegrity') return { leadIntegrityHashes: hashes };
  if (id === '@/lib/commercialSeoTreatments') return { getCommercialSeoTreatment: () => ({ cohort: 'initial' }) };
  if (id === '@/lib/leadConsent') return { CONTACT_CONSENT_TEXT: 'Synthetic consent text', CONTACT_CONSENT_VERSION: 'test-v1' };
  if (id === '@/lib/leadValidation') return validation;
  throw Error(`Unexpected import ${id}`);
}, { NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid', ...(hasSecret ? { SUPABASE_SERVICE_ROLE_KEY: 'synthetic-server-secret' } : {}), NEXT_PUBLIC_SUPABASE_ANON_KEY: 'must-not-be-used' }).submitLead;
async function run() {
  const submit = action();
  assert.equal((await submit({ ...input, tcpaConsent: false })).success, false);
  assert.equal(calls, 0);
  assert.equal((await action(false)(input)).success, false);
  assert.equal(calls, 0, 'Never fall back to anonymous credentials');
  for (const result of ['created','duplicate']) { mode = result; assert.equal((await submit(input)).success, true); }
  assert.equal(captured.p_lead.contact_consent, true);
  assert.equal(captured.p_lead.contact_consent_version, 'test-v1');
  assert.equal(captured.p_lead.source, 'hero_form');
  assert.equal(captured.p_lead.consent_source_path, '/services/foundation-repair/cedar-park-tx');
  for (const result of ['rate_limited','error','throw','unknown',null]) {
    mode = result; const response = await submit(input);
    assert.equal(response.success, false);
    assert.ok(!JSON.stringify(response).includes('must not reach client'));
  }
  console.log('Lead action regressions passed: validation, HMAC normalization, retries, quotas, missing config, unknown responses and storage/network failure.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });

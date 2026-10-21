/* eslint-disable @typescript-eslint/no-require-imports -- Standalone mocked route regression. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
globalThis.AsyncLocalStorage ??= require('node:async_hooks').AsyncLocalStorage;
const { NextRequest, NextResponse } = require('next/server');
let queries = 0, mode = 'ok', selectedSlug;
const loaded = { exports: {} };
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../app/api/agent/soil-data/route.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
vm.runInNewContext(code, {
  exports: loaded.exports, module: loaded, console,
  process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-placeholder', SUPABASE_SERVICE_ROLE_KEY: 'server-placeholder' } },
  require: id => {
    if (id === 'next/server') return { NextResponse, after: () => { throw Error('Unrecognized test user agent must not write analytics'); } };
    if (id === '@supabase/supabase-js') return { createClient: (_url, key) => ({
      from: table => {
        assert.equal(key, 'public-placeholder', 'Public reads must not use service credentials');
        assert.equal(table, 'target_locations');
        queries++;
        return { select: () => ({ eq: (_column, slug) => {
          selectedSlug = slug;
          return { single: async () => mode === 'missing'
            ? { data: null, error: { code: 'PGRST116' } }
            : mode === 'failure' ? { data: null, error: { code: 'other' } }
              : { data: { city: 'Cedar Park', state: 'TX', soil_cache: [{ map_unit_name: 'Synthetic unit', plasticity_index: null, risk_level: 'Not classified' }] }, error: null } };
        } }) };
      },
    }) };
    throw Error(`Unexpected import: ${id}`);
  },
});
async function call(query = '', slug, accept = 'application/json') {
  return loaded.exports.GET(new NextRequest(`https://foundationrisk.org/api/agent/soil-data${query}`, { headers: { accept, 'user-agent': 'Release-test' } }), { params: Promise.resolve(slug === undefined ? {} : { slug }) });
}
function privateResponse(response) {
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(response.headers.get('vary'), 'Accept');
}
async function run() {
  // Next does not supply dynamic params for the original static query route.
  const direct = await loaded.exports.GET(new NextRequest('https://foundationrisk.org/api/agent/soil-data?slug=cedar-park-tx'), { params: undefined });
  assert.equal(direct.status, 200);
  for (const [query, slug] of [['?slug=cedar-park-tx', undefined], ['', 'cedar-park-tx'], ['?slug=other-city-tx', 'cedar-park-tx'], ['', 'cedar-park-tx-soil-analysis']]) {
    const response = await call(query, slug);
    assert.equal(response.status, 200);
    assert.equal(selectedSlug, 'cedar-park-tx');
    assert.equal((await response.json()).city, 'Cedar Park');
    privateResponse(response);
  }
  const markdown = await call('', 'cedar-park-tx', 'text/markdown');
  assert.match(await markdown.text(), /^# Foundation Soil Context - Cedar Park, TX/);
  privateResponse(markdown);
  const before = queries;
  for (const slug of ['', '../invalid', 'a'.repeat(101)]) {
    const response = await call('', slug);
    assert.equal(response.status, 400);
    privateResponse(response);
  }
  assert.equal(queries, before, 'Invalid slugs must not query the database');
  mode = 'missing';
  assert.equal((await call('', 'cedar-park-tx')).status, 404);
  mode = 'failure';
  const failure = await call('', 'cedar-park-tx');
  assert.equal(failure.status, 503);
  privateResponse(failure);
  console.log('Agent representations passed: path/query precedence, suffix, validation, private cache headers, public-only reads and error statuses; no network or writes.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });

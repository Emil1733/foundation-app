/* eslint-disable @typescript-eslint/no-require-imports -- Standalone mocked route regression test. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

let mode = 'success', calls = 0;
function route(file) {
  const loaded = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(code, {
    module: loaded, exports: loaded.exports, URLSearchParams, AbortSignal, Error,
    console: { error() {} },
    fetch: async (_url, options) => {
      calls++;
      assert.ok(options.signal, 'Upstream fetch must have a deadline');
      if (mode === 'timeout') throw Object.assign(new Error('synthetic'), { name: 'TimeoutError' });
      return { ok: mode !== 'failure', status: 503, json: async () => [{ lat: '30', lon: '-97' }] };
    },
    require: id => {
      if (id === 'next/server') return { NextResponse: { json: (body, options = {}) => ({ body, status: options.status || 200 }) } };
      if (id === '@/lib/usdaSoil') return { buildUsdaSoilQuery: () => 'synthetic query', aggregateUsdaSoilTable: () => ({ plasticity_index: null, shrink_swell: 0 }) };
      throw Error(`Unexpected import: ${id}`);
    },
  }, { filename: file });
  return loaded.exports.POST;
}
async function run() {
  const geo = route('app/api/geocode/route.ts');
  const soil = route('app/api/soil/route.ts');
  assert.equal((await geo({ json: async () => ({ address: 'test' }) })).status, 400);
  assert.equal((await soil({ json: async () => ({ lat: null, lon: -97 }) })).status, 400);
  assert.equal(calls, 0, 'Invalid requests must not reach providers');
  mode = 'timeout';
  assert.equal((await geo({ json: async () => ({ address: 'Synthetic test address' }) })).status, 504);
  assert.equal((await soil({ json: async () => ({ lat: 30, lon: -97 }) })).status, 504);
  mode = 'failure';
  assert.equal((await geo({ json: async () => ({ address: 'Synthetic test address' }) })).status, 502);
  assert.equal((await soil({ json: async () => ({ lat: 30, lon: -97 }) })).status, 502);
  mode = 'success';
  const success = await soil({ json: async () => ({ lat: 30, lon: -97 }) });
  assert.equal(success.status, 200);
  assert.equal(success.body.plasticity_index, null);
  assert.equal(success.body.shrink_swell, 0);
  console.log('Lookup route regressions passed: pre-validation, deadlines, timeouts, upstream failures, null and zero propagation. No external requests made.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });

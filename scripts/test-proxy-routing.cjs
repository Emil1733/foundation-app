/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression test loads the actual TypeScript proxy. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
globalThis.AsyncLocalStorage ??= require('node:async_hooks').AsyncLocalStorage;
const { NextRequest } = require('next/server');
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../proxy.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const loaded = { exports: {} };
new Function('exports', 'require', 'module', compiled)(loaded.exports, require, loaded);
const { proxy } = loaded.exports;
const origin = 'https://foundationrisk.org';
let cases = 0;
for (const accept of ['text/html', 'application/json', 'text/markdown']) {
  for (const base of ['/learn', '/locations/texas']) {
    for (const page of ['1', '2']) {
      const response = proxy(new NextRequest(`${origin}${base}?page=${page}&utm_source=test`, { headers: { accept } }));
      assert.equal(response.status, 308);
      assert.equal(response.headers.get('location'), `${origin}${base}${page === '1' ? '' : '/page/2'}?utm_source=test`);
      cases++;
    }
    for (const page of ['0', '-1', '1.5', 'no', '9007199254740992']) {
      const response = proxy(new NextRequest(`${origin}${base}?page=${page}`, { headers: { accept } }));
      assert.equal(response.headers.get('location'), null);
      assert.equal(new URL(response.headers.get('x-middleware-rewrite')).pathname, `${base}/page/__invalid__`);
      cases++;
    }
  }
  for (const pathname of ['/services/foundation-repair/cedar-park-tx', '/learn/cedar-park-tx-soil-analysis']) {
    const response = proxy(new NextRequest(origin + pathname, { headers: { accept } }));
    const rewrite = response.headers.get('x-middleware-rewrite');
    if (accept === 'text/html') {
      assert.equal(rewrite, null);
      assert.equal(response.headers.get('x-middleware-next'), '1');
    } else {
      const destination = new URL(rewrite);
      assert.equal(destination.pathname, `/api/agent/soil-data/${pathname.split('/').pop()}`);
      assert.equal(destination.search, '');
    }
    cases++;
  }
  for (const pathname of ['/learn', '/learn/page/2', '/locations/texas', '/services/foundation-repair/cedar-park-tx/nested']) {
    const response = proxy(new NextRequest(origin + pathname, { headers: { accept } }));
    assert.equal(response.headers.get('x-middleware-rewrite'), null);
    assert.equal(response.headers.get('location'), null);
    cases++;
  }
}
console.log(`Proxy routing: ${cases} cases passed (pagination, invalid pages, HTML/machine separation and directory exclusion).`);

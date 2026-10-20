/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS test loads the transpiled Next config without adding a runtime dependency. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
// Next normally installs this during server bootstrap; standalone Node tests
// need the native implementation before importing its testing helpers.
globalThis.AsyncLocalStorage ??= require('node:async_hooks').AsyncLocalStorage;
const { unstable_getResponseFromNextConfig } = require('next/experimental/testing/server');

// Load the actual config without requiring a new TypeScript runtime dependency.
const source = fs.readFileSync(path.join(__dirname, '../next.config.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const configModule = { exports: {} };
new Function('exports', 'require', 'module', compiled)(configModule.exports, require, configModule);
const nextConfig = configModule.exports.default;
const origin = 'https://foundationrisk.org';

async function run() {
  for (const accept of ['text/html', 'application/json', 'text/markdown']) {
    const response = await unstable_getResponseFromNextConfig({
      url: `${origin}/services/foundation-repair/allen-tx-75002?utm_source=legacy`,
      nextConfig,
      headers: { accept },
    });
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), `${origin}/services/foundation-repair/allen-tx?utm_source=legacy`);
  }
  for (const pathname of [
    '/services/foundation-repair/allen-tx',
    '/services/foundation-repair/allen-tx-75002-extra',
    '/services/foundation-repair/allen-tx-75002/nested',
    '/learn/allen-tx-75002-soil-analysis',
  ]) {
    const response = await unstable_getResponseFromNextConfig({ url: origin + pathname, nextConfig });
    assert.equal(response.headers.get('location'), null, `Unexpected redirect: ${pathname}`);
  }
  console.log('Legacy Allen redirect: 7 assertions passed (permanent, query-preserving, all representations, no loop or broad matches).');
}
run().catch(error => { console.error(error); process.exitCode = 1; });

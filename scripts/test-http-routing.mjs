import assert from 'node:assert/strict';

// Read-only smoke checks against a running production build or deployed site.
// Deliberately never call booking, ingestion or external address lookup APIs.
const base = process.argv[2];
if (!base) throw new Error('Pass an explicit origin, e.g. http://localhost:3011');
const origin = new URL(base).origin;
if (!['localhost', '127.0.0.1', 'foundationrisk.org'].includes(new URL(origin).hostname)) {
  throw new Error('Only localhost or foundationrisk.org is allowed.');
}
async function get(path, accept = 'text/html') {
  const response = await fetch(origin + path, {
    headers: { accept, 'user-agent': 'FoundationRisk-Release-Smoke/1.0' },
    redirect: 'manual', signal: AbortSignal.timeout(30000),
  });
  const body = await response.text();
  console.log(JSON.stringify({ path, accept, status: response.status,
    type: response.headers.get('content-type'), cache: response.headers.get('cache-control'),
    edge: response.headers.get('x-vercel-cache'), age: response.headers.get('age') }));
  return { response, body };
}
const city = '/services/foundation-repair/cedar-park-tx';
for (const path of [city, '/learn/cedar-park-tx-soil-analysis']) {
  // Warm HTML, request alternate representations, then verify HTML again.
  for (const accept of ['text/html', 'application/json', 'text/markdown', 'text/html']) {
    const { response, body } = await get(path, accept);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get('content-type')?.includes(accept));
    if (accept === 'text/html') {
      assert.match(body, /<h1[\s>]/i);
      assert.match(body, /rel="canonical"/);
      assert.doesNotMatch(response.headers.get('cache-control') || '', /private|no-store/);
    } else {
      assert.match(response.headers.get('cache-control') || '', /private/);
      assert.match(response.headers.get('cache-control') || '', /no-store/);
      assert.match(response.headers.get('vary') || '', /accept/i);
      if (accept === 'application/json') assert.equal(JSON.parse(body).city, 'Cedar Park');
      else assert.match(body, /^# Foundation Soil Context - Cedar Park, TX/);
    }
  }
}
for (const path of [
  '/api/agent/soil-data?slug=cedar-park-tx',
  '/api/agent/soil-data/cedar-park-tx?slug=other-city-tx',
  `${city}?slug=other-city-tx`,
]) {
  const { response, body } = await get(path, 'application/json');
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(body).city, 'Cedar Park');
  assert.match(response.headers.get('cache-control') || '', /private.*no-store/);
}
for (const path of ['/', '/book-analysis', '/learn', '/learn/page/2', '/locations/texas', '/locations/texas/page/2']) {
  const { response, body } = await get(path, 'application/json');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /text\/html/);
  assert.match(body, /<h1[\s>]/i);
}
for (const [path, destination] of [
  ['/learn?page=2&utm_source=test', '/learn/page/2?utm_source=test'],
  ['/locations/texas?page=1', '/locations/texas'],
  ['/services/foundation-repair/allen-tx-75002?utm_source=test', '/services/foundation-repair/allen-tx?utm_source=test'],
]) {
  const { response } = await get(path);
  assert.equal(response.status, 308);
  const redirect = new URL(response.headers.get('location'), origin);
  assert.equal(redirect.pathname + redirect.search, destination);
}
for (const path of ['/learn/page/999999', '/locations/texas/page/999999']) {
  assert.equal((await get(path)).response.status, 404);
}
const sitemap = await get('/sitemap.xml', 'application/xml');
assert.equal(sitemap.response.status, 200);
assert.match(sitemap.body, /<sitemapindex/);
assert.match(sitemap.body, /https:\/\/foundationrisk\.org\/sitemaps\//);
const robots = await get('/robots.txt', 'text/plain');
assert.equal(robots.response.status, 200);
assert.match(robots.body, /Sitemap: https:\/\/foundationrisk\.org\/sitemap.xml/i);
console.log('Read-only HTTP smoke checks passed; no lead submissions or external address lookups.');

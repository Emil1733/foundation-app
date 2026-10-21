/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node regression test. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, extra = {}, mockedRequire = require) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(code, { module: loaded, exports: loaded.exports, require: mockedRequire, console, ...extra }, { filename: file });
  return loaded.exports;
}
const { formatSoilMeasurement } = load('lib/soilDisplay.ts');
for (const invalid of [null, undefined, '', '0', false, NaN, Infinity, -1, {}, []]) {
  assert.equal(formatSoilMeasurement(invalid), 'Not reported');
  assert.equal(formatSoilMeasurement(invalid, '%'), 'Not reported');
}
assert.equal(formatSoilMeasurement(0), '0.0');
assert.equal(formatSoilMeasurement(0, '%'), '0.0%');
assert.equal(formatSoilMeasurement(32.25), '32.3');

const storage = new Map();
let now = 1000000;
const sessionStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
const handoff = load('lib/evaluationHandoff.ts', { window: { sessionStorage }, Date: { now: () => now } });
handoff.saveEvaluationAddress('  123 Test Street  ');
assert.equal(handoff.takeEvaluationAddress(), '123 Test Street');
assert.equal(handoff.takeEvaluationAddress(), null, 'Read once');
handoff.saveEvaluationAddress('123 Test Street'); now += 600000;
assert.equal(handoff.takeEvaluationAddress(), null, 'Expires at 10 minutes');
handoff.saveEvaluationAddress('123 Test Street'); now -= 1;
assert.equal(handoff.takeEvaluationAddress(), null, 'Reject future timestamps');
handoff.saveEvaluationAddress('123 Test Street'); handoff.saveEvaluationAddress('bad');
assert.equal(handoff.takeEvaluationAddress(), null, 'Invalid new address clears old prefill');
storage.set('foundationrisk:evaluation-address:v1', '{bad');
assert.equal(handoff.takeEvaluationAddress(), null);
storage.set('foundationrisk:evaluation-address:v1', 'null');
assert.equal(handoff.takeEvaluationAddress(), null);
const blocked = load('lib/evaluationHandoff.ts', { window: { sessionStorage: { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); } } } });
assert.doesNotThrow(() => blocked.saveEvaluationAddress('123 Test Street'));
assert.equal(blocked.takeEvaluationAddress(), null);
assert.equal(load('lib/evaluationHandoff.ts').takeEvaluationAddress(), null, 'SSR safe');

// Exercise widget rendering, real click handlers and PDF text with mocked
// React state/network. No external lookup or production lead is submitted.
let state = [], cursor = 0, requests = 0, pdfText = [], failLookup = false;
const jsx = (type, props) => ({ type, props });
const react = {
  useState(initial) { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }]; },
  useRef(initial) { const i = cursor++; if (!(i in state)) state[i] = { current: initial }; return state[i]; },
};
class PdfMock extends require('jspdf').jsPDF {
  constructor() {
    super();
    const originalText = this.text.bind(this);
    this.text = (...args) => { pdfText.push(args[0]); return originalText(...args); };
    this.save = () => {
      if (process.env.SOIL_PDF_TEST_OUTPUT) fs.writeFileSync(process.env.SOIL_PDF_TEST_OUTPUT, Buffer.from(this.output('arraybuffer')));
    };
  }
}
const Widget = load('components/SoilRiskWidget.tsx', {
  AbortSignal, Date, Error,
  fetch: async () => {
    if (failLookup) throw Object.assign(new Error('timeout'), { name: 'TimeoutError' });
    requests++;
    if (requests % 2 === 1) return { ok: true, json: async () => ({ lat: 30, lon: -97 }) };
    return { ok: true, json: async () => ({ map_unit_name: 'Test mapped unit', plasticity_index: null, shrink_swell: 0 }) };
  },
}, id => {
  if (id === 'react') return react;
  if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx };
  if (id === 'lucide-react') return {};
  if (id === '@/lib/soilRisk') return load('lib/soilRisk.ts');
  if (id === '@/lib/soilDisplay') return { formatSoilMeasurement };
  if (id === '@/lib/evaluationHandoff') return handoff;
  if (id === 'jspdf') return { jsPDF: PdfMock };
  throw Error(`Unexpected import: ${id}`);
}).default;
function render() { cursor = 0; return Widget(); }
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(nodes);
  return [node, ...nodes(node.props?.children)];
}
async function run() {
  let tree = render();
  nodes(tree).find(n => n.type === 'input').props.onChange({ target: { value: '123 Test Street' } });
  tree = render();
  const lookup = nodes(tree).find(n => n.type === 'button').props.onClick;
  await Promise.all([lookup(), lookup()]);
  assert.equal(requests, 2, 'Repeated synchronous clicks make only one lookup pipeline');
  tree = render();
  const content = JSON.stringify(tree);
  assert.ok(content.includes('Not reported'));
  assert.ok(content.includes('0.0%'));
  const link = nodes(tree).find(n => n.type === 'a');
  assert.equal(link.props.href, '/book-analysis?source=soil_risk_widget');
  assert.ok(!link.props.href.includes('Test'));
  await nodes(tree).filter(n => n.type === 'button').at(-1).props.onClick();
  assert.ok(pdfText.includes('Plasticity Index: Not reported'));
  assert.ok(pdfText.includes('Shrink-Swell: 0.0%'));
  nodes(tree).find(n => n.type === 'input').props.onChange({ target: { value: '456 Different Street' } });
  assert.ok(!JSON.stringify(render()).includes('Test mapped unit'), 'Editing clears old results');
  failLookup = true;
  tree = render();
  await nodes(tree).find(n => n.type === 'button').props.onClick();
  tree = render();
  assert.ok(JSON.stringify(tree).includes('The soil lookup took too long.'));
  assert.equal(nodes(tree).find(n => n.type === 'a').props.href, '/book-analysis?source=soil_risk_widget');
  assert.equal(nodes(tree).find(n => n.type === 'input').props.disabled, false, 'Timeout releases input');
  console.log('Soil widget regressions passed: missing/zero values, PDF text, private handoff, TTL, blocked storage, SSR, duplicate lookup and stale-result clearing.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
